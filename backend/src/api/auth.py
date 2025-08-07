from fastapi import APIRouter, HTTPException, Security
from fastapi.security import APIKeyHeader

from src.user.schemas import UserFilterSchema, UserLoginSchema, UserUpdateSchema
from src.user.service import UserService
from src.user.token import generate_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Авторизация"]
)

X_AUTH_TOKEN = APIKeyHeader(name="X-Auth-Token")

def get_current_user(token: str = Security(X_AUTH_TOKEN)):
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    user = UserService.find(UserFilterSchema(auth_token=token))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user

@router.post("/login")
def login_user(user: UserLoginSchema):
    ret = UserService.find(user)
    if ret is not None:
        token = generate_token()
        update_data = UserUpdateSchema(id=ret.id, auth_token=token)
        UserService.update(update_data)
        return {"status": "ok", "token": token, "user_role": ret.role}

    return {"status": "wrong login or password", "token": None, "user_role": None}
