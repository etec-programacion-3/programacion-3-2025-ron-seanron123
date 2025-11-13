from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product
from app.schemas.products import ProductResponse

router = APIRouter(
    prefix="/api/products",
    tags=["products"]
)

# Dependencia para verificar token
def verificar_token(x_token: str | None = Header(None)):
    if not x_token or x_token != "fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")

# GET todos los productos
@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db), token: str = Depends(verificar_token)):
    return db.query(Product).all()

# GET producto por ID
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), token: str = Depends(verificar_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product