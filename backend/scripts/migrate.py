import os
from pathlib import Path

import psycopg
from psycopg import sql
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

DB_SCHEMA = os.environ.get("DB_SCHEMA") or "public"


def normalize_dsn(url: str) -> str:
    lowered = url.lower()
    if lowered.startswith("postgresql+psycopg://"):
        return "postgresql://" + url.split("://", 1)[1]
    return url

DDL_MIGRATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS _schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


def ensure_table(cur: psycopg.Cursor) -> None:
    cur.execute(DDL_MIGRATIONS_TABLE)


def applied_set(cur: psycopg.Cursor) -> set[str]:
    cur.execute("SELECT filename FROM _schema_migrations;")
    return {row[0] for row in cur.fetchall()}


def apply_sql(cur: psycopg.Cursor, path: Path) -> None:
    with path.open("r", encoding="utf-8") as file:
        statements = file.read()
    if not statements.strip():
        return
    cur.execute(statements)


def main() -> None:
    migrations_dir = Path(__file__).resolve().parent.parent / "migrations"
    with psycopg.connect(normalize_dsn(DATABASE_URL)) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(DB_SCHEMA)))
            cur.execute(sql.SQL("SET search_path TO {}").format(sql.Identifier(DB_SCHEMA)))
            ensure_table(cur)
            completed = applied_set(cur)

            files = sorted(Path(migrations_dir).glob("*.sql"))
            for path in files:
                name = path.name
                if name in completed:
                    continue
                print(f"Applying {name} ...")
                apply_sql(cur, path)
                cur.execute(
                    "INSERT INTO _schema_migrations (filename) VALUES (%s)",
                    (name,),
                )
        conn.commit()
    print("Migrations complete.")


if __name__ == "__main__":
    main()
