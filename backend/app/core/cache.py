"""Enterprise In-Memory TTL Cache for AI results & catalog lookups."""
import hashlib
import json
import time
from typing import Any


class MemoryCache:
    """Thread-safe, TTL-based in-memory cache manager."""

    def __init__(self, default_ttl_seconds: int = 300):
        self._cache: dict[str, tuple[float, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def _hash_key(self, key_prefix: str, data: Any) -> str:
        serialized = json.dumps(data, sort_keys=True, default=str)
        hashed = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        return f"{key_prefix}:{hashed}"

    def get(self, key: str) -> Any | None:
        if key not in self._cache:
            return None
        expires_at, val = self._cache[key]
        if time.time() > expires_at:
            del self._cache[key]
            return None
        return val

    def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = time.time() + ttl
        self._cache[key] = (expires_at, value)

    def clear(self) -> None:
        self._cache.clear()


ai_cache = MemoryCache(default_ttl_seconds=600)  # 10 minute AI cache
catalog_cache = MemoryCache(default_ttl_seconds=1800)  # 30 minute catalog cache
