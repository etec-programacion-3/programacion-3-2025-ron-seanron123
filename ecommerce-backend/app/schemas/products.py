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
class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    imageURL: Optional[str] = None
    # Permitir None en category_id para evitar errores si hay productos huérfanos en la BD
    category_id: Optional[int] = None

    class Config:
        orm_mode = True
