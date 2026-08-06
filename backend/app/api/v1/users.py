from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.auth.hashing import hash_password, verify_password
from app.auth.oauth2 import get_current_user
from app.models.user import User
from app.schemas.user import (
    ChangePasswordRequest,
    UserResponse,
    UserUpdate,
)
from app.repositories.user_repository import UserRepository

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
)
def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the current user's profile (full_name, email, phone).
    """

    update_data = user_data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"]:
        existing = UserRepository.get_by_email(db, update_data["email"])
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
)
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the current user's password, requiring the current password
    for verification.
    """

    if not verify_password(req.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password = hash_password(req.new_password)
    db.add(current_user)
    db.commit()

    return {
        "message": "Password changed successfully"
    }