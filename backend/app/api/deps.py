from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt import verify_access_token
from app.auth.oauth2 import oauth2_scheme
from app.database.session import get_db
from app.repositories.user_repository import UserRepository


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    payload = verify_access_token(token)

    if payload is None:
        raise credentials_exception

    user_id = payload.get("id")

    if user_id is None:
        raise credentials_exception

    user = UserRepository.get_by_id(
        db,
        user_id,
    )

    if user is None:
        raise credentials_exception

    return user