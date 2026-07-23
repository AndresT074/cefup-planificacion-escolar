from sqlalchemy.orm import Session
from app.core.models import Persona, Estudiante
from . import schemas

class EstudianteRepository:
    def create_estudiante(self, db: Session, estudiante_data: schemas.EstudianteCreate):
        # 1. Crear el registro en la tabla Persona
        nueva_persona = Persona(
            tipo_documento_identidad=estudiante_data.tipo_documento_identidad,
            numero_documento_identidad=estudiante_data.numero_documento_identidad,
            nombres=estudiante_data.nombres,
            apellidos=estudiante_data.apellidos,
            fecha_nacimiento=estudiante_data.fecha_nacimiento,
            email=estudiante_data.email, # <--- ¡LA COMA QUE FALTABA ESTÁ AQUÍ!
            estado="activo"
        )
        db.add(nueva_persona)
        db.flush() 

        # 2. Crear el registro en la tabla Estudiante
        nuevo_estudiante = Estudiante(
            id_persona=nueva_persona.id_persona,
            fecha_ingreso=estudiante_data.fecha_ingreso,
            alergias=estudiante_data.alergias,
            condicion_especial=estudiante_data.condicion_especial,
            observaciones_medicas=estudiante_data.observaciones_medicas
        )
        db.add(nuevo_estudiante)
        db.commit()
        db.refresh(nueva_persona)
        return nueva_persona

    def get_estudiantes(self, db: Session):
        # Esta consulta une Persona con Estudiante y extrae TODOS los campos
        resultados = db.query(Persona, Estudiante).join(Estudiante).all()
        
        lista_plana = []
        for persona, estudiante in resultados:
            # Creamos un solo diccionario con la unión de ambos datos
            data = {
                "id_persona": persona.id_persona,
                "nombres": persona.nombres,
                "apellidos": persona.apellidos,
                "numero_documento_identidad": persona.numero_documento_identidad,
                "tipo_documento_identidad": persona.tipo_documento_identidad,
                "fecha_nacimiento": persona.fecha_nacimiento,
                "email": persona.email,
                "estado": persona.estado,
                # DATOS CRUCIALES DE ESTUDIANTE
                "alergias": estudiante.alergias,
                "fecha_ingreso": estudiante.fecha_ingreso,
                "observaciones_medicas": estudiante.observaciones_medicas
            }
            lista_plana.append(data)
    
        return lista_plana

    def cambiar_estado_persona(self, db: Session, id_persona: int, nuevo_estado: str):
        persona = db.query(Persona).filter(Persona.id_persona == id_persona).first()
        if persona:
            persona.estado = nuevo_estado
            db.commit()
        return persona

    def update_estudiante(self, db: Session, id_persona: int, estudiante_data: schemas.EstudianteCreate):
        # 1. Buscar el registro base
        db_persona = db.query(Persona).filter(Persona.id_persona == id_persona).first()
        if not db_persona:
            return None
        
        # 2. Actualizar datos de Persona
        db_persona.nombres = estudiante_data.nombres
        db_persona.apellidos = estudiante_data.apellidos
        db_persona.fecha_nacimiento = estudiante_data.fecha_nacimiento
        db_persona.email = estudiante_data.email
        
        # 3. Actualizar datos específicos de Estudiante
        db_estudiante = db.query(Estudiante).filter(Estudiante.id_persona == id_persona).first()
        if db_estudiante:
            db_estudiante.alergias = estudiante_data.alergias
            db_estudiante.condicion_especial = estudiante_data.condicion_especial
            db_estudiante.observaciones_medicas = estudiante_data.observaciones_medicas
        
        db.commit()
        db.refresh(db_persona)
        return db_persona

