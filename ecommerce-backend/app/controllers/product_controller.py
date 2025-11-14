from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.models import Product
from app.database import get_db

# Obtener todos los productos
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

# Obtener un producto por ID
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

# Crear un producto nuevo
def create_product(product_data: dict, db: Session = Depends(get_db)):
    new_product = Product(**product_data)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# Actualizar un producto
def update_product(product_id: int, product_data: dict, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for key, value in product_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

# Eliminar un producto
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(product)
    db.commit()
    return {"message": "Producto eliminado correctamente"}
