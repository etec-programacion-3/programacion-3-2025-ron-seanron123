from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product
from app.schemas.products import ProductResponse, ProductCreate
from app.controllers.product_controller import (
    get_products as ctrl_get_products,
    get_product as ctrl_get_product,
    create_product as ctrl_create_product,
    update_product as ctrl_update_product,
    delete_product as ctrl_delete_product,
)

router = APIRouter(
    prefix="/api/products",
    tags=["products"]
)

# Dependencia para verificar token
def verificar_token(x_token: str | None = Header(None)):
    if not x_token or x_token != "fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")

# GET todos los productos (público)
@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return ctrl_get_products(db)

# GET producto por ID (público)
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ctrl_get_product(product_id, db)


# Crear producto (no requiere token en este repo de ejemplo)
@router.post("/", response_model=ProductResponse)
def post_product(product: ProductCreate, db: Session = Depends(get_db)):
    return ctrl_create_product(product.dict(), db)


# Actualizar producto
@router.put("/{product_id}", response_model=ProductResponse)
def put_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    return ctrl_update_product(product_id, product.dict(), db)


# Eliminar producto
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return ctrl_delete_product(product_id, db)