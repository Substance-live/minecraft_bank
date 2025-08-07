from pydantic import BaseModel

class ClientBalanceSchema(BaseModel):
    name: str
    balance: float

class AllClientBalancesResponse(BaseModel):
    clients: list[ClientBalanceSchema]

class BankAccountSchema(BaseModel):
    balance: float
