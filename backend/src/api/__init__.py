from fastapi import APIRouter

from src.api.auth import router as auth_router
from src.api.resources import router as resources_router
from src.api.clients import router as clients_router
from src.api.admin import router as admin_router

main_router = APIRouter()

main_router.include_router(auth_router)
main_router.include_router(resources_router)
main_router.include_router(clients_router)
main_router.include_router(admin_router)
