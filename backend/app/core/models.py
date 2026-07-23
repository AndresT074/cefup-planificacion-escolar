from sqlalchemy import (
    Column, Integer, String, Date, Text, Boolean, ForeignKey,
    DECIMAL, TIMESTAMP, UniqueConstraint, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

# ============================
# ADMINISTRACIÓN Y PERSONAS 
# ============================

class Persona(Base):
    __tablename__ = "persona"

    id_persona = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_documento_identidad = Column(Enum('CC','TI','CE','PA'), default='CC', nullable=False)
    numero_documento_identidad = Column(String(20), nullable=False, unique=True)
    nombres = Column(String(50), nullable=False)
    apellidos = Column(String(50), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    estado_civil = Column(String(20))
    pais_residencia = Column(String(100))
    departamento_residencia = Column(String(100))
    ciudad_residencia = Column(String(100))
    direccion = Column(Text)
    telefono = Column(String(20))
    email = Column(String(100))
    tipo_sangre = Column(String(3))
    estado = Column(Enum('activo', 'inactivo'), default='activo', nullable=False)

    usuario = relationship("Usuario", back_populates="persona", uselist=False, cascade="all, delete-orphan")
    estudiante = relationship("Estudiante", back_populates="persona", uselist=False, cascade="all, delete-orphan")
    docente = relationship("Docente", back_populates="persona", uselist=False, cascade="all, delete-orphan")


class Usuario(Base):
    __tablename__ = "usuario"
    id_persona = Column(Integer, ForeignKey("persona.id_persona", ondelete="CASCADE"), primary_key=True)
    login = Column(String(50), nullable=False, unique=True)
    password = Column(String(100), nullable=False)
    estado_usuario = Column(String(10), default="Activo")

    persona = relationship("Persona", back_populates="usuario")
    roles = relationship("UsuarioRol", back_populates="usuario")


class Rol(Base):
    __tablename__ = "rol"
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), nullable=False, unique=True)
    descripcion = Column(Text)
    usuarios = relationship("UsuarioRol", back_populates="rol")


class UsuarioRol(Base):
    __tablename__ = "usuario_rol"
    id_persona = Column(Integer, ForeignKey("usuario.id_persona", ondelete="CASCADE"), primary_key=True)
    id_rol = Column(Integer, ForeignKey("rol.id_rol", ondelete="CASCADE"), primary_key=True)
    fecha_asignacion = Column(TIMESTAMP)
    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")


class Modulo(Base):
    __tablename__ = "modulo"
    id_modulo = Column(Integer, primary_key=True, index=True)
    nombre_corto_modulo = Column(String(20), nullable=False, unique=True)
    nombre_modulo = Column(String(100))
    descripcion_modulo = Column(Text)
    funcionalidades = relationship("Funcionalidad", back_populates="modulo")


class Funcionalidad(Base):
    __tablename__ = "funcionalidad"
    id_funcionalidad = Column(Integer, primary_key=True, index=True)
    nombre_corto_funcionalidad = Column(String(20), nullable=False, unique=True)
    nombre_funcionalidad = Column(String(100))
    id_modulo = Column(Integer, ForeignKey("modulo.id_modulo"))
    ruta = Column(String(50))
    modulo = relationship("Modulo", back_populates="funcionalidades")


# ============================
# EXTENSIONES DE PERSONA
# ============================

class Estudiante(Base):
    __tablename__ = "estudiante"
    id_persona = Column(Integer, ForeignKey("persona.id_persona", ondelete="CASCADE"), primary_key=True)
    fecha_ingreso = Column(Date)
    alergias = Column(Text)
    condicion_especial = Column(Text)
    observaciones_medicas = Column(Text)

    persona = relationship("Persona", back_populates="estudiante")
    matriculas = relationship("Matricula", back_populates="estudiante")


class Docente(Base):
    __tablename__ = "docente"
    id_persona = Column(Integer, ForeignKey("persona.id_persona", ondelete="CASCADE"), primary_key=True)
    ultimo_titulo_profesional = Column(String(150))
    actual_cargo = Column(String(100))
    fecha_contratacion = Column(Date)

    persona = relationship("Persona", back_populates="docente")
    grupos_titular = relationship("Grupo", back_populates="docente_titular")
    vinculaciones = relationship("VinculacionDocente", back_populates="docente")
    grupo_asignaturas = relationship("GrupoAsignatura", back_populates="docente")


# ============================
# ESTRUCTURA ACADÉMICA
# ============================

class Nivel(Base):
    __tablename__ = "nivel"
    id_nivel = Column(Integer, primary_key=True)
    nombre_nivel = Column(String(100), nullable=False)
    grados = relationship("Grado", back_populates="nivel")

class Grado(Base):
    __tablename__ = "grado"
    id_grado = Column(Integer, primary_key=True)
    id_nivel = Column(Integer, ForeignKey("nivel.id_nivel"))
    nombre_grado = Column(String(50), nullable=False)
    nivel = relationship("Nivel", back_populates="grados")
    areas = relationship("Area", back_populates="grado")
    grupos = relationship("Grupo", back_populates="grado")

class Area(Base):
    __tablename__ = "area"
    id_area = Column(Integer, primary_key=True, autoincrement=True)
    id_grado = Column(Integer, ForeignKey("grado.id_grado"))
    nombre_area = Column(String(100), nullable=False)
    grado = relationship("Grado", back_populates="areas")
    asignaturas = relationship("Asignatura", back_populates="area")

class Asignatura(Base):
    __tablename__ = "asignatura"
    id_asignatura = Column(Integer, primary_key=True)
    id_area = Column(Integer, ForeignKey("area.id_area"))
    nombre_asignatura = Column(String(100), nullable=False)
    ihs = Column(Integer)
    area = relationship("Area", back_populates="asignaturas")
    notas = relationship("Nota", back_populates="asignatura")
    grupo_asignaturas = relationship("GrupoAsignatura", back_populates="asignatura")


# ============================
# AÑO, PERIODOS, GRUPOS
# ============================

class AnioEscolar(Base):
    __tablename__ = "anio_escolar"
    id_anio_escolar = Column(Integer, primary_key=True, autoincrement=True)
    es_anio_actual = Column(Boolean)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)

    periodos = relationship("Periodo", back_populates="anio_escolar")
    vinculaciones = relationship("VinculacionDocente", back_populates="anio_escolar")
    grupos = relationship("Grupo", back_populates="anio_escolar")
    matriculas = relationship("Matricula", back_populates="anio_escolar")


class Periodo(Base):
    __tablename__ = "periodo"
    id_periodo = Column(Integer, primary_key=True, autoincrement=True)
    id_anio_escolar = Column(Integer, ForeignKey("anio_escolar.id_anio_escolar"))
    orden_periodo = Column(Integer, nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)

    anio_escolar = relationship("AnioEscolar", back_populates="periodos")
    notas = relationship("Nota", back_populates="periodo")


class VinculacionDocente(Base):
    __tablename__ = "vinculacion_docente"
    id_anio_escolar = Column(Integer, ForeignKey("anio_escolar.id_anio_escolar"), primary_key=True)
    id_persona = Column(Integer, ForeignKey("docente.id_persona"), primary_key=True)
    fecha_vinculacion = Column(Date)

    anio_escolar = relationship("AnioEscolar", back_populates="vinculaciones")
    docente = relationship("Docente", back_populates="vinculaciones")


class Grupo(Base):
    __tablename__ = "grupo"
    id_grupo = Column(Integer, primary_key=True, autoincrement=True)
    id_grado = Column(Integer, ForeignKey("grado.id_grado"))
    id_docente_titular = Column(Integer, ForeignKey("docente.id_persona"), nullable=True)
    id_anio_escolar = Column(Integer, ForeignKey("anio_escolar.id_anio_escolar"), nullable=True)
    nombre_grupo = Column(String(5), nullable=False)

    grado = relationship("Grado", back_populates="grupos")
    docente_titular = relationship("Docente", back_populates="grupos_titular")
    anio_escolar = relationship("AnioEscolar", back_populates="grupos")
    matriculas = relationship("Matricula", back_populates="grupo")
    grupo_asignaturas = relationship("GrupoAsignatura", back_populates="grupo")


class GrupoAsignatura(Base):
    __tablename__ = "grupo_asignatura"
    id_grupo_asignatura = Column(Integer, primary_key=True, autoincrement=True)
    id_grupo = Column(Integer, ForeignKey("grupo.id_grupo", ondelete="CASCADE"), nullable=False)
    id_asignatura = Column(Integer, ForeignKey("asignatura.id_asignatura", ondelete="CASCADE"), nullable=False)
    id_docente = Column(Integer, ForeignKey("docente.id_persona", ondelete="SET NULL"))

    __table_args__ = (UniqueConstraint("id_grupo", "id_asignatura"),)

    grupo = relationship("Grupo", back_populates="grupo_asignaturas")
    asignatura = relationship("Asignatura", back_populates="grupo_asignaturas")
    docente = relationship("Docente", back_populates="grupo_asignaturas")


class Matricula(Base):
    __tablename__ = "matricula"
    id_matricula = Column(Integer, primary_key=True, autoincrement=True)
    id_estudiante = Column(Integer, ForeignKey("estudiante.id_persona"))
    id_grupo = Column(Integer, ForeignKey("grupo.id_grupo"))
    id_anio_escolar = Column(Integer, ForeignKey("anio_escolar.id_anio_escolar"))
    fecha_matricula = Column(Date, nullable=False)
    
    estudiante = relationship("Estudiante", back_populates="matriculas")
    grupo = relationship("Grupo", back_populates="matriculas")
    anio_escolar = relationship("AnioEscolar", back_populates="matriculas")
    notas = relationship("Nota", back_populates="matricula")


class Nota(Base):
    __tablename__ = "nota"
    id_nota = Column(Integer, primary_key=True, autoincrement=True)
    id_matricula = Column(Integer, ForeignKey("matricula.id_matricula"))
    id_asignatura = Column(Integer, ForeignKey("asignatura.id_asignatura"))
    id_periodo = Column(Integer, ForeignKey("periodo.id_periodo"))
    valor = Column(DECIMAL(4, 2), nullable=False)

    matricula = relationship("Matricula", back_populates="notas")
    asignatura = relationship("Asignatura", back_populates="notas")
    periodo = relationship("Periodo", back_populates="notas")