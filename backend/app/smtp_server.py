from aiosmtpd.controller import Controller
from email.parser import BytesParser
from email.policy import default
from .storage import save_mail
from datetime import datetime
import logging
from .notifier import notifier

log = logging.getLogger("postdock.smtp")

class SaveHandler:
    async def handle_DATA(self, server, session, envelope):
        try:
            raw_bytes = envelope.content if isinstance(envelope.content, (bytes, bytearray)) else bytes(envelope.content or "", "utf-8")
            msg = BytesParser(policy=default).parsebytes(raw_bytes)
            subject = msg.get("Subject", "") or ""
            message_id = msg.get("Message-ID", "") or ""
            date_hdr = msg.get("Date")
            try:
                from email.utils import parsedate_to_datetime
                date = parsedate_to_datetime(date_hdr) if date_hdr else datetime.utcnow()
            except Exception:
                date = datetime.utcnow()

            mail_id = save_mail(
                message_id=message_id,
                from_addr=envelope.mail_from or "",
                to_addrs=envelope.rcpt_tos or [],
                subject=subject,
                date=date,
                raw=raw_bytes.decode(errors="replace"),
            )
            log.info("Saved mail id=%s from=%s subject=%r rcpt=%s", mail_id, envelope.mail_from, subject, envelope.rcpt_tos)
            await notifier.publish({"type": "mail_saved", "id": mail_id})
            return "250 Message accepted for delivery"
        except Exception as e:
            log.exception("Error saving mail: %s", e)
            return "451 Temporary processing error"

def start_smtp(host="0.0.0.0", port=2525):
    controller = Controller(SaveHandler(), hostname=host, port=port, decode_data=False)
    controller.start()
    return controller
