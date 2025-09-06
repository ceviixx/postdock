from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, DateTime
from datetime import datetime

Base = declarative_base()

class Mail(Base):
    __tablename__ = "mails"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    message_id: Mapped[str] = mapped_column(String(255), index=True)
    from_addr: Mapped[str] = mapped_column(String(320), index=True)
    to_addrs: Mapped[str] = mapped_column(Text)
    subject: Mapped[str] = mapped_column(Text, index=True)
    date: Mapped[datetime] = mapped_column(DateTime, index=True, default=datetime.utcnow)
    raw: Mapped[str] = mapped_column(Text)
    size = mapped_column(Integer)
    is_spam: Mapped[bool] = mapped_column(Integer, default=0)
    
