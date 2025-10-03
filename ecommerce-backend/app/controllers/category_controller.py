from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.models import Category
from app.database import get_db

# Obtener todas las categorías
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

# Obtener categoría por ID
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category

# Crear nueva categoría
def create_category(category_data: dict, db: Session = Depends(get_db)):
    new_category = Category(**category_data)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# Actualizar categoría
def update_category(category_id: int, category_data: dict, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    for key, value in category_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category

# Eliminar categoría
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db.delete(category)
    db.commit()
    return {"message": "Categoría eliminada correctamente"}
