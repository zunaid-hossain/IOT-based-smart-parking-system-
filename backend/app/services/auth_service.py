from sqlalchemy.orm import Session

from app.auth.hashing import (
    hash_password,
    verify_password,
)
from app.auth.jwt import create_access_token

from app.models.user import User

from app.repositories.user_repository import UserRepository

from app.schemas.user import (
    UserCreate,
    UserLogin,
)


class AuthService:

    @staticmethod
    def register(
        db: Session,
        user_data: UserCreate,
    ):

        existing_user = UserRepository.get_by_email(
            db,
            user_data.email,
        )

        if existing_user:
            raise ValueError(
                "Email already registered."
            )

        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            phone=user_data.phone,
            password=hash_password(user_data.password),
        )

        return UserRepository.create(
            db,
            new_user,
        )

    @staticmethod
    def login(
        db: Session,
        credentials: UserLogin,
    ):

        user = UserRepository.get_by_email(
            db,
            credentials.email,
        )

        if user is None:
            return None

        if not verify_password(
            credentials.password,
            user.password,
        ):
            return None

        token = create_access_token(
            {
                "sub": user.email,
                "id": user.id,
                "role": user.role,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }