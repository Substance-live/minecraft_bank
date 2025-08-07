import hmac
import hashlib

SECRET_KEY = b"secret_key_228"

def sign(balance: str, uid: str) -> str:
    message = f"{balance}.{uid}".encode()
    full_sig = hmac.new(SECRET_KEY, message, hashlib.sha256).hexdigest()
    short_sig = full_sig[:10]  # первые 10 символов
    return short_sig

def create_card_name(balance: str, uid: str) -> str:
    signature = sign(balance, uid)
    return f"{balance}.{uid}.{signature}"

def verify_card_name(card_name: str):
    parts = card_name.split(".")
    if len(parts) != 3:
        return False, None
    balance, uid, signature = parts
    if hmac.compare_digest(sign(balance, uid), signature):
        return True, balance
    else:
        return False, None


# Пример использования
balance = "0"
uid = "dima"

card_name_prover = "100.sunny.13012c0e23"

card_name = create_card_name(balance, uid)
print("Созданная карта:", card_name)


is_valid, bal = verify_card_name(card_name_prover)
if is_valid:
    print("Подпись верна, баланс:", bal)
else:
    print("Подпись НЕ верна! Карта подделана.")
