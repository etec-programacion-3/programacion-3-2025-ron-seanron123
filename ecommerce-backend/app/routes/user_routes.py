from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, constr

from app.models.user import User
from app.database import get_db

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

# 🔹 Configuración de PassLib para bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔹 Schemas Pydantic para validar datos de entrada
class UserCreateSafe(BaseModel):
    username: str
    password: constr(max_length=72)  # 🔹 Limita a 72 caracteres para bcrypt
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True

# 🔹 Endpoint de registro
@router.post("/register", response_model=UserResponse)
def register(user: UserCreateSafe, db: Session = Depends(get_db)):
    # 🔹 Verifica si el usuario ya existe
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe"
        )
    
    # 🔹 Hashea la contraseña de manera segura
    hashed_pw = pwd_context.hash(user.password)
    
    # 🔹 Crea el nuevo usuario
    new_user = User(
        username=user.username,
        password=hashed_pw,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

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
    if not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario o contraseña incorrectos"
        )

    return {"message": "Login exitoso", "user_id": db_user.id}