from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# =========================================
# IMPORT DB
# =========================================
from app.core.database import get_db

# =========================================
# IMPORT DEL REPOSITORY (solo consultas simples)
# =========================================
from app.modules.administracion.gestion_grupos.repository import (
    get_anios_escolares,
    get_asignaturas,
    get_asignaturas_por_grado,
    get_docentes_vinculados,
    get_docentes,
    get_grados,
    get_grupo,
    get_areas_por_grado,
    get_grupos,
    get_grupos_por_anio_y_grado,
    get_asignacion,
    get_asignaciones_por_grupo,
    update_asignacion,
    delete_asignacion,
)

# =========================================
# IMPORT DEL SERVICE — SOLO GRUPOS
# =========================================
from app.modules.administracion.gestion_grupos.service import (
    servicio_crear_grupo,
    servicio_actualizar_grupo,
    servicio_eliminar_grupo,
    servicio_sincronizar_todos_los_grupos,
)

# =========================================
# IMPORT DE SCHEMAS
# =========================================
from app.modules.administracion.gestion_grupos.schemas import (
    AnioEscolar,
    Asignatura,
    DocenteVinculado,
    Docente,
    Grado,
    Grupo,
    GrupoCreate,
    GrupoUpdate,
    AsignaturaXGrupo,
    AsignaturaXGrupoCreate,
    AsignaturaXGrupoUpdate
)

router = APIRouter()

# ===============================
# SUBROUTER: AÑO ESCOLAR
# ===============================
anio_router = APIRouter(prefix="/anio-escolar", tags=["Año Escolar"])

@anio_router.get("/", response_model=list[AnioEscolar])
def listar_anios(db: Session = Depends(get_db)):
    return get_anios_escolares(db)


# ===============================
# SUBROUTER: ASIGNATURAS
# ===============================
asignatura_router = APIRouter(prefix="/asignatura", tags=["Asignatura"])

@asignatura_router.get("/", response_model=list[Asignatura])
def listar_asignaturas(db: Session = Depends(get_db)):
    return get_asignaturas(db)

@asignatura_router.get("/grado/{grado_id}", response_model=list[Asignatura])
def listar_por_grado(grado_id: int, db: Session = Depends(get_db)):
    return get_asignaturas_por_grado(db, grado_id)


# ===============================
# SUBROUTER: DOCENTE VINCULADO
# ===============================
doc_vinc_router = APIRouter(prefix="/docente-vinculado", tags=["Docente Vinculado"])

@doc_vinc_router.get("/anio/{anio_escolar_id}", response_model=list[DocenteVinculado])
def listar_por_anio(anio_escolar_id: int, db: Session = Depends(get_db)):
    return get_docentes_vinculados(db, anio_escolar_id)

# ===============================
# SUBROUTER: DOCENTES
# ===============================
docente_router = APIRouter(prefix="/docente", tags=["Docente"])

@docente_router.get("/", response_model=list[Docente])
def listar_docentes(db: Session = Depends(get_db)):
    return get_docentes(db)


# ===============================
# SUBROUTER: GRADOS
# ===============================
grado_router = APIRouter(prefix="/grado", tags=["Grado"])

@grado_router.get("/", response_model=list[Grado])
def listar_grados(db: Session = Depends(get_db)):
    return get_grados(db)

@grado_router.get("/{grado_id}/areas")
def listar_areas_del_grado(grado_id: int, db: Session = Depends(get_db)):
    return get_areas_por_grado(db, grado_id)
# ===============================
# SUBROUTER: GRUPO
# ===============================
grupo_router = APIRouter(prefix="/grupo", tags=["Grupo"])

@grupo_router.get("/", response_model=list[Grupo])
def listar(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_grupos(db, skip, limit)

@grupo_router.get("/por-anio-grado/{anio_escolar_id}/{grado_id}", response_model=list[Grupo])
def listar_por_anio_y_grado(anio_escolar_id: int, grado_id: int, db: Session = Depends(get_db)):
    return get_grupos_por_anio_y_grado(db, anio_escolar_id, grado_id)

@grupo_router.post("/", response_model=Grupo)
def crear(grupo: GrupoCreate, db: Session = Depends(get_db)):
    return servicio_crear_grupo(db, grupo)

@grupo_router.put("/{grupo_id}", response_model=Grupo)
def actualizar(grupo_id: int, grupo: GrupoUpdate, db: Session = Depends(get_db)):
    return servicio_actualizar_grupo(db, grupo_id, grupo)

@grupo_router.delete("/{grupo_id}")
def eliminar(grupo_id: int, db: Session = Depends(get_db)):
    return servicio_eliminar_grupo(db, grupo_id)

@grupo_router.post("/sincronizar-asignaturas")
def sincronizar_asignaturas_de_grupos(db: Session = Depends(get_db)):
    return servicio_sincronizar_todos_los_grupos(db)

@grupo_router.get("/{grupo_id}", response_model=Grupo)
def obtener_grupo(grupo_id: int, db: Session = Depends(get_db)):
    grupo = get_grupo(db, grupo_id)
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    return grupo
# ===============================
# SUBROUTER: ASIGNATURA X GRUPO
# ===============================
axg_router = APIRouter(prefix="/asignacion-grupo", tags=["Asignatura x Grupo"])

@axg_router.get("/grupo/{grupo_id}", response_model=list[AsignaturaXGrupo])
def listar_asignaciones(grupo_id: int, db: Session = Depends(get_db)):
    return get_asignaciones_por_grupo(db, grupo_id)

@axg_router.post("/", response_model=AsignaturaXGrupo)
def crear_asignacion_route(asignacion: AsignaturaXGrupoCreate, db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=400,
        detail="La creación manual está deshabilitada. Las asignaciones ahora se crean automáticamente al crear el grupo."
    )

@axg_router.put("/{asignacion_id}", response_model=AsignaturaXGrupo)
def actualizar_asignacion_route(asignacion_id: int, asignacion: AsignaturaXGrupoUpdate, db: Session = Depends(get_db)):
    obj = update_asignacion(db, asignacion_id, asignacion)
    if not obj:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return obj

@axg_router.delete("/{asignacion_id}")
def eliminar_asignacion_route(asignacion_id: int, db: Session = Depends(get_db)):
    ok = delete_asignacion(db, asignacion_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return {"mensaje": "Asignación eliminada"}


# ===============================
# REGISTRO FINAL DE SUBROUTERS
# ===============================
router.include_router(anio_router)
router.include_router(asignatura_router)
router.include_router(doc_vinc_router)
router.include_router(docente_router)
router.include_router(grado_router)
router.include_router(grupo_router)
router.include_router(axg_router)
