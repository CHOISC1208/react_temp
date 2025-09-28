from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db_session
from app.core.security import create_access_token
from app.models import User
from app.schemas.auth import AuthUser, LoginRequest, Token
from app.services.auth import authenticate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db_session)) -> Token:
    user = authenticate(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(str(user.id))
    return Token(access_token=token)


@router.get("/me", response_model=AuthUser)
def read_profile(current_user: User = Depends(get_current_user)) -> AuthUser:
    return AuthUser.model_validate(current_user)
