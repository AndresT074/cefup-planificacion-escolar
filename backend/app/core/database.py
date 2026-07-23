from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración de tu conexión MySQL
# Formato: mysql+pymysql://usuario:contraseña@servidor:puerto/nombre_bd
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root@localhost:3306/sistema_academico"

# El 'engine' que FastAPI no encontraba
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Función para inyectar la DB en los routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()