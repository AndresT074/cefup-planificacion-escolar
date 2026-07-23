from fastapi import HTTPException
from sqlalchemy.orm import Session

# Importamos las funciones del repositorio
from .repository import (
    create_grupo,
    update_grupo,
    delete_grupo,
    get_grupo,
    get_grupos,
    get_asignaciones_por_grupo,
    get_asignaturas_por_grado,
    create_asignacion,
    delete_asignacion,
    update_asignacion, # <--- Asegúrate de que esto esté en repository.py
)
from .schemas import GrupoCreate, GrupoUpdate, AsignaturaXGrupoCreate, AsignaturaXGrupoUpdate

def _sincronizar_asignaturas_de_grupo(db: Session, id_grupo: int, id_grado: int, id_docente_titular: int = None):
    """
    Garantiza que un grupo tenga las asignaturas de su grado y asigna al docente titular.
    """
    asignaturas_grado = get_asignaturas_por_grado(db, id_grado)
    if not asignaturas_grado:
        return 

    asignaciones_actuales = get_asignaciones_por_grupo(db, id_grupo)
    ids_actuales = {axg.id_asignatura for axg in asignaciones_actuales}

    for asig in asignaturas_grado:
        if asig.id_asignatura not in ids_actuales:
            # Crear materia con el docente titular
            create_asignacion(
                db,
                AsignaturaXGrupoCreate(
                    id_grupo=id_grupo,
                    id_asignatura=asig.id_asignatura,
                    id_docente=id_docente_titular
                ),
            )
        else:
            # Si ya existe pero no tiene docente, actualizar con el titular
            for axg in asignaciones_actuales:
                if axg.id_asignatura == asig.id_asignatura and axg.id_docente is None:
                    update_asignacion(
                        db, 
                        axg.id_grupo_asignatura, 
                        AsignaturaXGrupoUpdate(id_docente=id_docente_titular)
                    )

def servicio_crear_grupo(db: Session, grupo: GrupoCreate):
    nuevo_grupo = create_grupo(db, grupo)
    _sincronizar_asignaturas_de_grupo(db, nuevo_grupo.id_grupo, nuevo_grupo.id_grado, nuevo_grupo.id_docente_titular)
    return nuevo_grupo

def servicio_actualizar_grupo(db: Session, grupo_id: int, data: GrupoUpdate):
    grupo_actual = get_grupo(db, grupo_id)
    if not grupo_actual:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")

    id_grado_objetivo = data.id_grado if data.id_grado is not None else grupo_actual.id_grado
    
    # Realizamos la actualización
    actualizado = update_grupo(db, grupo_id, data)
    
    # Sincronizamos las materias con el nuevo titular
    _sincronizar_asignaturas_de_grupo(db, actualizado.id_grupo, id_grado_objetivo, actualizado.id_docente_titular)

    return actualizado

def servicio_sincronizar_todos_los_grupos(db: Session):
    grupos = get_grupos(db, skip=0, limit=1000000)
    procesados = 0
    for grupo in grupos:
        _sincronizar_asignaturas_de_grupo(db, grupo.id_grupo, grupo.id_grado, grupo.id_docente_titular)
        procesados += 1
    return {"mensaje": "Sincronización completada.", "grupos_procesados": procesados}

def servicio_eliminar_grupo(db: Session, grupo_id: int):
    ok = delete_grupo(db, grupo_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    return {"mensaje": "Grupo eliminado correctamente"}