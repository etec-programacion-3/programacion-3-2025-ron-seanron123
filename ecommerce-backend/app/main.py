from fastapi import FastAPI
from app.routes import product_routes, category_routes, order_routes

app = FastAPI(
    title="E-commerce API",
    description="API para gestión de productos, categorías y pedidos",
    version="1.0.0"
)

# 🔹 Rutas de productos
app.include_router(product_routes.router)

# 🔹 Rutas de categorías
app.include_router(category_routes.router)

# 🔹 Rutas de pedidos / carrito
app.include_router(order_routes.router)

# 🔹 Ruta de prueba
@app.get("/")
def root():
    return {"message": "API E-commerce funcionando correctamente"}
