from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class PeriodoBase(BaseModel):
    orden_periodo: int
    fecha_inicio: date
    fecha_fin: date

class PeriodoResponse(PeriodoBase):
    id_periodo: int
    class Config:
        orm_mode = True

class AnioCreate(BaseModel):
    fecha_inicio: date
    fecha_fin: date
    num_periodos: int = 4  # Por defecto 4

class AnioResponse(BaseModel):
    id_anio_escolar: int
    fecha_inicio: date
    fecha_fin: date
    es_anio_actual: bool
    periodos: List[PeriodoResponse] = []

    class Config:
        orm_mode = True

class GrupoAnioResponse(BaseModel):
    id_grupo: int
    id_grado: int
    nombre_grado: str # Para que la tabla diga "Primero" en vez de "201"
    nombre_grupo: str
    id_docente_titular: Optional[int] = None # <--- ¡IMPORTANTE!

    class Config:
        from_attributes = True # En V2 (o orm_mode = True en V1)