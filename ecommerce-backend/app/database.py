from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

DATABASE_URL = "sqlite:///./ecommerce.db"

# Crear motor de base de datos
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite necesita esto
)

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de modelos
Base = declarative_base()

# Dependencia para obtener la sesión
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()