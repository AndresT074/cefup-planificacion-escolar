from sqlalchemy.orm import Session
from .repository import DocenteRepository
from . import schemas

class DocenteService:
    def __init__(self):
        self.repository = DocenteRepository()

    def registrar_docente(self, db: Session, docente: schemas.DocenteCreate):
        return self.repository.create_docente(db, docente)

    def listar_docentes(self, db: Session):
        return self.repository.get_docentes(db)