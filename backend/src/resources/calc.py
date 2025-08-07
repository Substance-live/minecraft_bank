import math


class ResourceCalculator:
    BASE_RATES = {
        "Незеритовый слиток": 0.5,
        "Лазурит": 128,
        "Редстоун": 128,
        "Золотой слиток": 8,
        "Жемчуг эндера": 2,
        "Алмаз": 1
    }
    BASE_DIAMOND_PRICE = 10
    MIN_TOTAL_DOLLARS = 1000
    MARKET_NORMALIZATION = 100

    @classmethod
    def get_total_dollars(cls, client_balances: list) -> int:
        # Используем сумму банковского счета и всех клиентских балансов
        from src.clients.service import BankAccountService
        bank_account = BankAccountService.get()
        client_total = sum(c.balance for c in client_balances)
        total = bank_account.balance + client_total
        return int(total)

    @classmethod
    def get_resource_price(cls, resource_name: str, amount: int, total_dollars: float) -> float:
        base_value = (1 / cls.BASE_RATES.get(resource_name, 1)) * cls.BASE_DIAMOND_PRICE
        normalized_dollars = total_dollars / cls.MARKET_NORMALIZATION
        return (normalized_dollars * base_value) / max(1, amount)

    @classmethod
    def calc_deposit_earned(cls, resource_name: str, current_amount: int, add_amount: int, total_dollars: float) -> float:
        # Для депозитов используем фиксированную цену на момент сделки
        price_per_unit = cls.get_resource_price(resource_name, current_amount, total_dollars)
        earned = price_per_unit * add_amount
        # Комиссия 5% на депозит
        earned *= 0.95
        return earned

    @classmethod
    def calc_withdraw_cost(cls, resource_name: str, current_amount: int, withdraw_amount: int,
                           total_dollars: float) -> float:
        base_value = (1 / cls.BASE_RATES.get(resource_name, 1)) * cls.BASE_DIAMOND_PRICE
        normalized_dollars = total_dollars / cls.MARKET_NORMALIZATION
        cost = 0
        for i in range(withdraw_amount):
            # Используем ту же логику, что и в get_resource_price для согласованности
            price = (normalized_dollars * base_value) / max(1, current_amount - i)
            cost += price
        return cost
