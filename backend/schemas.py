from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("full_name", mode="before")
    @classmethod
    def rapikan_nama(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def email_harus_kampus(cls, value: str) -> str:
        domain = value.split("@")[-1].lower()
        if not domain.endswith(".ac.id"):
            raise ValueError("Gunakan email kampus (berakhiran .ac.id)")
        return value.lower()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_harus_kampus(cls, value: str) -> str:
        value = value.strip().lower()
        if not value.endswith(".ac.id"):
            raise ValueError("Gunakan email kampus (berakhiran .ac.id)")
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    verification_status: str
    balance: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse