from pydantic import BaseModel
from datetime import date
from typing import Optional

# ============================================================
#  AÑO ESCOLAR
# ============================================================

class AnioEscolarBase(BaseModel):
    es_anio_actual: bool
    fecha_inicio: date
    fecha_fin: date

class AnioEscolar(AnioEscolarBase):
    id_anio_escolar: int

    class Config:
        from_attributes = True




# ============================================================
#  PERSONA
# ============================================================

class PersonaBase(BaseModel):
    id_persona: int
    tipo_documento_identidad: str
    numero_documento_identidad: str
    nombres: str
    apellidos: str

    class Config:
        from_attributes = True
# ============================================================
#  DOCENTE
# ============================================================
class Docente(BaseModel):
    id_persona: int
    ultimo_titulo_profesional: Optional[str]
    actual_cargo: Optional[str]
    fecha_contratacion: Optional[date]

    persona: PersonaBase

    class Config:
        from_attributes = True


# ============================================================
#  DOCENTE VINCULADO
# ============================================================

class DocenteVinculadoBase(BaseModel):
    id_anio_escolar: int
    id_persona: int
    fecha_vinculacion: Optional[date]
    
class DocenteVinculadoCreate(DocenteVinculadoBase):
    pass

class DocenteVinculadoUpdate(DocenteVinculadoBase):
    pass


class DocenteVinculado(DocenteVinculadoBase):
    docente: Optional[Docente] = None 

    class Config:
        from_attributes = True
# ============================================================
#  GRADO
# ============================================================

class GradoBase(BaseModel):
    nombre_grado: str
    id_nivel: Optional[int] = None
    descripcion_grado: Optional[str] = None

class Grado(GradoBase):
    id_grado: int

    class Config:
        from_attributes = True


# ============================================================
#  ASIGNATURA  
# ============================================================

class AsignaturaBase(BaseModel):
    nombre_asignatura: str
    descripcion_asignatura: str | None = None
    ihs: int | None = None
    id_area: int | None = None

class Asignatura(AsignaturaBase):
    id_asignatura: int

    class Config:
        from_attributes = True


# ============================================================
#  GRUPO ASIGNATURA  (AsignaturaXGrupo)
# ============================================================

class AsignaturaXGrupoBase(BaseModel):
    id_grupo: int
    id_asignatura: int
    id_docente: Optional[int] = None

class AsignaturaXGrupoCreate(AsignaturaXGrupoBase):
    pass

class AsignaturaXGrupoUpdate(BaseModel):
    id_grupo: Optional[int] = None
    id_asignatura: Optional[int] = None
    id_docente: Optional[int] = None

class AsignaturaXGrupo(AsignaturaXGrupoBase):
    id_grupo_asignatura: int
    asignatura: Optional[Asignatura]
    docente: Optional[Docente]
    class Config:
        from_attributes = True


# ============================================================
#  GRUPO
# ============================================================

class GrupoBase(BaseModel):
    nombre_grupo: str
    id_anio_escolar: int
    id_grado: int
    id_docente_titular: Optional[int] = None

class GrupoCreate(GrupoBase):
    pass

class GrupoUpdate(BaseModel):
    nombre_grupo: Optional[str] = None
    id_anio_escolar: Optional[int] = None
    id_grado: Optional[int] = None
    id_docente_titular: Optional[int] = None

class Grupo(GrupoBase):
    id_grupo: int
    grado: Optional[Grado]
    docente_titular: Optional[Docente]
    anio_escolar: Optional[AnioEscolar]

    class Config:
        from_attributes = True
