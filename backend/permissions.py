from fastapi import Depends, HTTPException

from auth import get_current_user
from models import User


def require_verified(user: User = Depends(get_current_user)) -> User:
    if user.verification_status != "verified":
        raise HTTPException(
            status_code=403,
            detail="Verifikasi KTM dulu untuk menggunakan fitur ini",
        )
    return user