from sqlalchemy import select, update, delete
from src.resources.models import ResourceOrm, ResourcePriceHistoryOrm
from src.db import Session_maker

class ResourceRepository:
    @classmethod
    def add(cls, value: dict) -> ResourceOrm:
        with Session_maker() as session:
            new_resource = ResourceOrm(**value)
            session.add(new_resource)
            session.commit()
            session.refresh(new_resource)
            return new_resource

    @classmethod
    def find(cls, filter_by: dict) -> ResourceOrm:
        with Session_maker() as session:
            query = select(ResourceOrm).filter_by(**filter_by)
            result = session.scalar(query)
            return result

    @classmethod
    def all(cls) -> list[ResourceOrm]:
        with Session_maker() as session:
            query = select(ResourceOrm)
            result = session.scalars(query)
            return result.all()

    @classmethod
    def update(cls, resource_id: int, value: dict) -> int:
        with Session_maker() as session:
            query = update(ResourceOrm).where(ResourceOrm.id == resource_id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount

    @classmethod
    def delete(cls, resource_id: int) -> int:
        with Session_maker() as session:
            query = delete(ResourceOrm).where(ResourceOrm.id == resource_id)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount

    @classmethod
    def add_price_history(cls, value: dict) -> ResourcePriceHistoryOrm:
        with Session_maker() as session:
            new_history = ResourcePriceHistoryOrm(**value)
            session.add(new_history)
            session.commit()
            session.refresh(new_history)
            return new_history

    @classmethod
    def get_price_history(cls, resource_name: str, limit: int = 20) -> list[ResourcePriceHistoryOrm]:
        with Session_maker() as session:
            query = select(ResourcePriceHistoryOrm).filter_by(resource_name=resource_name).order_by(ResourcePriceHistoryOrm.timestamp.desc()).limit(limit)
            result = session.scalars(query)
            return result.all()
