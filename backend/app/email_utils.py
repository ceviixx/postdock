from email import message_from_string
from email.message import Message
from email.policy import default
from typing import Dict, List, Tuple, Optional
import re

def parse_headers(raw: str) -> Dict[str, str]:
    msg: Message = message_from_string(raw, policy=default)
    return {k: v for (k, v) in msg.items()}

def walk_parts(raw: str) -> List[Message]:
    msg: Message = message_from_string(raw, policy=default)
    parts: List[Message] = []
    if msg.is_multipart():
        for p in msg.walk():
            if p.get_content_maintype() == "multipart":
                continue
            parts.append(p)
    else:
        parts = [msg]
    return parts

def extract_bodies_and_attachments(raw: str, mail_id: int, base_path: str = ""):
    text: Optional[str] = None
    html: Optional[str] = None
    attachments = []
    cid_map: Dict[str, str] = {}

    parts = walk_parts(raw)
    for idx, p in enumerate(parts):
        ctype = p.get_content_type()
        disp = (p.get("Content-Disposition") or "").lower()
        cid = p.get("Content-ID")
        filename = p.get_filename()
        payload = p.get_payload(decode=True) or b""
        psize = len(payload)
        
        is_inline = "inline" in disp or bool(cid) or ctype.startswith("image/")

        print(f"Part {idx}: ctype={ctype}, disp={disp}, cid={cid}, filename={filename}")

        if ctype == "text/plain" and text is None:
            try:
                text = payload.decode(p.get_content_charset() or "utf-8", errors="replace")
            except Exception:
                text = payload.decode("utf-8", errors="replace")

        elif ctype == "text/html" and html is None:
            try:
                html = payload.decode(p.get_content_charset() or "utf-8", errors="replace")
            except Exception:
                html = payload.decode("utf-8", errors="replace")

        else:
            attachments.append({
                "id": idx,
                "filename": filename,
                "content_type": ctype,
                "size": psize,
                "is_inline": is_inline,
                "content_id": cid.strip("<>") if cid else None,
            })
            if cid:
                cid_clean = cid.strip("<>")
                cid_map[cid_clean] = f"/mails/{mail_id}/inline/{cid_clean}"

    return text, html, attachments, cid_map

def find_part_by_id(raw: str, part_id: int) -> Tuple[str, bytes]:
    parts = walk_parts(raw)
    p = parts[part_id]
    ctype = p.get_content_type()
    payload = p.get_payload(decode=True) or b""
    return ctype, payload

def find_part_by_cid(raw: str, cid: str) -> Tuple[str, bytes]:
    cid_norm = cid.strip("<>")
    for p in walk_parts(raw):
        this_cid = p.get("Content-ID")
        if this_cid and this_cid.strip("<>") == cid_norm:
            ctype = p.get_content_type()
            payload = p.get_payload(decode=True) or b""
            return ctype, payload
    return "application/octet-stream", b""
