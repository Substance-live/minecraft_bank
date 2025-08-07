from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

class ResourcePriceSchema(BaseModel):
    name: str
    price: float
    amount: int

class AllResourcePricesResponse(BaseModel):
    resources: list[ResourcePriceSchema]

class ResourcePriceHistorySchema(BaseModel):
    id: int
    resource_name: str
    price: float
    timestamp: datetime

class ResourcePriceHistoryResponse(BaseModel):
    resource_name: str
    history: List[ResourcePriceHistorySchema]
