from fastapi import APIRouter, HTTPException
from src.resources.calc import ResourceCalculator
from src.resources.schemas import AllResourcePricesResponse, ResourcePriceSchema, ResourcePriceHistoryResponse
from src.resources.service import ResourceService, ResourceHistoryService
from src.clients.service import ClientBalanceService, BankAccountService
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/api/resources",
    tags=["Ресурсы"]
)

@router.get("/prices", response_model=AllResourcePricesResponse)
def get_resource_prices():
    resources = ResourceService.all()
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    result: List[ResourcePriceSchema] = []
    for res in resources:
        price = ResourceCalculator.get_resource_price(res.name, res.amount, total_dollars)
        result.append(ResourcePriceSchema(name=res.name, price=price, amount=res.amount))
    return {"resources": result}

@router.get("/{resource}/history", response_model=ResourcePriceHistoryResponse)
def get_resource_history(resource: str, limit: int = 20):
    if limit > 100:  # Ограничиваем максимальное количество записей
        limit = 100
    return ResourceHistoryService.get_price_history(resource, limit)

class CalcDepositEarnedRequest(BaseModel):
    resource: str
    add_amount: int

class CalcDepositAmountForMoneyRequest(BaseModel):
    resource: str
    target_money: float

class CalcWithdrawCostRequest(BaseModel):
    resource: str
    withdraw_amount: int

class CalcWithdrawAmountForMoneyRequest(BaseModel):
    resource: str
    available_money: float

@router.post("/public/deposit/earned")
def calc_deposit_earned(data: CalcDepositEarnedRequest):
    resource_db = ResourceService.find_db(data.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    earned = ResourceCalculator.calc_deposit_earned(
        data.resource, resource_db.amount, data.add_amount, total_dollars
    )
    return {"earned": earned, "commission": "5%"}

@router.post("/public/deposit/amount-for-money")
def calc_deposit_amount_for_money(data: CalcDepositAmountForMoneyRequest):
    resource_db = ResourceService.find_db(data.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    # Найти минимальное n, при котором сумма >= target_money
    n = 0
    money = 0
    while money < data.target_money:
        n += 1
        money = ResourceCalculator.calc_deposit_earned(
            data.resource, resource_db.amount, n, total_dollars
        )
        if n > 100000:  # safety limit
            break
    return {"needed_amount": n, "money": money}

@router.post("/public/withdraw/cost")
def calc_withdraw_cost(data: CalcWithdrawCostRequest):
    resource_db = ResourceService.find_db(data.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    cost = ResourceCalculator.calc_withdraw_cost(
        data.resource, resource_db.amount, data.withdraw_amount, total_dollars
    )
    return {"cost": cost, "commission": "0%"}

@router.post("/public/withdraw/amount-for-money")
def calc_withdraw_amount_for_money(data: CalcWithdrawAmountForMoneyRequest):
    resource_db = ResourceService.find_db(data.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    # Найти максимальное n, при котором стоимость <= available_money
    n = 0
    cost = 0
    while True:
        n += 1
        cost = ResourceCalculator.calc_withdraw_cost(
            data.resource, resource_db.amount, n, total_dollars
        )
        if cost > data.available_money or n > resource_db.amount or n > 100000:
            n -= 1
            cost = ResourceCalculator.calc_withdraw_cost(
                data.resource, resource_db.amount, n, total_dollars
            )
            break
    return {"max_amount": n, "cost": cost} 