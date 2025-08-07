from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from src.config import settings

engine = create_engine(settings.DB_URL)
Session_maker = sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    ...

def create_tables():
    Base.metadata.create_all(engine)

def delete_tables():
    Base.metadata.drop_all(engine)
