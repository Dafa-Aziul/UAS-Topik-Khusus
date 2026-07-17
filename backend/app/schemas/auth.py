from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import ApiResponse


class RegisterRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    nim: str = Field(min_length=8, max_length=30)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("nim")
    @classmethod
    def validate_nim(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("NIM must contain only digits")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        has_letter = any(char.isalpha() for char in value)
        has_digit = any(char.isdigit() for char in value)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain letters and numbers")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format")
        return value.lower()


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format")
        return value.lower()


class UserAuthData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    nim: str
    email: str
    role: str


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        has_letter = any(char.isalpha() for char in value)
        has_digit = any(char.isdigit() for char in value)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain letters and numbers")
        return value


class RegisterResponse(ApiResponse):
    data: UserAuthData


class LoginResponse(ApiResponse):
    data: TokenData


class MeResponse(ApiResponse):
    data: UserAuthData
