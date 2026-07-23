from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from . import schemas, service
from typing import List # Importa esto al inicio

router = APIRouter(prefix="/estudiantes", tags=["Gestión de Estudiantes"])
_service = service.EstudianteService()

@router.post("/", response_model=schemas.EstudianteResponse)
def crear_estudiante(estudiante: schemas.EstudianteCreate, db: Session = Depends(get_db)):
    return _service.registrar_estudiante(db, estudiante)



@router.get("/", response_model=List[schemas.EstudianteResponse])
def obtener_estudiantes(db: Session = Depends(get_db)):
    return _service.listar_estudiantes(db)

@router.patch("/{id_persona}/estado")
def actualizar_estado_estudiante(
    id_persona: int, 
    update_data: schemas.EstadoUpdate, 
    db: Session = Depends(get_db)
):
    persona = _service.repository.update_estado(db, id_persona, update_data.estado)
    if not persona:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return {"message": f"Estado actualizado a {update_data.estado} exitosamente"}

@router.put("/{id_persona}")
def actualizar_estudiante(
    id_persona: int, 
    estudiante_update: schemas.EstudianteCreate, 
    db: Session = Depends(get_db)
):
    estudiante = _service.repository.update_estudiante(db, id_persona, estudiante_update)
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return {"message": "Datos del estudiante actualizados con éxito"}

@router.get("/", response_model=list[schemas.EstudianteResponse]) # <--- USA ESTE ESQUEMA
def listar_estudiantes(db: Session = Depends(get_db)):
    return _service.repository.get_estudiantes(db)