from fastapi.responses import Response as FastAPIResponse
from collections import Counter, defaultdict
from typing import Set
from .storage import get_all_mailboxes
from fastapi import FastAPI, HTTPException, Request, Response
from .storage import init_db, list_mails, get_mail, delete_mail, assert_mail, clear_all_mails
from .email_utils import parse_headers, extract_bodies_and_attachments, find_part_by_id, find_part_by_cid
from .schemas import MailListItem, MailDetail, AssertQuery, Attachment
from .smtp_server import start_smtp
import logging
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from .notifier import notifier
import asyncio
import json
import time, os, smtplib, socket
from pathlib import Path

known_mailboxes: Set[str] = set()
def update_known_mailboxes():
    global known_mailboxes
    known_mailboxes = set(get_all_mailboxes())

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("postdock")

app = FastAPI(title="PostDock API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/events")
async def events(request: Request, mailbox: str | None = None):
    q = notifier.subscribe()
    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    item = await asyncio.wait_for(q.get(), timeout=15)
                    if mailbox:
                        mail_to = item.get("to_addrs")
                        if not mail_to or mailbox not in mail_to:
                            continue
                    yield {"event": "mail_saved", "data": json.dumps(item)}
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": "keepalive"}
        finally:
            notifier.unsubscribe(q)
    return EventSourceResponse(gen())

@app.get("/mailboxes/events")
async def mailboxes_events(request: Request):
    q = notifier.subscribe()
    async def gen():
        last_mailboxes = set(get_all_mailboxes())
        yield {"event": "mailboxes", "data": json.dumps(sorted(last_mailboxes))}
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    item = await asyncio.wait_for(q.get(), timeout=30)
                    all_boxes = set(get_all_mailboxes())
                    if all_boxes != last_mailboxes:
                        last_mailboxes = all_boxes
                        yield {"event": "mailboxes", "data": json.dumps(sorted(all_boxes))}
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": "keepalive"}
        finally:
            notifier.unsubscribe(q)
    return EventSourceResponse(gen())

@app.on_event("startup")
def startup():
    from .storage import init_db
    init_db()
    log.info("Starting SMTP on 0.0.0.0:2525")
    from .smtp_server import start_smtp
    start_smtp(host="0.0.0.0", port=2525)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/full")
def health_full():
    smtp_ok = False
    smtp_latency_ms = None
    smtp_banner = None
    smtp_error = None
    start = time.perf_counter()
    try:
        with smtplib.SMTP(host="127.0.0.1", port=2525, timeout=2) as s:
            code, banner = s.docmd("NOOP")
            smtp_ok = 200 <= code < 400
            smtp_banner = banner.decode(errors="replace") if isinstance(banner, (bytes, bytearray)) else str(banner)
        smtp_latency_ms = int((time.perf_counter() - start) * 1000)
    except Exception as e:
        smtp_error = str(e)

    from .db_utils import get_db_status_and_size
    db_info = get_db_status_and_size()
    db_ok = db_info["size_bytes"] is not None

    return {
        "status": "ok",
        "smtp": {
            "ok": smtp_ok,
            "latency_ms": smtp_latency_ms,
            "banner": smtp_banner,
            "error": smtp_error,
        },
        "db": {
            "ok": db_ok,
            "type": db_info["type"],
            "size_bytes": db_info["size_bytes"],
        },
    }

@app.get("/mails", response_model=list[MailListItem])
def mails(q: str | None = None, mailbox: str | None = None, limit: int = 100, offset: int = 0):
    return [
        MailListItem(
            id=m.id,
            from_addr=m.from_addr,
            subject=m.subject,
            date=m.date,
            size=m.size,
            is_spam=bool(getattr(m, "is_spam", False)),
        )
        for m in list_mails(q=q, mailbox=mailbox, limit=limit, offset=offset)
    ]

@app.get("/mailboxes", response_model=list[str])
def mailboxes():
    return sorted(get_all_mailboxes())

@app.get("/mails/{mail_id}", response_model=MailDetail)
def mail_detail(mail_id: int):
    m = get_mail(mail_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")

    headers = parse_headers(m.raw)
    text, html, atts, cid_map = extract_bodies_and_attachments(m.raw, mail_id)

    return MailDetail(
        id=m.id,
        from_addr=m.from_addr,
        subject=m.subject,
        date=m.date,
        size=m.size,
        is_spam=bool(getattr(m, "is_spam", False)),
        to_addrs=m.to_addrs,
        raw=m.raw,
        headers=headers,
        text=text,
        html=html,
        cid_map=cid_map,
        attachments=[Attachment(**a) for a in atts],
    )

@app.get("/mails/{mail_id}/part/{part_id}")
def mail_part(mail_id: int, part_id: int):
    m = get_mail(mail_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    ctype, data = find_part_by_id(m.raw, part_id)
    return Response(content=data, media_type=ctype)

@app.get("/api/mails/{mail_id}/inline/{cid}")
def mail_inline(mail_id: int, cid: str):
    m = get_mail(mail_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    ctype, data = find_part_by_cid(m.raw, cid)
    if not data:
        raise HTTPException(status_code=404, detail="inline not found")
    return Response(content=data, media_type=ctype)

@app.delete("/api/mails/{mail_id}")
def mail_delete(mail_id: int):
    delete_mail(mail_id)
    return {"deleted": True}

@app.post("/mails/assert")
def mail_assert(payload: AssertQuery):
    ok = assert_mail(subject_contains=payload.subject_contains, to_addr=payload.to_addr)
    return {"assert": ok}

@app.delete("/api/mails")
def mails_delete_all():
    clear_all_mails()
    return {"deleted": "all"}

@app.get("/api/mails/{mail_id}/attachments/{attachment_id}")
def download_attachment(mail_id: int, attachment_id: int):
    m = get_mail(mail_id)
    if not m:
        raise HTTPException(status_code=404, detail="Mail not found")
    _, _, attachments, _ = extract_bodies_and_attachments(m.raw, mail_id)
    att = next((a for a in attachments if a["id"] == attachment_id), None)
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    ctype, payload = find_part_by_id(m.raw, attachment_id)
    return Response(
        content=payload,
        media_type=ctype,
        headers={
            "Content-Disposition": f'attachment; filename="{att.get("filename", "attachment")}"'
        }
    )

@app.get("/stats")
def stats():
    mails = list_mails(limit=10000, offset=0)
    total = len(mails)
    recipients = set()
    for m in mails:
        for addr in (m.to_addrs or "").split(","):
            addr = addr.strip()
            if addr:
                recipients.add(addr)
    recipient_count = len(recipients)

    by_day = defaultdict(int)
    for m in mails:
        key = str(m.date)[:10]
        by_day[key] += 1
    timeline = sorted(by_day.items())
    avg_per_day = round(total / len(timeline), 2) if timeline else 0

    max_size = 0
    for m in mails:
        if m.size and m.size > max_size:
            max_size = m.size

    last_mail = max(mails, key=lambda m: m.date) if mails else None

    sender_counter = Counter(m.from_addr for m in mails)
    top_senders = sender_counter.most_common(5)

    subject_counter = Counter(m.subject for m in mails)
    top_subjects = subject_counter.most_common(5)

    with_attachment = 0
    for m in mails:
        try:
            _, _, atts, _ = extract_bodies_and_attachments(m.raw, m.id)
            if atts and len(atts) > 0:
                with_attachment += 1
        except Exception:
            pass

    return {
        "total": total,
        "recipients": recipient_count,
        "avg_per_day": avg_per_day,
        "max_size": max_size,
        "last_mail": str(last_mail.date) if last_mail else None,
        "top_senders": top_senders,
        "top_subjects": top_subjects,
        "timeline": timeline,
        "with_attachment": with_attachment,
    }

@app.get("/api/mails/{mail_id}/download")
def download_mail_raw(mail_id: int):
    m = get_mail(mail_id)
    if not m:
        raise HTTPException(status_code=404, detail="Mail not found")
    filename = f"mail-{mail_id}.eml"
    return FastAPIResponse(
        content=m.raw,
        media_type="message/rfc822",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )