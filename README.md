# Thought-Based Authentication (Emoji Cognitive Auth)

Prototype cognitive authentication system where users register a secret set of emojis and authenticate by identifying them across randomized grids over several rounds.

## Features

- Registration with a secret set of emojis (default 4 out of 64)
- Challenge–response login: select your secret emojis across multiple randomized grids
- Server-side verification with per-user salt and server HMAC key
- JWT issued on successful authentication
- Minimal static frontend served by the backend

## Tech Stack

- FastAPI (Python)
- SQLite (embedded DB)
- Vanilla JS frontend

## Getting Started

1. Create and activate a Python 3.10+ environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. (Optional) Set environment variables (defaults work for local):

```bash
export AUTH_SECRET="change-this-hmac-key"
export JWT_SECRET="change-this-jwt-key"
export DB_PATH="/workspace/data/auth.db"
export ROUNDS=3
export GRID_SIZE=16
export SECRET_SIZE=4
```

4. Run the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

5. Open the UI at `http://localhost:8000/`.

## Notes

- This is a prototype for educational purposes and not production-hardened. Consider shoulder surfing, replay protection, rate limiting, and advanced privacy considerations for real deployments.

