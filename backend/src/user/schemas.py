from pydantic import BaseModel, ConfigDict

from src.user.enum.user_status import UserStatus


class UserBaseSchema(BaseModel):
    login: str
    password: str




class UserLoginSchema(UserBaseSchema):
    ...

class UserRegisterSchema(UserBaseSchema):
    role: UserStatus


class UserSchema(UserBaseSchema):
    id: int
    auth_token: str | None = None
    role: UserStatus

    model_config = ConfigDict(from_attributes=True)


class UserPartialBaseSchema(BaseModel):
    login: str | None = None
    password: str | None = None
    auth_token: str | None = None
    role: UserStatus | None = None


class UserUpdateSchema(UserPartialBaseSchema):
    id: int


class UserFilterSchema(UserPartialBaseSchema):
    id: int | None = None
