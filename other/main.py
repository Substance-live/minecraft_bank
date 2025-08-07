def calc_sum_for_adding(resource, current_amount, add_amount, total_dollars, base_rates, base_diamond_price):
    base_value = (1 / base_rates[resource]) * base_diamond_price
    total_sum = 0
    for i in range(add_amount):
        price = (total_dollars * base_value) / (current_amount + i)
        total_sum += price
    return total_sum

def find_amount_for_target_money(resource, current_amount, target_money, total_dollars, base_rates, base_diamond_price):
    n = 0
    while True:
        n += 1
        money = calc_sum_for_adding(resource, current_amount, n, total_dollars, base_rates, base_diamond_price)
        if money >= target_money:
            return n, money

def calc_sum_for_withdrawing(resource, current_amount, withdraw_amount, total_dollars, base_rates, base_diamond_price):
    base_value = (1 / base_rates[resource]) * base_diamond_price
    total_sum = 0
    for i in range(withdraw_amount):
        # При снятии ресурса количество ресурсов в банке уменьшается, поэтому цена растет
        price = (total_dollars * base_value) / (current_amount - i)
        total_sum += price
    return total_sum


# Баланс клиентов (симулируем карты игроков)
client_balances = {
    "sunny": 5825,
    "dima": 0
}

# Базовые курсы (1 алмаз = N ресурса)
base_rates = {
    "Незеритовый слиток": 0.5,
    "Лазурит": 128,
    "Редстоун": 128,
    "Золотой слиток": 8,
    "Жемчуг эндера": 2,
    "Алмаз": 1
}

# Кол-во ресурсов в банке
bank_resources = {
    "Незеритовый слиток": 9,
    "Лазурит": 77 * 9,
    "Редстоун": 93 * 9,
    "Золотой слиток": 51 * 9 + 6,
    "Жемчуг эндера": 72,
    "Алмаз": 14 * 9 + 101
}



total_dollars = max(1000, sum(client_balances.values()))

# старт карты 50$

# Базовая стоимость алмаза
base_diamond_price = 10

# Счетчик цены на вклад
target_money = 1000 # сколько цены
add_amount = 1  # сколько добавляем
withdraw_amount = 13 # Сколько снять вещей из банка
resource = "Алмаз"


current_amount = bank_resources[resource]

base_dollar_values = {
    item: (1 / rate) * base_diamond_price
    for item, rate in base_rates.items()
}

print(f"💳 Общая сумма $ в системе: {total_dollars}$\n")
print("📈 Динамические цены (1 ресурс = X $):\n")

for resource_cyc, base_value in base_dollar_values.items():
    amount = bank_resources.get(resource_cyc, 1)
    price = (total_dollars * base_value) / amount
    print(f"{resource_cyc}: {price:.4f} $")

input()


money_gained = calc_sum_for_adding(resource, current_amount, add_amount, total_dollars, base_rates, base_diamond_price)
print(f"За добавление {add_amount} {resource} получаем: {money_gained:.2f} $")
input()


needed_amount, gained_money = find_amount_for_target_money(
    resource, current_amount, target_money, total_dollars, base_rates, base_diamond_price
)


print(f"Чтобы получить примерно {target_money}$, нужно положить {needed_amount} {resource},")
print(f"это даст {gained_money:.2f} $.")

input()

# Например, клиент хочет снять 3 "Незеритовых слитка"

current_amount = bank_resources[resource]

# Проверяем, что в банке достаточно ресурсов
if withdraw_amount > current_amount:
    print("В банке недостаточно ресурсов для снятия!")
else:
    cost = calc_sum_for_withdrawing(resource, current_amount, withdraw_amount, total_dollars, base_rates, base_diamond_price)
    print(f"Для снятия {withdraw_amount} {resource} нужно списать с клиента: {cost:.2f} $")
    # Здесь можно проверить баланс клиента и списать деньги
    # И уменьшить количество ресурсов в банке
    bank_resources[resource] -= withdraw_amount
    # Также уменьшить total_dollars, если деньги уходят из системы