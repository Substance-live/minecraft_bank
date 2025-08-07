from sqlalchemy import select, update
from src.clients.models import ClientBalanceOrm, BankAccountOrm
from src.db import Session_maker

class ClientBalanceRepository:
    @classmethod
    def add(cls, value: dict) -> ClientBalanceOrm:
        with Session_maker() as session:
            new_client = ClientBalanceOrm(**value)
            session.add(new_client)
            session.commit()
            session.refresh(new_client)
            return new_client

    @classmethod
    def find(cls, filter_by: dict) -> ClientBalanceOrm:
        with Session_maker() as session:
            query = select(ClientBalanceOrm).filter_by(**filter_by)
            result = session.scalar(query)
            return result

    @classmethod
    def all(cls) -> list[ClientBalanceOrm]:
        with Session_maker() as session:
            query = select(ClientBalanceOrm)
            result = session.scalars(query)
            return result.all()

    @classmethod
    def update(cls, client_id: int, value: dict) -> int:
        with Session_maker() as session:
            query = update(ClientBalanceOrm).where(ClientBalanceOrm.id == client_id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount

class BankAccountRepository:
    @classmethod
    def get(cls) -> BankAccountOrm:
        with Session_maker() as session:
            query = select(BankAccountOrm)
            result = session.scalar(query)
            if not result:
                # Создаем банковский счет если его нет
                bank_account = BankAccountOrm()
                session.add(bank_account)
                session.commit()
                session.refresh(bank_account)
                return bank_account
            return result

    @classmethod
    def update(cls, value: dict) -> int:
        with Session_maker() as session:
            bank_account = cls.get()
            query = update(BankAccountOrm).where(BankAccountOrm.id == bank_account.id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount
