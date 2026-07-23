from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from app.core import models  # <--- IMPORTACIÓN CORREGIDA. Ahora lee del núcleo general.
from . import schemas

def get_anios(db: Session):
    # Usamos joinedload para traer los periodos de una vez y que no de error de conexión
    return db.query(models.AnioEscolar).options(joinedload(models.AnioEscolar.periodos)).all()

def create_anio(db: Session, anio: schemas.AnioCreate):
    db_anio = models.AnioEscolar(fecha_inicio=anio.fecha_inicio, fecha_fin=anio.fecha_fin, es_anio_actual=False)
    db.add(db_anio)
    db.commit()
    db.refresh(db_anio)
    
    for i in range(1, anio.num_periodos + 1):
        db_p = models.Periodo(id_anio_escolar=db_anio.id_anio_escolar, orden_periodo=i, fecha_inicio=anio.fecha_inicio, fecha_fin=anio.fecha_fin)
        db.add(db_p)
    db.commit()
    return db_anio

def get_periodos(db: Session, id_anio: int):
    return db.query(models.Periodo).filter(models.Periodo.id_anio_escolar == id_anio).all()

def update_periodo(db: Session, id_p: int, data: schemas.PeriodoBase):
    db.query(models.Periodo).filter(models.Periodo.id_periodo == id_p).update({"fecha_inicio": data.fecha_inicio, "fecha_fin": data.fecha_fin})
    db.commit()
    return True

def vincular_docente(db: Session, id_anio: int, id_per: int):
    db_v = models.VinculacionDocente(id_anio_escolar=id_anio, id_persona=id_per)
    db.add(db_v)
    db.commit()
    return True

def get_grupos(db: Session, id_anio: int):
    # Usamos un join para que en la tabla de "Planificación" aparezca el nombre del grado
    return db.query(
        models.Grupo.id_grupo,
        models.Grupo.nombre_grupo,
        models.Grupo.id_grado,
        models.Grado.nombre_grado, # Traemos el nombre para la tabla
        models.Grupo.id_docente_titular # <--- ¡ESTO ES LO QUE FALTABA!
    ).join(models.Grado, models.Grupo.id_grado == models.Grado.id_grado)\
     .filter(models.Grupo.id_anio_escolar == id_anio).all()

# --- AÑADIR ESTA FUNCIÓN PARA BLOQUEAR EL BORRADO ---
def delete_grupo_anio(db: Session, id_grupo: int):
    grupo = db.query(models.Grupo).filter(models.Grupo.id_grupo == id_grupo).first()
    if not grupo:
        return False
    
    # BLOQUEO: Si tiene titular, lanzamos error
    if grupo.id_docente_titular is not None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="El grupo tiene un titular. Quítelo primero.")

    # BORRADO REAL: Para que no reaparezca el docente
    # Borramos asignaciones de materias primero
    db.query(models.GrupoAsignatura).filter(models.GrupoAsignatura.id_grupo == id_grupo).delete()
    db.delete(grupo)
    db.commit()
    return True

def create_grupo(db: Session, id_anio: int, id_grado: int, nombre: str):
    db_g = models.Grupo(id_anio_escolar=id_anio, id_grado=id_grado, nombre_grupo=nombre)
    db.add(db_g)
    db.commit()
    return db_g

