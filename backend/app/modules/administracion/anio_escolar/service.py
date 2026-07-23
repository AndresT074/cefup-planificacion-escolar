from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import repository, schemas
from app.core.models import Grupo, GrupoAsignatura

def listar_anios(db: Session):
    return repository.get_anios(db)

def registrar_nuevo_anio(db: Session, anio_data: schemas.AnioCreate):
    # Aquí podrías validar que la fecha fin sea mayor a inicio, etc.
    return repository.create_anio(db, anio_data)

def establecer_anio_actual(db: Session, id_anio: int):
    return repository.activar_anio(db, id_anio)
# app/modules/administracion/anio_escolar/service.py (o donde esté la ruta /anios/grupos)

def eliminar_grupo_del_anio(db: Session, id_grupo: int):
    # 1. Traemos el grupo desde la base de datos
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")

    # 2. BLOQUEO: Si tiene titular, lanzamos el error
    if grupo.id_docente_titular is not None:
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar: El grupo tiene un docente titular. Quítelo primero."
        )

    # 3. ELIMINACIÓN TOTAL: Para que el docente NO reaparezca
    # Borramos primero las materias vinculadas para que no quede "basura" en la BD
    db.query(GrupoAsignatura).filter(GrupoAsignatura.id_grupo == id_grupo).delete()
    
    # Borramos el grupo definitivamente
    db.delete(grupo)
    db.commit()
    return {"ok": True}