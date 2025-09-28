"""Seed initial data.

The script is idempotent and safe to run multiple times.
"""

import sys
from pathlib import Path

from sqlalchemy import select

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.security import get_password_hash  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models import Item, User  # noqa: E402

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "adminpass"


def seed() -> None:
    with SessionLocal() as session:
        admin = session.execute(select(User).where(User.email == ADMIN_EMAIL)).scalar_one_or_none()
        if not admin:
            admin = User(
                email=ADMIN_EMAIL,
                password_hash=get_password_hash(ADMIN_PASSWORD),
                role="admin",
            )
            session.add(admin)
            session.flush()

        has_sample_item = (
            session.execute(select(Item).where(Item.owner_id == admin.id, Item.name == "Sample Item")).scalar_one_or_none()
            if admin
            else None
        )
        if admin and not has_sample_item:
            session.add(Item(name="Sample Item", owner_id=admin.id))

        session.commit()
        print("Seed completed.")


if __name__ == "__main__":
    seed()
