from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes

# Importar las rutas
from app.routes.product_routes import router as product_router
from app.routes.category_routes import router as category_router
from app.routes.order_routes import router as order_router
from app.routes.user_routes import router as user_router

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas
app.include_router(product_router)
app.include_router(category_router)
app.include_router(order_router)
app.include_router(user_router)
app.include_router(auth_routes.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}