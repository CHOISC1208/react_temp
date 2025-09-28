import re
import sys
from datetime import datetime
from pathlib import Path


TEMPLATE = """-- Write your idempotent SQL here
"""


def sanitize(name: str) -> str:
    cleaned = re.sub(r"\s+", "_", name.strip().lower())
    return re.sub(r"[^a-z0-9_]+", "", cleaned)


def main(message: str) -> Path:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    slug = sanitize(message) if message else "migration"
    filename = f"{timestamp}_{slug}.sql"
    migrations_dir = Path(__file__).resolve().parent.parent / "migrations"
    migrations_dir.mkdir(parents=True, exist_ok=True)
    path = migrations_dir / filename
    path.write_text(TEMPLATE, encoding="utf-8")
    print(f"Created {path}")
    return path


if __name__ == "__main__":
    msg = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else ""
    main(msg)
