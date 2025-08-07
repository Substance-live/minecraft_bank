from abc import ABC, abstractmethod

class BankStorageInterface(ABC):
    @abstractmethod
    def get_balance(self, player: str) -> float:
        pass

    @abstractmethod
    def set_balance(self, player: str, amount: float):
        pass

    @abstractmethod
    def player_exists(self, player: str) -> bool:
        pass

    @abstractmethod
    def get_resource_amount(self, resource: str) -> int:
        pass

    @abstractmethod
    def set_resource_amount(self, resource: str, amount: int):
        pass

    @abstractmethod
    def list_all_players(self) -> list[str]:
        pass


class GameBank:
    DEFAULT_STARTING_DOLLARS = 1000
    DEFAULT_BASE_DIAMOND_PRICE = 10

    DEFAULT_BASE_RATES = {
        "Незеритовый слиток": 0.5,
        "Лазурит": 128,
        "Редстоун": 128,
        "Золотой слиток": 8,
        "Жемчуг эндера": 2,
        "Алмаз": 1
    }

    def __init__(self, storage: BankStorageInterface, starting_dollars=None, base_diamond_price=None):
        self.storage = storage
        self.starting_dollars = starting_dollars or self.DEFAULT_STARTING_DOLLARS
        self.base_diamond_price = base_diamond_price or self.DEFAULT_BASE_DIAMOND_PRICE
        self.base_rates = self.DEFAULT_BASE_RATES.copy()

    def _get_total_dollars(self):
        total = 0.0
        for player in self.storage.list_all_players():
            total += self.storage.get_balance(player)
        return max(self.starting_dollars, total)

    def _base_value(self, resource):
        return (1 / self.base_rates[resource]) * self.base_diamond_price

    def _calc_sum_for_adding(self, resource, current_amount, add_amount):
        base_val = self._base_value(resource)
        total_sum = 0
        total_dollars = self._get_total_dollars()
        for i in range(add_amount):
            price = (total_dollars * base_val) / (current_amount + i)
            total_sum += price
        return total_sum

    def _calc_sum_for_withdrawing(self, resource, current_amount, withdraw_amount):
        base_val = self._base_value(resource)
        total_sum = 0
        total_dollars = self._get_total_dollars()
        for i in range(withdraw_amount):
            price = (total_dollars * base_val) / (current_amount - i)
            total_sum += price
        return total_sum

    def show_rates(self):
        total_dollars = self._get_total_dollars()
        print(f"💳 Общая сумма $ в системе: {total_dollars}$\n")
        print("📈 Динамические цены (1 ресурс = X $):\n")

        for resource in self.base_rates:
            amount = self.storage.get_resource_amount(resource)
            value = self._base_value(resource)
            price = (total_dollars * value) / amount
            print(f"{resource}: {price:.4f} $")

    def deposit(self, player, resource, amount):
        try:
            current_amount = self.storage.get_resource_amount(resource)
        except KeyError:
            print("⛔ Ресурс не поддерживается.")
            return

        earned = self._calc_sum_for_adding(resource, current_amount, amount)

        # Обновление
        self.storage.set_resource_amount(resource, current_amount + amount)
        current_balance = self.storage.get_balance(player)
        self.storage.set_balance(player, current_balance + earned)

        print(f"✅ {player} внёс {amount} {resource}, получил {earned:.2f} $")

    def withdraw(self, player, resource, amount):
        try:
            current_amount = self.storage.get_resource_amount(resource)
        except KeyError:
            print("⛔ Ресурс не поддерживается.")
            return

        if current_amount < amount:
            print("⛔ Недостаточно ресурса в банке.")
            return

        cost = self._calc_sum_for_withdrawing(resource, current_amount, amount)
        balance = self.storage.get_balance(player)

        if balance < cost:
            print("⛔ Недостаточно $ на счёте.")
            return

        # Обновление
        self.storage.set_resource_amount(resource, current_amount - amount)
        self.storage.set_balance(player, balance - cost)

        print(f"✅ {player} снял {amount} {resource}, потратил {cost:.2f} $")

    def create_card(self, player_name, initial_amount=50):
        if not self.storage.player_exists(player_name):
            self.storage.set_balance(player_name, initial_amount)
            print(f"🎉 Карта создана для {player_name} с {initial_amount}$")
        else:
            print(f"⚠️ Карта уже существует для {player_name}")

    def get_balance(self, player):
        return self.storage.get_balance(player)



if __name__ == '__main__':
    bank = GameBank()

    bank.create_card("sunny")
    bank.create_card("dima")

    bank.show_rates()

    bank.deposit("sunny", "Алмаз", 6)
    bank.withdraw("sunny", "Незеритовый слиток", 1)

    bank.show_rates()