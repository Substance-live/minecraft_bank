from sqlalchemy import select, update
from src.clients.models import ClientBalanceOrm, BankAccountOrm, DepositOrm, CreditOrm
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

    @classmethod
    def delete(cls, name: str) -> int:
        with Session_maker() as session:
            from sqlalchemy import delete
            query = delete(ClientBalanceOrm).where(ClientBalanceOrm.name == name)
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

class DepositRepository:
    @classmethod
    def add(cls, value: dict) -> DepositOrm:
        with Session_maker() as session:
            new_deposit = DepositOrm(**value)
            session.add(new_deposit)
            session.commit()
            session.refresh(new_deposit)
            return new_deposit

    @classmethod
    def find_by_client(cls, client_name: str) -> list[DepositOrm]:
        with Session_maker() as session:
            query = select(DepositOrm).filter_by(client_name=client_name, is_active=True)
            result = session.scalars(query)
            return result.all()

    @classmethod
    def find_by_id(cls, deposit_id: int) -> DepositOrm:
        with Session_maker() as session:
            query = select(DepositOrm).filter_by(id=deposit_id)
            result = session.scalar(query)
            return result

    @classmethod
    def find_expired_deposits(cls) -> list[DepositOrm]:
        with Session_maker() as session:
            from datetime import datetime
            query = select(DepositOrm).filter(
                DepositOrm.is_active == True,
                DepositOrm.payout_date <= datetime.now()
            )
            result = session.scalars(query)
            return result.all()

    @classmethod
    def update_deposit(cls, deposit_id: int, value: dict) -> int:
        with Session_maker() as session:
            query = update(DepositOrm).where(DepositOrm.id == deposit_id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount

class CreditRepository:
    @classmethod
    def add(cls, value: dict) -> CreditOrm:
        with Session_maker() as session:
            new_credit = CreditOrm(**value)
            session.add(new_credit)
            session.commit()
            session.refresh(new_credit)
            return new_credit

    @classmethod
    def find_by_client(cls, client_name: str) -> list[CreditOrm]:
        with Session_maker() as session:
            query = select(CreditOrm).filter_by(client_name=client_name, is_active=True)
            result = session.scalars(query)
            return result.all()

    @classmethod
    def find_by_id(cls, credit_id: int) -> CreditOrm:
        with Session_maker() as session:
            query = select(CreditOrm).filter_by(id=credit_id)
            result = session.scalar(query)
            return result

    @classmethod
    def find_overdue_credits(cls) -> list[CreditOrm]:
        with Session_maker() as session:
            from datetime import datetime
            query = select(CreditOrm).filter(
                CreditOrm.is_active == True,
                CreditOrm.due_date <= datetime.now()
            )
            result = session.scalars(query)
            return result.all()

    @classmethod
    def update_credit(cls, credit_id: int, value: dict) -> int:
        with Session_maker() as session:
            query = update(CreditOrm).where(CreditOrm.id == credit_id).values(**value)
            ret = session.execute(query)
            session.commit()
            return ret.rowcount
