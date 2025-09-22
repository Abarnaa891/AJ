import json
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from .config import DB_PATH


def _ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    _ensure_parent_dir(DB_PATH)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    _init_schema(conn)
    return conn


def _init_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            salt_hex TEXT NOT NULL,
            secret_hmac TEXT NOT NULL,
            sealed_secret TEXT,
            created_at TEXT NOT NULL
        );
        """
    )
    # Backfill sealed_secret column if missing (SQLite doesn't support IF NOT EXISTS in ALTER)
    cur.execute("PRAGMA table_info(users);")
    cols = [row[1] for row in cur.fetchall()]
    if "sealed_secret" not in cols:
        try:
            cur.execute("ALTER TABLE users ADD COLUMN sealed_secret TEXT;")
        except Exception:
            pass
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            rounds_total INTEGER NOT NULL,
            current_round INTEGER NOT NULL,
            rounds_json TEXT NOT NULL,
            is_active INTEGER NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(username) REFERENCES users(username)
        );
        """
    )
    conn.commit()


# User operations
def create_user(
    conn: sqlite3.Connection,
    username: str,
    salt_hex: str,
    secret_hmac: str,
    sealed_secret: str,
) -> None:
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO users (username, salt_hex, secret_hmac, sealed_secret, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (username, salt_hex, secret_hmac, sealed_secret, datetime.utcnow().isoformat()),
    )
    conn.commit()


def get_user(conn: sqlite3.Connection, username: str) -> Optional[sqlite3.Row]:
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = ?", (username,))
    return cur.fetchone()


# Session operations
def create_session(
    conn: sqlite3.Connection,
    session_id: str,
    username: str,
    rounds_total: int,
    rounds: list[Dict[str, Any]],
    ttl_minutes: int = 10,
) -> None:
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO sessions (
            session_id, username, rounds_total, current_round, rounds_json,
            is_active, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            username,
            rounds_total,
            0,
            json.dumps(rounds),
            1,
            (datetime.utcnow() + timedelta(minutes=ttl_minutes)).isoformat(),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()


def get_session(conn: sqlite3.Connection, session_id: str) -> Optional[sqlite3.Row]:
    cur = conn.cursor()
    cur.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
    return cur.fetchone()


def update_session_current_round(conn: sqlite3.Connection, session_id: str, new_round_index: int) -> None:
    cur = conn.cursor()
    cur.execute(
        "UPDATE sessions SET current_round = ? WHERE session_id = ?",
        (new_round_index, session_id),
    )
    conn.commit()


def deactivate_session(conn: sqlite3.Connection, session_id: str) -> None:
    cur = conn.cursor()
    cur.execute("UPDATE sessions SET is_active = 0 WHERE session_id = ?", (session_id,))
    conn.commit()

