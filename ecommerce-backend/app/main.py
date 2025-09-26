from fastapi import FastAPI
from app.database import Base, engine
from app.models.models import Product, Category

app = FastAPI()

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "API de E-commerce activa"}
