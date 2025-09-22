import os


def get_env_str(name: str, default: str) -> str:
    value = os.getenv(name, default)
    return value


def get_env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


AUTH_SECRET: str = get_env_str("AUTH_SECRET", "dev-hmac-secret-change-me")
JWT_SECRET: str = get_env_str("JWT_SECRET", "dev-jwt-secret-change-me")
DB_PATH: str = get_env_str("DB_PATH", "/workspace/data/auth.db")

# Authentication parameters
ROUNDS: int = get_env_int("ROUNDS", 3)
GRID_SIZE: int = get_env_int("GRID_SIZE", 16)  # must be >= SECRET_SIZE
SECRET_SIZE: int = get_env_int("SECRET_SIZE", 4)
JWT_EXPIRE_MINUTES: int = get_env_int("JWT_EXPIRE_MINUTES", 60)


# Emoji library (64 emojis)
EMOJI_LIBRARY: list[str] = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "🤩", "😏",
    "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠",
    "😡", "🤬", "🤯", "😳", "🥶", "🥵", "🤢", "🤮",
    "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😴", "🤤",
]

