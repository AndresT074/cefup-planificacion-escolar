from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from app.core.models import (
    AnioEscolar, Asignatura, GrupoAsignatura, Grupo,
    VinculacionDocente, Docente, Persona, Grado, Area, Matricula
)
from .schemas import (
    AsignaturaXGrupoCreate, AsignaturaXGrupoUpdate,
    GrupoCreate, GrupoUpdate
)

def get_anios_escolares(db: Session):
    return db.query(AnioEscolar).all()

def get_asignaturas(db: Session):
    return db.query(Asignatura).all()

def get_asignaturas_por_grado(db: Session, id_grado: int):
    return db.query(Asignatura).join(Area, Asignatura.id_area == Area.id_area).filter(Area.id_grado == id_grado).all()

def get_areas_por_grado(db: Session, id_grado: int):
    # Esta consulta busca directamente en la tabla AREA
    return db.query(Area).filter(Area.id_grado == id_grado).all()

def get_asignacion(db: Session, asignacion_id: int):
    return db.query(GrupoAsignatura).filter(GrupoAsignatura.id_grupo_asignatura == asignacion_id).first()

def get_asignaciones_por_grupo(db: Session, grupo_id: int):
    return db.query(GrupoAsignatura).options(
        joinedload(GrupoAsignatura.asignatura),
        joinedload(GrupoAsignatura.docente).joinedload(Docente.persona)
    ).filter(GrupoAsignatura.id_grupo == grupo_id).all()

def create_asignacion(db: Session, asignacion: AsignaturaXGrupoCreate):
    db_obj = GrupoAsignatura(**asignacion.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_asignacion(db: Session, asignacion_id: int, asignacion: AsignaturaXGrupoUpdate):
    db_obj = get_asignacion(db, asignacion_id)
    if not db_obj: return None
    for field, value in asignacion.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asignacion(db: Session, asignacion_id: int):
    db_obj = get_asignacion(db, asignacion_id)
    if not db_obj: return None
    db.delete(db_obj)
    db.commit()
    return True

def get_grupo(db: Session, grupo_id: int):
    return db.query(Grupo).options(
        joinedload(Grupo.grado),
        joinedload(Grupo.anio_escolar),
        joinedload(Grupo.docente_titular).joinedload(Docente.persona)
    ).filter(Grupo.id_grupo == grupo_id).first()

def get_grupos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Grupo).options(
        joinedload(Grupo.grado),
        joinedload(Grupo.anio_escolar),
        joinedload(Grupo.docente_titular).joinedload(Docente.persona)
    ).offset(skip).limit(limit).all()

def get_grupos_por_anio_y_grado(db: Session, anio_escolar_id: int, grado_id: int):
    return db.query(Grupo).options(
        joinedload(Grupo.grado),
        joinedload(Grupo.anio_escolar),
        joinedload(Grupo.docente_titular).joinedload(Docente.persona)
    ).filter(Grupo.id_anio_escolar == anio_escolar_id, Grupo.id_grado == grado_id).all()

# --- VALIDACIÓN: Verificar si el nombre ya existe en ese grado y año ---
def existe_grupo_nombre(db: Session, id_grado: int, id_anio: int, nombre: str):
    return db.query(Grupo).filter(
        Grupo.id_grado == id_grado,
        Grupo.id_anio_escolar == id_anio,
        Grupo.nombre_grupo == nombre
    ).first()

def create_grupo(db: Session, grupo: GrupoCreate):
    db_obj = Grupo(**grupo.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_grupo(db: Session, grupo_id: int, grupo: GrupoUpdate):
    db_obj = db.query(Grupo).filter(Grupo.id_grupo == grupo_id).first()
    if not db_obj: return None
    for field, value in grupo.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# --- VALIDACIÓN: Contar matrículas antes de borrar ---
def contar_matriculas_grupo(db: Session, grupo_id: int):
    return db.query(Matricula).filter(Matricula.id_grupo == grupo_id).count()

def delete_grupo(db: Session, grupo_id: int):
    db_obj = db.query(Grupo).filter(Grupo.id_grupo == grupo_id).first()
    if not db_obj: return None
    db.delete(db_obj)
    db.commit()
    return True

def get_docentes_vinculados(db: Session, anio_escolar_id: int):
    return db.query(VinculacionDocente).options(
        joinedload(VinculacionDocente.docente).joinedload(Docente.persona)
    ).filter(VinculacionDocente.id_anio_escolar == anio_escolar_id).all()

def get_docentes(db: Session):
    return db.query(Docente).options(joinedload(Docente.persona)).all()

def get_grados(db: Session):
    return db.query(Grado).all()