from src.clients.repository import ClientBalanceRepository, BankAccountRepository
from src.clients.schemas import ClientBalanceSchema, BankAccountSchema
from src.clients.models import ClientBalanceOrm, BankAccountOrm
from typing import List

class ClientBalanceService:
    @classmethod
    def add(cls, client: ClientBalanceSchema) -> ClientBalanceSchema:
        value = client.model_dump()
        db_client = ClientBalanceRepository.add(value)
        return ClientBalanceSchema(name=db_client.name, balance=db_client.balance)

    @classmethod
    def find(cls, name: str) -> ClientBalanceSchema | None:
        db_client = ClientBalanceRepository.find({"name": name})
        if db_client:
            return ClientBalanceSchema(name=db_client.name, balance=db_client.balance)
        return None

    @classmethod
    def find_db(cls, name: str) -> ClientBalanceOrm | None:
        return ClientBalanceRepository.find({"name": name})

    @classmethod
    def all(cls) -> List[ClientBalanceSchema]:
        return [ClientBalanceSchema(name=elem.name, balance=elem.balance) for elem in ClientBalanceRepository.all()]

    @classmethod
    def update(cls, client_id: int, balance: float) -> int:
        return ClientBalanceRepository.update(client_id, {"balance": balance})

class BankAccountService:
    @classmethod
    def get(cls) -> BankAccountSchema:
        db_account = BankAccountRepository.get()
        return BankAccountSchema(balance=db_account.balance)

    @classmethod
    def update(cls, balance: float) -> int:
        return BankAccountRepository.update({"balance": balance})

    @classmethod
    def add_money(cls, amount: float) -> int:
        """Добавляет деньги на банковский счет"""
        current = cls.get()
        return cls.update(current.balance + amount)

    @classmethod
    def subtract_money(cls, amount: float) -> int:
        """Списывает деньги с банковского счета"""
        current = cls.get()
        if current.balance < amount:
            raise ValueError(f"Недостаточно средств в банке. Доступно: {current.balance}, требуется: {amount}")
        return cls.update(current.balance - amount)
