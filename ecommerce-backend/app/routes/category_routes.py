from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.category_controller import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category
)
from app.database import get_db

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)   

@router.get("/")
def read_categories(db: Session = Depends(get_db)):
    return get_categories(db)

@router.get("/{category_id}")
def read_category(category_id: int, db: Session = Depends(get_db)):
    return get_category(category_id, db)

@router.post("/")
def add_category(category: dict, db: Session = Depends(get_db)):
    return create_category(category, db)

@router.put("/{category_id}")
def edit_category(category_id: int, category: dict, db: Session = Depends(get_db)):
    return update_category(category_id, category, db)

@router.delete("/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    return delete_category(category_id, db)
