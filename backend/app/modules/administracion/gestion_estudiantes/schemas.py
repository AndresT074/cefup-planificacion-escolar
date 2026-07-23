from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from pydantic import BaseModel
from typing import Literal

class EstadoUpdate(BaseModel):
    estado: Literal['activo', 'inactivo']

# Esquema para crear un estudiante (Datos de Persona + Estudiante)
class EstudianteCreate(BaseModel):
    # Campos de la tabla 'persona'
    tipo_documento_identidad: str  # CC, TI, etc.
    numero_documento_identidad: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    email: Optional[EmailStr] = None
    estado: str = "activo"
    
    # Campos de la tabla 'estudiante'
    fecha_ingreso: Optional[date] = None
    alergias: Optional[str] = None
    condicion_especial: Optional[str] = None
    observaciones_medicas: Optional[str] = None
    

# Esquema para la respuesta (Lo que la API devuelve)
# Este esquema servirá para la lista y para el detalle, trayendo TODO
class EstudianteResponse(EstudianteCreate):
    id_persona: int
    # No necesitas volver a escribir nombres, apellidos o alergias
    # porque ya los hereda de EstudianteCreate arriba.

    class Config:
        from_attributes = True

class EstudianteOut(BaseModel):
    id_persona: int
    nombres: str
    apellidos: str
    alergias: Optional[str] = None # Debe ser opcional para evitar errores si está vacío
    observaciones_medicas: Optional[str] = None
    fecha_ingreso: Optional[date] = None

    class Config:
        from_attributes = True
