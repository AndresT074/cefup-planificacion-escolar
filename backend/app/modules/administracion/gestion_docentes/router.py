from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from typing import List
from . import schemas, service

router = APIRouter(prefix="/docentes", tags=["Gestión de Docentes"])
_service = service.DocenteService()

@router.post("/", response_model=schemas.DocenteResponse)
def crear_docente(docente: schemas.DocenteCreate, db: Session = Depends(get_db)):
    return _service.registrar_docente(db, docente)

@router.get("/", response_model=List[schemas.DocenteResponse])
def obtener_docentes(db: Session = Depends(get_db)):
    return _service.listar_docentes(db)

@router.patch("/{id_persona}/estado")
def actualizar_estado_docente(
    id_persona: int, 
    update_data: schemas.EstadoDocenteUpdate, 
    db: Session = Depends(get_db)
):
    persona = _service.repository.update_estado(db, id_persona, update_data.estado)
    if not persona:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    return {"message": "Estado del docente actualizado"}

# En app/modules/administracion/gestion_docentes/router.py
@router.put("/{id_persona}", response_model=schemas.DocenteResponse)
def actualizar_docente(id_persona: int, docente: schemas.DocenteCreate, db: Session = Depends(get_db)):
    db_docente = _service.repository.update_docente(db, id_persona, docente)
    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    return db_docente