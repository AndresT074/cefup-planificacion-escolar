from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from . import schemas, repository
from typing import List

router = APIRouter(prefix="/anios", tags=["Anio Escolar"])

@router.get("/", response_model=List[schemas.AnioResponse])
def listar_anios(db: Session = Depends(get_db)):
    return repository.get_anios(db)

@router.post("/")
def crear_anio(anio: schemas.AnioCreate, db: Session = Depends(get_db)):
    return repository.create_anio(db, anio)

@router.put("/{id}")
def actualizar_anio_info(id: int, anio: schemas.AnioCreate, db: Session = Depends(get_db)):
    db.execute(text("UPDATE anio_escolar SET fecha_inicio = :ini, fecha_fin = :fin WHERE id_anio_escolar = :id"), 
               {"ini": anio.fecha_inicio, "fin": anio.fecha_fin, "id": id})
    db.commit()
    return {"status": "ok"}

@router.put("/{id}/activar")
def activar_anio(id: int, db: Session = Depends(get_db)):
    db.execute(text("UPDATE anio_escolar SET es_anio_actual = 0"))
    db.execute(text("UPDATE anio_escolar SET es_anio_actual = 1 WHERE id_anio_escolar = :id"), {"id": id})
    db.commit()
    return {"status": "ok"}

@router.get("/{id}/periodos")
def obtener_periodos(id: int, db: Session = Depends(get_db)):
    return repository.get_periodos(db, id)

@router.put("/periodos/{id_p}")
def editar_periodo(id_p: int, data: schemas.PeriodoBase, db: Session = Depends(get_db)):
    repository.update_periodo(db, id_p, data)
    return {"status": "ok"}

@router.post("/{id}/periodos")
def agregar_periodo_extra(id: int, db: Session = Depends(get_db)):
    result = db.execute(text("SELECT MAX(orden_periodo) FROM periodo WHERE id_anio_escolar = :id"), {"id": id}).fetchone()
    nuevo_orden = (result[0] or 0) + 1
    db.execute(text("INSERT INTO periodo (id_anio_escolar, orden_periodo, fecha_inicio, fecha_fin) VALUES (:id, :ord, CURDATE(), CURDATE())"),
               {"id": id, "ord": nuevo_orden})
    db.commit()
    return {"status": "ok"}

@router.delete("/{id}/periodos/ultimo")
def eliminar_ultimo_periodo(id: int, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM periodo WHERE id_anio_escolar = :id ORDER BY orden_periodo DESC LIMIT 1"), {"id": id})
    db.commit()
    return {"status": "ok"}

@router.get("/docentes/todos")
def obtener_todos_los_docentes(db: Session = Depends(get_db)):
    res = db.execute(text("SELECT d.id_persona, p.nombres, p.apellidos FROM docente d JOIN persona p ON d.id_persona = p.id_persona")).fetchall()
    return [{"id_persona": r[0], "nombres": r[1], "apellidos": r[2]} for r in res]

@router.get("/{id}/docentes")
def listar_docentes_vinculados(id: int, db: Session = Depends(get_db)):
    res = db.execute(text("SELECT p.id_persona, p.nombres, p.apellidos FROM vinculacion_docente v JOIN persona p ON v.id_persona = p.id_persona WHERE v.id_anio_escolar = :id"), {"id": id}).fetchall()
    return [{"id_persona": r[0], "nombres": r[1], "apellidos": r[2]} for r in res]

@router.post("/{id}/docentes/{id_per}")
def vincular_docente(id: int, id_per: int, db: Session = Depends(get_db)):
    db.execute(text("INSERT IGNORE INTO vinculacion_docente (id_anio_escolar, id_persona, fecha_vinculacion) VALUES (:id, :per, CURDATE())"), {"id": id, "per": id_per})
    db.commit()
    return {"status": "ok"}

@router.delete("/{id}/docentes/{id_per}")
def desvincular_docente(id: int, id_per: int, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM vinculacion_docente WHERE id_anio_escolar = :id AND id_persona = :per"), {"id": id, "per": id_per})
    db.commit()
    return {"status": "ok"}

@router.get("/grados/todos")
def obtener_grados(db: Session = Depends(get_db)):
    res = db.execute(text("SELECT id_grado, nombre_grado FROM grado")).fetchall()
    return [{"id_grado": r[0], "nombre_grado": r[1]} for r in res]

@router.get("/{id}/grupos")
def listar_grupos(id: int, id_grado: int = None, historial: bool = False, db: Session = Depends(get_db)):
    if historial and id_grado:
        res = db.execute(text("SELECT DISTINCT nombre_grupo FROM grupo WHERE id_grado = :grado ORDER BY nombre_grupo"), {"grado": id_grado}).fetchall()
        return [{"nombre_grupo": r[0]} for r in res]

    # CORRECCIÓN: Agregamos g.id_docente_titular a la consulta SQL
    query = """
        SELECT g.id_grupo, g.id_grado, g.nombre_grupo, gra.nombre_grado, g.id_docente_titular 
        FROM grupo g 
        JOIN grado gra ON g.id_grado = gra.id_grado 
        WHERE g.id_anio_escolar = :id
    """
    params = {"id": id}
    if id_grado:
        query += " AND g.id_grado = :grado"
        params["grado"] = id_grado
        
    res = db.execute(text(query), params).mappings().fetchall()
    return res

@router.post("/{id}/grupos")
def crear_grupo(id: int, id_grado: int, nombre: str, db: Session = Depends(get_db)):
    # 1. Verificar si ya existe ese nombre de grupo EN EL AÑO ACTUAL
    ya_vinculado = db.execute(text("""
        SELECT id_grupo FROM grupo 
        WHERE id_grado = :id_g AND id_anio_escolar = :id_a AND nombre_grupo = :nom
    """), {"id_g": id_grado, "id_a": id, "nom": nombre}).fetchone()

    if ya_vinculado:
        raise HTTPException(status_code=400, detail="El grupo ya está vinculado a este año")

    # 2. SIEMPRE CREAR UNO NUEVO (Sin reutilizar IDs viejos para evitar docentes fantasmas)
    db.execute(text("""
        INSERT INTO grupo (id_grado, id_anio_escolar, nombre_grupo) 
        VALUES (:id_g, :id_a, :nom)
    """), {"id_g": id_grado, "id_a": id, "nom": nombre})
    
    db.commit()
    return {"status": "ok"}

@router.delete("/grupos/{id_g}")
def desvincular_grupo_del_anio(id_g: int, db: Session = Depends(get_db)):
    # 1. BUSCAMOS EL GRUPO Y SU TITULAR
    grupo = db.execute(text("SELECT id_docente_titular FROM grupo WHERE id_grupo = :id"), {"id": id_g}).fetchone()
    
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")

    # 2. BLOQUEO SI TIENE TITULAR
    if grupo[0] is not None:
        raise HTTPException(
            status_code=400, 
            detail="Este grupo tiene un titular vinculado. Elimine el titular y vuelva a intentarlo."
        )

    # 3. ELIMINACIÓN TOTAL (No UPDATE, sino DELETE)
    # Borramos primero las materias (hijos)
    db.execute(text("DELETE FROM grupo_asignatura WHERE id_grupo = :id"), {"id": id_g})
    # Borramos el grupo (padre)
    db.execute(text("DELETE FROM grupo WHERE id_grupo = :id"), {"id": id_g})
    
    db.commit()
    return {"status": "ok"}