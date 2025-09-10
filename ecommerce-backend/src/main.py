from fastapi import FastAPI
from .controllers.root import router as root_router

app = FastAPI(title = "E-commerce API")

app.include_router(root_router)
