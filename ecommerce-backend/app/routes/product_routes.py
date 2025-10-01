from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.product_controller import (
    get_products,
    get_product,
    create_product,
    update_product,
    delete_product
)
from app.database import get_db

router = APIRouter(
    prefix="/api/products",
    tags=["products"]
)

# GET /api/products → lista todos los productos
@router.get("/")
def read_products(db: Session = Depends(get_db)):
    return get_products(db)

# GET /api/products/{id} → obtiene un producto por id
@router.get("/{product_id}")
def read_product(product_id: int, db: Session = Depends(get_db)):
    return get_product(product_id, db)

# POST /api/products → crea un producto nuevo
@router.post("/")
def add_product(product: dict, db: Session = Depends(get_db)):
    return create_product(product, db)

# PUT /api/products/{id} → actualiza un producto existente
@router.put("/{product_id}")
def edit_product(product_id: int, product: dict, db: Session = Depends(get_db)):
    return update_product(product_id, product, db)

# DELETE /api/products/{id} → elimina un producto
@router.delete("/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db)):
    return delete_product(product_id, db)
