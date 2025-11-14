from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, Field

from app.models.user import User
from app.database import get_db

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

# 🔹 Configuración de PassLib: usar pbkdf2_sha256 localmente para evitar dependencias
# en la implementación nativa de bcrypt (evita errores de instalación durante pruebas).
# Para producción, considerar volver a 'bcrypt' o 'argon2'.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# 🔹 Schemas Pydantic para validar datos de entrada
class UserCreateSafe(BaseModel):
    username: str
    # usar Field para evitar expresiones de llamada en anotaciones de tipo
    password: str = Field(..., max_length=72)  # 🔹 Limita a 72 caracteres para bcrypt
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
    
    # 🔹 Comprobar longitud en bytes (bcrypt limita a 72 bytes)
    if len(user.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña es demasiado larga (máx. 72 bytes). Truncar o usar otra contraseña."
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
    # 🔹 Comprobar longitud en bytes antes de verificar (evitar error de bcrypt)
    if len(user.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña es demasiado larga (máx. 72 bytes)."
        )

    # 🔹 Verifica contraseña
    if not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario o contraseña incorrectos"
        )

    return {"message": "Login exitoso", "user_id": db_user.id}


# Listar todos los usuarios (sin incluir contraseñas)
@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users