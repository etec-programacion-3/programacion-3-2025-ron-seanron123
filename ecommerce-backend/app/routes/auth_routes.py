from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

# Usuarios "simulados" en memoria (para demo)
users_db = {
    "admin@example.com": {"password": "1234", "role": "admin"},
    "user@example.com": {"password": "1234", "role": "user"}
}

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin):
    if user.email not in users_db or users_db[user.email]["password"] != user.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"token": "fake-jwt-token", "role": users_db[user.email]["role"]}