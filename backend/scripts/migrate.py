import glob
import os
from pathlib import Path

import psycopg

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

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
        sql = file.read()
    if not sql.strip():
        return
    cur.execute(sql)


def main() -> None:
    migrations_dir = Path(__file__).resolve().parent.parent / "migrations"
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
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
