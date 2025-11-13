from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Importar rutas
from app.routes import (
    product_routes,
    category_routes,
    order_routes,
    user_routes,
    auth_routes
)

# Crear todas las tablas si no existen
Base.metadata.create_all(bind=engine)

# Crear instancia de FastAPI
app = FastAPI()

# Habilitar CORS para que el frontend pueda llamar la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠ En producción, poner solo el dominio permitido
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(product_routes.router)
app.include_router(category_routes.router)
app.include_router(order_routes.router)
app.include_router(user_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}