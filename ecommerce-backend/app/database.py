from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de la base de datos SQLite
DATABASE_URL = "sqlite:///./ecommerce.db"

# Motor de conexión
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Crear sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()
