import asyncio
from typing import Any, AsyncGenerator

class Notifier:
    def __init__(self) -> None:
        self._subs: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subs.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subs.discard(q)

    async def publish(self, data: Any) -> None:
        for q in list(self._subs):
            try:
                q.put_nowait(data)
            except Exception:
                pass

notifier = Notifier()
