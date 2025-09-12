from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., example="Remera")
    description: Optional[str] = Field(None, example="Remera de algodón")
    price: float = Field(..., ge=0, example=1999.99)
    stock: int = Field(0, ge=0, example=10)
    imageURL: Optional[str] = Field(None, example="http://example.com/img.png")
    category_id: Optional[int] = Field(None, example=1)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    imageURL: Optional[str]
    category_id: Optional[int]

class ProductOut(ProductBase):
    id: int

    class Config:
        orm_mode = True
