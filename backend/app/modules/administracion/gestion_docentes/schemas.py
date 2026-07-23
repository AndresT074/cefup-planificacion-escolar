from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional, Literal

from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional

class DocenteCreate(BaseModel):
    tipo_documento_identidad: str
    numero_documento_identidad: str
    nombres: str
    apellidos: str
    fecha_nacimiento: Optional[date] = None # Permite null
    email: Optional[str] = None
    ultimo_titulo_profesional: Optional[str] = None
    actual_cargo: Optional[str] = "Docente"
    fecha_contratacion: Optional[date] = None

    # Este validador es el puente final de unificación
    @field_validator('fecha_nacimiento', 'fecha_contratacion', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class DocenteResponse(DocenteCreate):
    id_persona: int
    estado: str 

    class Config:
        from_attributes = True
    
class EstadoDocenteUpdate(BaseModel):
    estado: Literal['activo', 'inactivo']
