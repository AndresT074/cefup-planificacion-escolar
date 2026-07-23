from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .repository import EstudianteRepository
from . import schemas

class EstudianteService:
    def __init__(self):
        self.repository = EstudianteRepository()

    def registrar_estudiante(self, db: Session, estudiante: schemas.EstudianteCreate):
        # Regla de negocio: No duplicar documentos
        # (Aquí llamarías a una función del repository para buscar por documento)
        return self.repository.create_estudiante(db, estudiante)
        
    def listar_estudiantes(self, db: Session):
        return self.repository.get_estudiantes(db)