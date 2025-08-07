from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base

class ClientBalanceOrm(Base):
    __tablename__ = "client_balances"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    balance: Mapped[float]

class BankAccountOrm(Base):
    __tablename__ = "bank_account"

    id: Mapped[int] = mapped_column(primary_key=True)
    balance: Mapped[float] = mapped_column(default=50000.0)  # Измените это значение на нужное
