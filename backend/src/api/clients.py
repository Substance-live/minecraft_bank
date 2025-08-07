from fastapi import APIRouter, HTTPException
from src.clients.service import ClientBalanceService
from src.clients.schemas import AllClientBalancesResponse, ClientBalanceSchema
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