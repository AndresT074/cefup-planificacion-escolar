from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

# Importamos los routers
from app.modules.administracion.anio_escolar.router import router as anio_router
from app.modules.administracion.gestion_docentes.router import router as docentes_router
from app.modules.administracion.gestion_estudiantes.router import router as estudiantes_router
from app.modules.administracion.gestion_grupos.router import router as grupos_router

app = FastAPI(title="CEFUP System")

# Crea tablas si no existen
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# UNIFICADO: Todos usan /api. Las rutas de Jhoan ahora son /api/anio-escolar, /api/grupo, etc.
app.include_router(anio_router, prefix="/api")
app.include_router(docentes_router, prefix="/api")
app.include_router(estudiantes_router, prefix="/api")
app.include_router(grupos_router, prefix="/api") 

@app.get("/")
def home():
    return {"mensaje": "Backend Funcionando"}