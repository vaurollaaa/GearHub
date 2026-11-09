import os
import re
from calendar import monthrange
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import UserResponse

router = APIRouter(prefix="/verification", tags=["verification"])

# Foto hanya boleh berasal dari akun Cloudinary kita.
CLOUDINARY_PREFIX = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME', 'vpifjjs1')}/"


class VerificationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=2, max_length=100)
    nim: str
    campus: str = Field(min_length=2, max_length=100)
    ktm_valid_until: str  # format "YYYY-MM"
    phone: str
    ktm_image_url: str = Field(max_length=500)
    selfie_url: str = Field(max_length=500)

    @field_validator("nim")
    @classmethod
    def check_nim(cls, v: str) -> str:
        if not re.fullmatch(r"\d{5,20}", v):
            raise ValueError("NIM harus berupa angka (5-20 digit)")
        return v

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        digits = re.sub(r"[\s-]", "", v)
        if not re.fullmatch(r"(\+62|62|0)8\d{8,12}", digits):
            raise ValueError("Nomor telepon tidak valid (contoh: 081234567891)")
        return digits

    @field_validator("ktm_valid_until")
    @classmethod
    def check_valid_until(cls, v: str) -> str:
        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", v):
            raise ValueError("Format masa berlaku KTM tidak valid")
        year, month = int(v[:4]), int(v[5:])
        if date(year, month, monthrange(year, month)[1]) < date.today():
            raise ValueError("KTM sudah tidak berlaku")
        return v

    @field_validator("ktm_image_url", "selfie_url")
    @classmethod
    def check_url(cls, v: str) -> str:
        if not v.startswith(CLOUDINARY_PREFIX):
            raise ValueError("URL foto tidak valid")
        return v


@router.post("", response_model=UserResponse)
def submit_verification(
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.verification_status == "verified":
        raise HTTPException(status_code=409, detail="Akun sudah terverifikasi")

    year, month = int(payload.ktm_valid_until[:4]), int(payload.ktm_valid_until[5:])
    user.full_name = payload.full_name
    user.nim = payload.nim
    user.campus = payload.campus
    user.phone = payload.phone
    user.ktm_valid_until = date(year, month, monthrange(year, month)[1])
    user.ktm_image_url = payload.ktm_image_url
    user.selfie_url = payload.selfie_url
    # SIMULASI: tidak ada admin, akun langsung terverifikasi setelah data dikirim.
    user.verification_status = "verified"
    db.commit()
    db.refresh(user)
    return user