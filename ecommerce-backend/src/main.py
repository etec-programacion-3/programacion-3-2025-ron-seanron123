from fastapi import FastAPI
from src.controllers.root import router as root_router
from src.routers.product_router import router as product_router

app = FastAPI(title="E-commerce API")

# endpoint raíz
app.include_router(root_router)

# router de productos
app.include_router(product_router)
