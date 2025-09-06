from .storage import engine, storage_mode
from sqlalchemy import text

def get_db_status_and_size():
    db_type = "Memory" if storage_mode == "MEMORY" else "SQLite"
    size_bytes = None
    try:
        with engine.connect() as conn:
            page_count = conn.execute(text("PRAGMA page_count")).scalar()
            page_size = conn.execute(text("PRAGMA page_size")).scalar()
            if page_count is not None and page_size is not None:
                size_bytes = page_count * page_size
    except Exception:
        pass
    return {"type": db_type, "size_bytes": size_bytes}
