from pydantic import BaseModel
from typing import Optional

# Schema para crear un producto
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    imageURL: Optional[str] = None
    category_id: int

# Schema para devolver un producto
class ProductResponse(ProductCreate):
    id: int

    class Config:
        orm_mode = True
