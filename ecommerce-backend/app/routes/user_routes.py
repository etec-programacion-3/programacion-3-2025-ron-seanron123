from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import hashlib

from app.models.user import User
from app.database import get_db

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

# 🔹 Función para hashear contraseñas con SHA256
def hash_password(password: str) -> str:
    """Hashea la contraseña usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña coincide con el hash"""
    return hash_password(plain_password) == hashed_password

# 🔹 Schemas Pydantic para validar datos de entrada
class UserCreateSafe(BaseModel):
    username: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True

# 🔹 Endpoint de registro
@router.post("/register")
def register(user: UserCreateSafe, db: Session = Depends(get_db)):
    # 🔹 Verifica si el usuario ya existe
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe"
        )
    
    # 🔹 Hashea la contraseña de manera segura
    hashed_pw = hash_password(user.password)
    
    # 🔹 Crea el nuevo usuario
    new_user = User(
        username=user.username,
        password=hashed_pw,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Usuario registrado exitosamente", "user_id": new_user.id}

# 🔹 Endpoint de login
class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario o contraseña incorrectos"
        )
    # 🔹 Verifica contraseña
    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario o contraseña incorrectos"
        )

    # ✅ AHORA DEVUELVE EL ROLE (ESTO ESTABA FALTANDO)
    return {
        "message": "Login exitoso", 
        "user_id": db_user.id,
        "role": db_user.role
    }