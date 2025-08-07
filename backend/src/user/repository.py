from sqlalchemy import select, update

from src.user.models import UserOrm
from src.db import Session_maker

class UserRepository:

    @classmethod
    def add(cls, value: dict) -> UserOrm:
        with Session_maker() as session:
            new_user = UserOrm(**value)
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            return new_user

    @classmethod
    def find(cls, filter_by: dict) -> UserOrm:
        with Session_maker() as session:
            query = select(UserOrm).filter_by(**filter_by)
            result = session.scalar(query)
            return result

    @classmethod
    def all(cls) -> list[UserOrm]:
        with Session_maker() as session:
            query = select(UserOrm)
            result = session.scalars(query)
            return result.all()

    @classmethod
    def update(cls, user_id: int, value: dict) -> int:
        with Session_maker() as session:
            query = update(UserOrm).where(UserOrm.id == user_id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount

