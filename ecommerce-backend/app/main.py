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

# ✅ CONFIGURACIÓN DE CORS MEJORADA
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # En desarrollo permite todo, en producción quítalo
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todos los headers
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

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API funcionando"}