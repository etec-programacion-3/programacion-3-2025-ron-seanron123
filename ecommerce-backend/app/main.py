from fastapi import FastAPI
from app.routes import product_routes

app = FastAPI(title="API E-commerce")

# Ruta raíz
@app.get("/")
def root():
    return {"message": "API de E-commerce activa"}

# Registrar rutas de productos
app.include_router(product_routes.router)
