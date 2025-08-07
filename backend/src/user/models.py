from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from src.db import Base
from src.user.enum.user_status import UserStatus


class UserOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str]
    password: Mapped[str]
    auth_token: Mapped[str] = mapped_column(nullable=True)
    role: Mapped[str] = mapped_column(SqlEnum(UserStatus, name="user_status"))

