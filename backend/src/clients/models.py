from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime
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

class DepositOrm(Base):
    __tablename__ = "deposits"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_name: Mapped[str]
    amount: Mapped[float]
    interest_rate: Mapped[float]  # годовая ставка в процентах
    days: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    payout_date: Mapped[datetime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(default=True)
    interest_earned: Mapped[float] = mapped_column(default=0.0)

class CreditOrm(Base):
    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_name: Mapped[str]
    amount: Mapped[float]
    interest_rate: Mapped[float]  # годовая ставка в процентах
    days: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    due_date: Mapped[datetime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(default=True)
    interest_owed: Mapped[float] = mapped_column(default=0.0)
