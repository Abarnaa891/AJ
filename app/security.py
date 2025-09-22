import hmac
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from itsdangerous import URLSafeSerializer, BadSignature
from jose import jwt

from .config import AUTH_SECRET, JWT_SECRET, JWT_EXPIRE_MINUTES


def generate_salt_hex(num_bytes: int = 16) -> str:
    return secrets.token_hex(num_bytes)


def canonicalize_secret(emojis: list[str]) -> str:
    # Order-independent canonical form to avoid leaking order requirement
    return "|".join(sorted(emojis))


def compute_secret_hmac(canonical_secret: str, salt_hex: str) -> str:
    message = (salt_hex + ":" + canonical_secret).encode("utf-8")
    key = AUTH_SECRET.encode("utf-8")
    digest = hmac.new(key, message, hashlib.sha256).hexdigest()
    return digest


def create_access_token(claims: Dict[str, Any], expires_minutes: int | None = None) -> str:
    expire_delta = timedelta(minutes=expires_minutes or JWT_EXPIRE_MINUTES)
    expire = datetime.now(tz=timezone.utc) + expire_delta
    to_encode = claims.copy()
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return token


def _get_secret_serializer() -> URLSafeSerializer:
    return URLSafeSerializer(AUTH_SECRET, salt="emoji-secret")


def seal_secret(canonical_secret: str) -> str:
    s = _get_secret_serializer()
    return s.dumps({"secret": canonical_secret})


def unseal_secret(sealed: str) -> str:
    s = _get_secret_serializer()
    data = s.loads(sealed)
    secret = data.get("secret")
    if not isinstance(secret, str):
        raise BadSignature("Invalid secret payload")
    return secret

