from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List

class MailListItem(BaseModel):
    id: int
    from_addr: str
    subject: str
    date: datetime
    size: int
    is_spam: bool

class Attachment(BaseModel):
    id: int
    filename: Optional[str]
    content_type: str
    size: int
    is_inline: bool
    content_id: Optional[str]

class MailDetail(MailListItem):
    to_addrs: str
    raw: str
    headers: Dict[str, str]
    text: Optional[str] = None
    html: Optional[str] = None
    cid_map: Dict[str, str]
    attachments: List[Attachment]

class AssertQuery(BaseModel):
    subject_contains: str | None = None
    to_addr: str | None = None
