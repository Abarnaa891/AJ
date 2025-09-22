from __future__ import annotations

import secrets
from typing import Any, Dict, List, Set

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr

from .config import EMOJI_LIBRARY, GRID_SIZE, ROUNDS, SECRET_SIZE
from .security import (
    canonicalize_secret,
    compute_secret_hmac,
    create_access_token,
    generate_salt_hex,
    seal_secret,
    unseal_secret,
)
from .db import (
    get_connection,
    create_user,
    get_user,
    create_session,
    get_session,
    update_session_current_round,
    deactivate_session,
)


app = FastAPI(title="Thought-Based Auth (Emoji)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="/workspace/static"), name="static")


# Pydantic models
class RegisterRequest(BaseModel):
    username: constr(strip_whitespace=True, min_length=3, max_length=50)
    emojis: List[str] = Field(min_length=SECRET_SIZE, max_length=SECRET_SIZE)


class RegisterResponse(BaseModel):
    message: str


class LoginStartRequest(BaseModel):
    username: constr(strip_whitespace=True, min_length=3, max_length=50)


class RoundDescriptor(BaseModel):
    round_index: int
    grid: List[str]


class LoginStartResponse(BaseModel):
    session_id: str
    rounds_total: int
    current_round: int
    round: RoundDescriptor


class RoundSubmitRequest(BaseModel):
    session_id: str
    selections: List[str]


class NextRoundResponse(BaseModel):
    session_id: str
    rounds_total: int
    current_round: int
    round: RoundDescriptor


class AuthSuccessResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def _validate_emojis(emojis: List[str]) -> List[str]:
    unique = list(dict.fromkeys(emojis))
    if len(unique) != SECRET_SIZE:
        raise HTTPException(status_code=400, detail="Duplicate emojis not allowed")
    for e in unique:
        if e not in EMOJI_LIBRARY:
            raise HTTPException(status_code=400, detail="Unknown emoji in selection")
    return unique


def _generate_round_grid(secret_emojis: List[str]) -> List[str]:
    if GRID_SIZE < len(secret_emojis):
        raise HTTPException(status_code=500, detail="GRID_SIZE must be >= SECRET_SIZE")
    distractor_pool = [e for e in EMOJI_LIBRARY if e not in secret_emojis]
    distractors_needed = GRID_SIZE - len(secret_emojis)
    distractors = secrets.SystemRandom().sample(distractor_pool, distractors_needed)
    grid = secret_emojis + distractors
    secrets.SystemRandom().shuffle(grid)
    return grid


@app.get("/")
def index() -> Any:
    return FileResponse("/workspace/static/index.html")


@app.get("/api/emojis")
def list_emojis() -> Dict[str, Any]:
    return {"library": EMOJI_LIBRARY, "secret_size": SECRET_SIZE, "grid_size": GRID_SIZE, "rounds": ROUNDS}


@app.post("/api/register", response_model=RegisterResponse)
def register(req: RegisterRequest) -> RegisterResponse:
    conn = get_connection()
    user = get_user(conn, req.username)
    if user is not None:
        raise HTTPException(status_code=400, detail="Username already exists")
    emojis = _validate_emojis(req.emojis)
    canonical = canonicalize_secret(emojis)
    salt_hex = generate_salt_hex()
    hmac_hex = compute_secret_hmac(canonical, salt_hex)
    sealed = seal_secret(canonical)
    create_user(conn, req.username, salt_hex, hmac_hex, sealed)
    return RegisterResponse(message="Registered")


@app.post("/api/login/start", response_model=LoginStartResponse)
def login_start(req: LoginStartRequest) -> LoginStartResponse:
    conn = get_connection()
    user = get_user(conn, req.username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    canonical = unseal_secret(user["sealed_secret"]) if user["sealed_secret"] else None
    if not canonical:
        raise HTTPException(status_code=500, detail="Server missing user secret")
    secret_emojis = canonical.split("|")
    rounds: List[Dict[str, Any]] = []
    for _ in range(ROUNDS):
        grid = _generate_round_grid(secret_emojis)
        rounds.append({"grid": grid})
    session_id = secrets.token_urlsafe(16)
    create_session(conn, session_id, req.username, ROUNDS, rounds)
    return LoginStartResponse(
        session_id=session_id,
        rounds_total=ROUNDS,
        current_round=0,
        round=RoundDescriptor(round_index=0, grid=rounds[0]["grid"]),
    )


@app.post("/api/login/round")
def submit_round(req: RoundSubmitRequest) -> Dict[str, Any]:
    conn = get_connection()
    sess = get_session(conn, req.session_id)
    if sess is None or sess["is_active"] == 0:
        raise HTTPException(status_code=400, detail="Invalid or inactive session")
    current_round = int(sess["current_round"])
    import json

    rounds = json.loads(sess["rounds_json"])  # type: ignore
    if current_round >= len(rounds):
        deactivate_session(conn, req.session_id)
        raise HTTPException(status_code=400, detail="Session already complete")

    user = get_user(conn, sess["username"])  # type: ignore
    if user is None:
        deactivate_session(conn, req.session_id)
        raise HTTPException(status_code=400, detail="User missing")
    canonical = unseal_secret(user["sealed_secret"]) if user["sealed_secret"] else None
    if not canonical:
        deactivate_session(conn, req.session_id)
        raise HTTPException(status_code=500, detail="Server missing user secret")
    secret_set: Set[str] = set(canonical.split("|"))

    # Validate selections are subset of grid to mitigate arbitrary values
    grid = rounds[current_round]["grid"]
    grid_set = set(grid)
    if not set(req.selections).issubset(grid_set):
        deactivate_session(conn, req.session_id)
        raise HTTPException(status_code=400, detail="Invalid selections")

    if set(req.selections) != secret_set:
        deactivate_session(conn, req.session_id)
        return {"success": False, "message": "Incorrect selection"}

    # Advance
    next_round_index = current_round + 1
    if next_round_index >= int(sess["rounds_total"]):
        deactivate_session(conn, req.session_id)
        token = create_access_token({"sub": user["username"]})  # type: ignore
        return {"success": True, "completed": True, "token": token, "token_type": "bearer"}

    update_session_current_round(conn, req.session_id, next_round_index)
    next_grid = rounds[next_round_index]["grid"]
    return {
        "success": True,
        "completed": False,
        "session_id": req.session_id,
        "rounds_total": int(sess["rounds_total"]),
        "current_round": next_round_index,
        "round": {"round_index": next_round_index, "grid": next_grid},
    }


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

