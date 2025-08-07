from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime
from src.db import Base

class ResourceOrm(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    amount: Mapped[int]

class ResourcePriceHistoryOrm(Base):
    __tablename__ = "resource_price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    resource_name: Mapped[str]
    price: Mapped[float]
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now())
