from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.api import main_router

from src.db import create_tables, delete_tables
from src.populate_db import main as populate_db

from src.user.models import *
from src.clients.models import *
from src.resources.models import *

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    populate_db()
    yield
    delete_tables()

app = FastAPI(lifespan=lifespan)
app.include_router(main_router)

origins = [
    "http://localhost",  # адрес фронтенда
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # разрешённые источники
    allow_credentials=True,
    allow_methods=["*"],  # разрешить все HTTP методы
    allow_headers=["*"],  # разрешить все заголовки
)


def get_all_prices_res():
    ...

def get_all_money_users():
    ...


if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
