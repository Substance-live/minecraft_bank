from fastapi import APIRouter, HTTPException
from src.clients.service import ClientBalanceService, DepositService, CreditService
from src.clients.schemas import AllClientBalancesResponse, ClientBalanceSchema, DepositResponse, CreditResponse
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/clients",
    tags=["Клиенты"]
)

@router.get("/balances", response_model=AllClientBalancesResponse)
def get_client_balances():
    clients = ClientBalanceService.all()
    return {"clients": clients}

class RegisterCardRequest(BaseModel):
    name: str
    initial_amount: float = 50

@router.post("/register")
def register_card(request: RegisterCardRequest):
    if ClientBalanceService.find(request.name):
        return {"status": "already exists"}
    client = ClientBalanceSchema(name=request.name, balance=request.initial_amount)
    ClientBalanceService.add(client)
    # Обновляем историю цен для всех ресурсов
    from src.resources.service import ResourceHistoryService
    updated_clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(updated_clients)
    return {"status": "created", "name": request.name, "balance": request.initial_amount}

@router.get("/{client_name}/deposits", response_model=DepositResponse)
def get_client_deposits_public(client_name: str):
    """Публичный эндпоинт для получения вкладов клиента"""
    deposits = DepositService.get_client_deposits(client_name)
    return {"deposits": deposits}

@router.get("/{client_name}/credits", response_model=CreditResponse)
def get_client_credits_public(client_name: str):
    """Публичный эндпоинт для получения кредитов клиента"""
    credits = CreditService.get_client_credits(client_name)
    return {"credits": credits} 