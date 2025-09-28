from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models import User


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
