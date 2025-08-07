from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel
from src.resources.calc import ResourceCalculator
from src.resources.schemas import ResourcePriceSchema
from src.resources.service import ResourceService, ResourceHistoryService
from src.clients.service import ClientBalanceService, BankAccountService
from src.api.auth import get_current_user

router = APIRouter(
    prefix="/api/admin",
    tags=["Администратор"]
)

class TransactionRequest(BaseModel):
    player: str
    resource: str
    amount: int

class UpdateBalanceRequest(BaseModel):
    player: str
    new_balance: float

class UpdateResourceAmountRequest(BaseModel):
    resource: str
    new_amount: int

class AddResourceRequest(BaseModel):
    name: str
    amount: int
    base_rate: float  # 1 алмаз = N ресурса

class DeleteResourceRequest(BaseModel):
    resource: str

class UpdateBaseRateRequest(BaseModel):
    resource: str
    new_rate: float  # 1 алмаз = N ресурса

class UpdateBankBalanceRequest(BaseModel):
    new_balance: float

@router.post("/deposit")
def deposit(request: TransactionRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может проводить транзакции")
    client_db = ClientBalanceService.find_db(request.player)
    resource_db = ResourceService.find_db(request.resource)
    if not client_db or not resource_db:
        raise HTTPException(status_code=404, detail="Клиент или ресурс не найден")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    earned = ResourceCalculator.calc_deposit_earned(resource_db.name, resource_db.amount, request.amount, total_dollars)
    # Списываем деньги с банковского счета
    BankAccountService.subtract_money(earned)
    ResourceService.update(resource_id=resource_db.id, amount=resource_db.amount + request.amount)
    ClientBalanceService.update(client_id=client_db.id, balance=client_db.balance + earned)
    # Обновляем историю цен для всех ресурсов
    updated_clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(updated_clients)
    return {"status": "ok", "earned": earned, "commission": "5%"}

@router.post("/withdraw")
def withdraw(request: TransactionRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может проводить транзакции")
    client_db = ClientBalanceService.find_db(request.player)
    resource_db = ResourceService.find_db(request.resource)
    if not client_db or not resource_db:
        raise HTTPException(status_code=404, detail="Клиент или ресурс не найден")
    if resource_db.amount < request.amount:
        raise HTTPException(status_code=400, detail="Недостаточно ресурса в банке")
    clients = ClientBalanceService.all()
    total_dollars = ResourceCalculator.get_total_dollars(clients)
    cost = ResourceCalculator.calc_withdraw_cost(resource_db.name, resource_db.amount, request.amount, total_dollars)
    if client_db.balance < cost:
        raise HTTPException(status_code=400, detail="Недостаточно $ на счёте")
    # Добавляем деньги на банковский счет
    BankAccountService.add_money(cost)
    ResourceService.update(resource_id=resource_db.id, amount=resource_db.amount - request.amount)
    ClientBalanceService.update(client_id=client_db.id, balance=client_db.balance - cost)
    # Обновляем историю цен для всех ресурсов
    updated_clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(updated_clients)
    return {"status": "ok", "cost": cost, "commission": "0%"}

@router.post("/update-balance")
def update_balance(request: UpdateBalanceRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может изменять балансы")
    client_db = ClientBalanceService.find_db(request.player)
    if not client_db:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    old_balance = client_db.balance
    ClientBalanceService.update(client_db.id, request.new_balance)
    # Обновляем историю цен для всех ресурсов
    updated_clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(updated_clients)
    return {"status": "ok", "player": request.player, "old_balance": old_balance, "new_balance": request.new_balance}

@router.post("/update-resource-amount")
def update_resource_amount(request: UpdateResourceAmountRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может изменять ресурсы")
    resource_db = ResourceService.find_db(request.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    ResourceService.update(resource_db.id, request.new_amount)
    # Обновляем историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    return {"status": "ok", "resource": request.resource, "new_amount": request.new_amount}

@router.post("/add-resource")
def add_resource(request: AddResourceRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может добавлять ресурсы")
    existing = ResourceService.find(request.name)
    if existing:
        raise HTTPException(status_code=400, detail="Ресурс уже существует")
    # Добавить в калькулятор
    ResourceCalculator.BASE_RATES[request.name] = request.base_rate
    # Добавить в БД
    resource = ResourcePriceSchema(name=request.name, price=0, amount=request.amount)
    ResourceService.add(resource)
    # Обновляем историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    return {"status": "ok", "resource": request.name, "amount": request.amount, "base_rate": request.base_rate}

@router.delete("/delete-resource")
def delete_resource(request: DeleteResourceRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может удалять ресурсы")
    resource_db = ResourceService.find_db(request.resource)
    if not resource_db:
        raise HTTPException(status_code=404, detail="Ресурс не найден")
    # Удалить из калькулятора
    if request.resource in ResourceCalculator.BASE_RATES:
        del ResourceCalculator.BASE_RATES[request.resource]
    # Удалить из БД
    deleted_count = ResourceService.delete(resource_db.id)
    if deleted_count == 0:
        raise HTTPException(status_code=500, detail="Ошибка при удалении ресурса из БД")
    # Обновляем историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    return {"status": "ok", "deleted_resource": request.resource, "deleted_count": deleted_count}

@router.get("/base-rates")
def get_base_rates(user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может просматривать курсы")
    return {"base_rates": ResourceCalculator.BASE_RATES}

@router.get("/bank-balance")
def get_bank_balance(user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может просматривать баланс банка")
    bank_account = BankAccountService.get()
    return {"balance": bank_account.balance}

@router.post("/update-bank-balance")
def update_bank_balance(request: UpdateBankBalanceRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может изменять баланс банка")
    if request.new_balance < 0:
        raise HTTPException(status_code=400, detail="Баланс банка не может быть отрицательным")
    old_balance = BankAccountService.get().balance
    BankAccountService.update(request.new_balance)
    # Обновляем историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    return {"status": "ok", "old_balance": old_balance, "new_balance": request.new_balance}

@router.post("/update-base-rate")
def update_base_rate(request: UpdateBaseRateRequest, user=Security(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только админ может изменять курсы")
    if request.resource not in ResourceCalculator.BASE_RATES:
        raise HTTPException(status_code=404, detail="Ресурс не найден в системе курсов")
    old_rate = ResourceCalculator.BASE_RATES[request.resource]
    ResourceCalculator.BASE_RATES[request.resource] = request.new_rate
    # Обновляем историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    return {"status": "ok", "resource": request.resource, "old_rate": old_rate, "new_rate": request.new_rate}
