from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClientBalanceSchema(BaseModel):
    name: str
    balance: float

class AllClientBalancesResponse(BaseModel):
    clients: list[ClientBalanceSchema]

class BankAccountSchema(BaseModel):
    balance: float

class DepositSchema(BaseModel):
    id: int
    client_name: str
    amount: float
    interest_rate: float
    days: int
    created_at: datetime
    payout_date: datetime
    is_active: bool
    interest_earned: float

class CreateDepositRequest(BaseModel):
    client_name: str
    amount: float
    days: int  # 10, 30, 90 дней
    interest_rate: float = 5.0  # 5% годовых по умолчанию

class DepositResponse(BaseModel):
    deposits: list[DepositSchema]

class CreditSchema(BaseModel):
    id: int
    client_name: str
    amount: float
    interest_rate: float
    days: int
    created_at: datetime
    due_date: datetime
    is_active: bool
    interest_owed: float

class CreateCreditRequest(BaseModel):
    client_name: str
    amount: float
    days: int
    interest_rate: float = 10.0  # 10% годовых по умолчанию

class CreditResponse(BaseModel):
    credits: list[CreditSchema]
