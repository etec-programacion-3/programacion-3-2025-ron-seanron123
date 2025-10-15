from pydantic import BaseModel
from typing import List

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id: int
    user_id: int | None
    status: str
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}
