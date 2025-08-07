from src.clients.repository import ClientBalanceRepository, BankAccountRepository, DepositRepository, CreditRepository
from src.clients.schemas import ClientBalanceSchema, BankAccountSchema, DepositSchema, CreditSchema
from src.clients.models import ClientBalanceOrm, BankAccountOrm, DepositOrm, CreditOrm
from typing import List
from datetime import datetime, timedelta

class ClientBalanceService:
    @classmethod
    def add(cls, client: ClientBalanceSchema) -> ClientBalanceSchema:
        value = client.model_dump()
        db_client = ClientBalanceRepository.add(value)
        return ClientBalanceSchema(name=db_client.name, balance=db_client.balance)

    @classmethod
    def find(cls, name: str) -> ClientBalanceSchema | None:
        db_client = ClientBalanceRepository.find({"name": name})
        if db_client:
            return ClientBalanceSchema(name=db_client.name, balance=db_client.balance)
        return None

    @classmethod
    def find_db(cls, name: str) -> ClientBalanceOrm | None:
        return ClientBalanceRepository.find({"name": name})

    @classmethod
    def all(cls) -> List[ClientBalanceSchema]:
        return [ClientBalanceSchema(name=elem.name, balance=elem.balance) for elem in ClientBalanceRepository.all()]

    @classmethod
    def update(cls, client_id: int, balance: float) -> int:
        return ClientBalanceRepository.update(client_id, {"balance": balance})

    @classmethod
    def delete(cls, name: str) -> int:
        return ClientBalanceRepository.delete(name)

class BankAccountService:
    @classmethod
    def get(cls) -> BankAccountSchema:
        db_account = BankAccountRepository.get()
        return BankAccountSchema(balance=db_account.balance)

    @classmethod
    def update(cls, balance: float) -> int:
        return BankAccountRepository.update({"balance": balance})

    @classmethod
    def add_money(cls, amount: float) -> int:
        """Добавляет деньги на банковский счет"""
        current = cls.get()
        return cls.update(current.balance + amount)

    @classmethod
    def subtract_money(cls, amount: float) -> int:
        """Списывает деньги с банковского счета"""
        current = cls.get()
        if current.balance < amount:
            raise ValueError(f"Недостаточно средств в банке. Доступно: {current.balance}, требуется: {amount}")
        return cls.update(current.balance - amount)

class DepositService:
    @classmethod
    def create_deposit(cls, client_name: str, amount: float, days: int, interest_rate: float = 5.0) -> DepositSchema:
        """Создает новый вклад"""
        # Проверяем, что клиент существует и у него достаточно средств
        client = ClientBalanceService.find_db(client_name)
        if not client:
            raise ValueError(f"Клиент {client_name} не найден")
        if client.balance < amount:
            raise ValueError(f"Недостаточно средств у клиента {client_name}. Доступно: {client.balance}, требуется: {amount}")
        
        # Рассчитываем дату выплаты (1 день = 17 минут в Minecraft)
        minecraft_minutes_per_day = 17
        total_minutes = days * minecraft_minutes_per_day
        payout_date = datetime.now() + timedelta(minutes=total_minutes)
        
        # Рассчитываем проценты
        interest_earned = amount * (interest_rate / 100) * (days / 365)
        
        # Списываем деньги с клиента
        ClientBalanceService.update(client.id, client.balance - amount)
        
        # Добавляем деньги в банк
        BankAccountService.add_money(amount)
        
        # Создаем вклад
        deposit_data = {
            "client_name": client_name,
            "amount": amount,
            "interest_rate": interest_rate,
            "days": days,
            "payout_date": payout_date,
            "interest_earned": interest_earned
        }
        
        db_deposit = DepositRepository.add(deposit_data)
        return DepositSchema(
            id=db_deposit.id,
            client_name=db_deposit.client_name,
            amount=db_deposit.amount,
            interest_rate=db_deposit.interest_rate,
            days=db_deposit.days,
            created_at=db_deposit.created_at,
            payout_date=db_deposit.payout_date,
            is_active=db_deposit.is_active,
            interest_earned=db_deposit.interest_earned
        )

    @classmethod
    def get_client_deposits(cls, client_name: str) -> List[DepositSchema]:
        """Получает активные вклады клиента"""
        db_deposits = DepositRepository.find_by_client(client_name)
        return [
            DepositSchema(
                id=deposit.id,
                client_name=deposit.client_name,
                amount=deposit.amount,
                interest_rate=deposit.interest_rate,
                days=deposit.days,
                created_at=deposit.created_at,
                payout_date=deposit.payout_date,
                is_active=deposit.is_active,
                interest_earned=deposit.interest_earned
            ) for deposit in db_deposits
        ]

    @classmethod
    def process_expired_deposits(cls) -> List[DepositSchema]:
        """Обрабатывает просроченные вклады и возвращает деньги клиентам"""
        expired_deposits = DepositRepository.find_expired_deposits()
        processed_deposits = []
        
        for deposit in expired_deposits:
            # Возвращаем деньги клиенту (вклад + проценты)
            client = ClientBalanceService.find_db(deposit.client_name)
            if client:
                total_return = deposit.amount + deposit.interest_earned
                ClientBalanceService.update(client.id, client.balance + total_return)
                
                # Списываем деньги с банка
                BankAccountService.subtract_money(deposit.amount)
                
                # Помечаем вклад как неактивный
                DepositRepository.update_deposit(deposit.id, {"is_active": False})
                
                processed_deposits.append(DepositSchema(
                    id=deposit.id,
                    client_name=deposit.client_name,
                    amount=deposit.amount,
                    interest_rate=deposit.interest_rate,
                    days=deposit.days,
                    created_at=deposit.created_at,
                    payout_date=deposit.payout_date,
                    is_active=False,
                    interest_earned=deposit.interest_earned
                ))
        
        return processed_deposits

    @classmethod
    def early_return_deposit(cls, deposit_id: int) -> DepositSchema:
        """Досрочно возвращает вклад с пропорциональными процентами"""
        # Находим вклад
        db_deposit = DepositRepository.find_by_id(deposit_id)
        if not db_deposit:
            raise ValueError(f"Вклад с ID {deposit_id} не найден")
        
        if not db_deposit.is_active:
            raise ValueError("Вклад уже неактивен")
        
        # Рассчитываем пропорциональные проценты за фактическое время
        from datetime import datetime
        now = datetime.now()
        time_passed = now - db_deposit.created_at
        total_duration = db_deposit.payout_date - db_deposit.created_at
        
        # Процент времени, которое прошло
        time_ratio = time_passed.total_seconds() / total_duration.total_seconds()
        time_ratio = min(time_ratio, 1.0)  # Не больше 100%
        
        # Рассчитываем пропорциональные проценты
        proportional_interest = db_deposit.interest_earned * time_ratio
        
        # Возвращаем деньги клиенту (вклад + пропорциональные проценты)
        client = ClientBalanceService.find_db(db_deposit.client_name)
        if client:
            total_return = db_deposit.amount + proportional_interest
            ClientBalanceService.update(client.id, client.balance + total_return)
            
            # Списываем деньги с банка
            BankAccountService.subtract_money(db_deposit.amount)
            
            # Помечаем вклад как неактивный
            DepositRepository.update_deposit(db_deposit.id, {"is_active": False})
            
            return DepositSchema(
                id=db_deposit.id,
                client_name=db_deposit.client_name,
                amount=db_deposit.amount,
                interest_rate=db_deposit.interest_rate,
                days=db_deposit.days,
                created_at=db_deposit.created_at,
                payout_date=db_deposit.payout_date,
                is_active=False,
                interest_earned=proportional_interest
            )
        
        raise ValueError(f"Клиент {db_deposit.client_name} не найден")


class CreditService:
    @classmethod
    def create_credit(cls, client_name: str, amount: float, days: int, interest_rate: float = 10.0) -> CreditSchema:
        """Создает новый кредит"""
        # Проверяем, что клиент существует
        client = ClientBalanceService.find_db(client_name)
        if not client:
            raise ValueError(f"Клиент {client_name} не найден")
        
        # Рассчитываем дату погашения (1 день = 17 минут в Minecraft)
        minecraft_minutes_per_day = 17
        total_minutes = days * minecraft_minutes_per_day
        due_date = datetime.now() + timedelta(minutes=total_minutes)
        
        # Рассчитываем проценты
        interest_owed = amount * (interest_rate / 100) * (days / 365)
        
        # Выдаем деньги клиенту
        ClientBalanceService.update(client.id, client.balance + amount)
        
        # Списываем деньги с банка
        BankAccountService.subtract_money(amount)
        
        # Создаем кредит
        credit_data = {
            "client_name": client_name,
            "amount": amount,
            "interest_rate": interest_rate,
            "days": days,
            "due_date": due_date,
            "interest_owed": interest_owed
        }
        
        db_credit = CreditRepository.add(credit_data)
        return CreditSchema(
            id=db_credit.id,
            client_name=db_credit.client_name,
            amount=db_credit.amount,
            interest_rate=db_credit.interest_rate,
            days=db_credit.days,
            created_at=db_credit.created_at,
            due_date=db_credit.due_date,
            is_active=db_credit.is_active,
            interest_owed=db_credit.interest_owed
        )

    @classmethod
    def get_client_credits(cls, client_name: str) -> List[CreditSchema]:
        """Получает активные кредиты клиента"""
        db_credits = CreditRepository.find_by_client(client_name)
        return [
            CreditSchema(
                id=credit.id,
                client_name=credit.client_name,
                amount=credit.amount,
                interest_rate=credit.interest_rate,
                days=credit.days,
                created_at=credit.created_at,
                due_date=credit.due_date,
                is_active=credit.is_active,
                interest_owed=credit.interest_owed
            ) for credit in db_credits
        ]

    @classmethod
    def process_overdue_credits(cls) -> List[CreditSchema]:
        """Обрабатывает просроченные кредиты"""
        overdue_credits = CreditRepository.find_overdue_credits()
        processed_credits = []
        
        for credit in overdue_credits:
            # Помечаем кредит как неактивный (просроченный)
            CreditRepository.update_credit(credit.id, {"is_active": False})
            
            processed_credits.append(CreditSchema(
                id=credit.id,
                client_name=credit.client_name,
                amount=credit.amount,
                interest_rate=credit.interest_rate,
                days=credit.days,
                created_at=credit.created_at,
                due_date=credit.due_date,
                is_active=False,
                interest_owed=credit.interest_owed
            ))
        
        return processed_credits

    @classmethod
    def early_repay_credit(cls, credit_id: int) -> CreditSchema:
        """Досрочно погашает кредит с пропорциональными процентами"""
        # Находим кредит
        db_credit = CreditRepository.find_by_id(credit_id)
        if not db_credit:
            raise ValueError(f"Кредит с ID {credit_id} не найден")
        
        if not db_credit.is_active:
            raise ValueError("Кредит уже неактивен")
        
        # Рассчитываем пропорциональные проценты за фактическое время
        from datetime import datetime
        now = datetime.now()
        time_passed = now - db_credit.created_at
        total_duration = db_credit.due_date - db_credit.created_at
        
        # Процент времени, которое прошло
        time_ratio = time_passed.total_seconds() / total_duration.total_seconds()
        time_ratio = min(time_ratio, 1.0)  # Не больше 100%
        
        # Рассчитываем пропорциональные проценты
        proportional_interest = db_credit.interest_owed * time_ratio
        
        # Списываем деньги с клиента (кредит + пропорциональные проценты)
        client = ClientBalanceService.find_db(db_credit.client_name)
        if client:
            total_repayment = db_credit.amount + proportional_interest
            if client.balance < total_repayment:
                raise ValueError(f"Недостаточно средств у клиента {db_credit.client_name}. Доступно: {client.balance}, требуется: {total_repayment}")
            
            ClientBalanceService.update(client.id, client.balance - total_repayment)
            
            # Добавляем деньги в банк
            BankAccountService.add_money(db_credit.amount)
            
            # Помечаем кредит как неактивный
            CreditRepository.update_credit(db_credit.id, {"is_active": False})
            
            return CreditSchema(
                id=db_credit.id,
                client_name=db_credit.client_name,
                amount=db_credit.amount,
                interest_rate=db_credit.interest_rate,
                days=db_credit.days,
                created_at=db_credit.created_at,
                due_date=db_credit.due_date,
                is_active=False,
                interest_owed=proportional_interest
            )
        
        raise ValueError(f"Клиент {db_credit.client_name} не найден")
