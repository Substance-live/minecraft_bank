
from src.user.enum.user_status import UserStatus
from src.user.schemas import UserRegisterSchema
from src.user.service import UserService
from src.clients.schemas import ClientBalanceSchema
from src.clients.service import ClientBalanceService, BankAccountService
from src.resources.schemas import ResourcePriceSchema
from src.resources.service import ResourceService, ResourceHistoryService
from src.resources.calc import ResourceCalculator

client_balances = {
}

bank_resources = {
    "Незеритовый слиток": 10,
    "Лазурит": 695,
    "Редстоун": (29 + 64) * 9 + 5,
    "Золотой слиток": 52 * 9 + 7,
    "Жемчуг эндера": 16 * 3 + 8,
    "Алмаз": 14 * 9 + 1
}

def main():
    # Проверяем, есть ли уже данные в базе
    existing_clients = ClientBalanceService.all()
    if existing_clients:
        print("База данных уже заполнена. Пропускаем заполнение.")
        return
    
    UserService.add(UserRegisterSchema(login="admin", password="mama_polyka_sh", role=UserStatus.admin))
    for name, balance in client_balances.items():
        ClientBalanceService.add(ClientBalanceSchema(name=name, balance=balance))
    for name, amount in bank_resources.items():
        ResourceService.add(ResourcePriceSchema(name=name, price=0, amount=amount))
    
    # Создаем банковский счет с начальным балансом
    initial_bank_balance = 100000.0  # Измените это значение на нужное
    bank_account = BankAccountService.get()  # Это создаст банковский счет если его нет
    # Устанавливаем нужный начальный баланс
    BankAccountService.update(initial_bank_balance)
    
    # Записываем начальную историю цен для всех ресурсов
    clients = ClientBalanceService.all()
    ResourceHistoryService.update_all_prices_history(clients)
    print("База данных успешно заполнена начальными данными.")

if __name__ == '__main__':
    main()
