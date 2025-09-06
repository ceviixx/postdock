from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from .models import Base, Mail
from datetime import datetime
import os

storage_mode = os.environ.get("STORAGE", "MEMORY").upper()
if storage_mode == "MEMORY":
    DB_URL = "sqlite://"
    engine = create_engine(
        DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    DB_URL = "sqlite:///data/mails.db"
    engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(engine)

def save_mail(message_id, from_addr, to_addrs, subject, date, raw):
    size = len(raw.encode("utf-8")) if isinstance(raw, str) else len(raw)
    from .spam_detect import is_spam_mail
    spam = is_spam_mail(subject or "", raw or "")
    with SessionLocal() as s:
        mail = Mail(
            message_id=message_id or "",
            from_addr=from_addr or "",
            to_addrs=",".join(to_addrs or []),
            subject=subject or "",
            date=date or datetime.utcnow(),
            raw=raw or "",
            size=size,
            is_spam=1 if spam else 0,
        )
        s.add(mail)
        s.commit()
        s.refresh(mail)
        return mail.id

def list_mails(q: str | None = None, mailbox: str | None = None, limit: int = 100, offset: int = 0):
    with SessionLocal() as s:
        stmt = select(Mail).order_by(Mail.date.desc())
        if q:
            like = f"%{q}%"
            stmt = stmt.where(
                (Mail.subject.like(like)) |
                (Mail.from_addr.like(like)) |
                (Mail.to_addrs.like(like))
            )
        if mailbox:
            stmt = stmt.where(Mail.to_addrs.like(f"%{mailbox}%"))
        stmt = stmt.limit(limit).offset(offset)
        return [m for m in s.scalars(stmt)]
    
def get_all_mailboxes():
    with SessionLocal() as s:
        rows = s.execute(select(Mail.to_addrs)).scalars().all()
        mailboxes = set()
        for row in rows:
            for addr in (row or "").split(","):
                addr = addr.strip()
                if addr:
                    mailboxes.add(addr)
        return sorted(mailboxes)

def get_mail(mail_id: int):
    with SessionLocal() as s:
        return s.get(Mail, mail_id)

def delete_mail(mail_id: int):
    with SessionLocal() as s:
        s.execute(delete(Mail).where(Mail.id == mail_id))
        s.commit()

def assert_mail(subject_contains: str | None = None, to_addr: str | None = None):
    with SessionLocal() as s:
        stmt = select(Mail)
        if subject_contains:
            stmt = stmt.where(Mail.subject.like(f"%{subject_contains}%"))
        if to_addr:
            stmt = stmt.where(Mail.to_addrs.like(f"%{to_addr}%"))
        exists = s.execute(stmt.limit(1)).first()
        return bool(exists)

def clear_all_mails():
    with SessionLocal() as s:
        s.execute(delete(Mail))
        s.commit()
