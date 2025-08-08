from src.resources.calc import ResourceCalculator
from src.resources.repository import ResourceRepository
from src.resources.schemas import ResourcePriceSchema, ResourcePriceHistorySchema, ResourcePriceHistoryResponse
from src.resources.models import ResourceOrm
from src.clients.service import BankAccountService
from typing import List

class ResourceService:
    @classmethod
    def add(cls, resource: ResourcePriceSchema) -> ResourcePriceSchema:
        value = resource.model_dump(exclude={"price"})
        db_resource = ResourceRepository.add(value)
        return ResourcePriceSchema(name=db_resource.name, price=0, amount=db_resource.amount)

    @classmethod
    def find(cls, name: str) -> ResourcePriceSchema | None:
        db_resource = ResourceRepository.find({"name": name})
        if db_resource:
            return ResourcePriceSchema(name=db_resource.name, price=0, amount=db_resource.amount)
        return None

    @classmethod
    def find_db(cls, name: str) -> ResourceOrm | None:
        return ResourceRepository.find({"name": name})

    @classmethod
    def all(cls) -> List[ResourcePriceSchema]:
        return [ResourcePriceSchema(name=elem.name, price=0, amount=elem.amount) for elem in ResourceRepository.all()]

    @classmethod
    def update(cls, resource_id: int, amount: int) -> int:
        return ResourceRepository.update(resource_id, {"amount": amount})

    @classmethod
    def delete(cls, resource_id: int) -> int:
        return ResourceRepository.delete(resource_id)

class ResourceHistoryService:
    @classmethod
    def add_price_history(cls, resource_name: str, price: float) -> ResourcePriceHistorySchema:
        value = {"resource_name": resource_name, "price": price}
        db_history = ResourceRepository.add_price_history(value)
        return ResourcePriceHistorySchema(
            id=db_history.id,
            resource_name=db_history.resource_name,
            price=db_history.price,
            timestamp=db_history.timestamp
        )

    @classmethod
    def get_price_history(cls, resource_name: str, limit: int = 20) -> ResourcePriceHistoryResponse:
        db_history = ResourceRepository.get_price_history(resource_name, limit)
        history = [
            ResourcePriceHistorySchema(
                id=item.id,
                resource_name=item.resource_name,
                price=item.price,
                timestamp=item.timestamp
            ) for item in db_history
        ]
        return ResourcePriceHistoryResponse(resource_name=resource_name, history=history)

    @classmethod
    def update_all_prices_history(cls, clients: list) -> None:
        """Обновляет историю цен для всех ресурсов одновременно"""
        total_dollars = ResourceCalculator.get_total_dollars(clients)
        resources = ResourceService.all()
        for res in resources:
            price = ResourceCalculator.get_resource_price(res.name, res.amount, total_dollars)
            cls.add_price_history(res.name, price)

    @classmethod
    def clear_all_history(cls) -> None:
        """Очищает всю историю цен"""
        ResourceRepository.clear_all_price_history()
