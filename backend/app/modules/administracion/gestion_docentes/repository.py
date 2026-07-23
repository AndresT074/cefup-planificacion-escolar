from sqlalchemy.orm import Session
from app.core.models import Persona, Docente
from . import schemas

class DocenteRepository:
    def create_docente(self, db: Session, docente_data: schemas.DocenteCreate):
        # 1. Crear el registro en la tabla base Persona
        nueva_persona = Persona(
            tipo_documento_identidad=docente_data.tipo_documento_identidad,
            numero_documento_identidad=docente_data.numero_documento_identidad,
            nombres=docente_data.nombres,
            apellidos=docente_data.apellidos,
            fecha_nacimiento=docente_data.fecha_nacimiento,
            email=docente_data.email,
            estado="activo"
        )
        db.add(nueva_persona)
        db.flush() 

        # 2. Crear el registro en la tabla extendida Docente
        nuevo_docente = Docente(
            id_persona=nueva_persona.id_persona,
            ultimo_titulo_profesional=docente_data.ultimo_titulo_profesional,
            actual_cargo=docente_data.actual_cargo,
            fecha_contratacion=docente_data.fecha_contratacion
        )
        db.add(nuevo_docente)
        db.commit()
        db.refresh(nueva_persona)
        return nueva_persona

    def get_docentes(self, db: Session):
        # Unimos las tablas y mapeamos manualmente para evitar valores 'null' en el Frontend
        resultados = db.query(Persona, Docente).join(Docente).all()
        
        lista_plana = []
        for persona, docente in resultados:
            data = {
                "id_persona": persona.id_persona,
                "tipo_documento_identidad": persona.tipo_documento_identidad,
                "numero_documento_identidad": persona.numero_documento_identidad,
                "nombres": persona.nombres,
                "apellidos": persona.apellidos,
                "fecha_nacimiento": persona.fecha_nacimiento,
                "email": persona.email,
                "estado": persona.estado,
                # Campos de la tabla Docente
                "ultimo_titulo_profesional": docente.ultimo_titulo_profesional,
                "actual_cargo": docente.actual_cargo,
                "fecha_contratacion": docente.fecha_contratacion
            }
            lista_plana.append(data)
    
        return lista_plana

    def update_estado(self, db: Session, id_persona: int, estado: str):
        persona = db.query(Persona).filter(Persona.id_persona == id_persona).first()
        if persona:
            persona.estado = estado
            db.commit()
            db.refresh(persona)
        return persona


    def update_docente(self, db: Session, id_persona: int, docente_data: schemas.DocenteCreate):
        db_persona = db.query(Persona).filter(Persona.id_persona == id_persona).first()
        if not db_persona: return None
        
        # Sincronizamos tabla Persona
        db_persona.nombres = docente_data.nombres
        db_persona.apellidos = docente_data.apellidos
        db_persona.email = docente_data.email
        db_persona.fecha_nacimiento = docente_data.fecha_nacimiento

        # Sincronizamos tabla Docente
        db_docente = db.query(Docente).filter(Docente.id_persona == id_persona).first()
        if db_docente:
            db_docente.ultimo_titulo_profesional = docente_data.ultimo_titulo_profesional
            db_docente.actual_cargo = docente_data.actual_cargo
            db_docente.fecha_contratacion = docente_data.fecha_contratacion
        
        db.commit()
        db.refresh(db_persona)
        return db_persona
        