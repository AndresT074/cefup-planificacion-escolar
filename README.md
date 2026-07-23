# 🏫 CEFUP - Módulo de Planificación de Año Escolar

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-XAMPP-4479A1?logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)

Plataforma web Full Stack desarrollada para la gestión académica del colegio **CEFUP (CAIMIUP)** de la **Universidad de Pamplona**. Este sistema permite la automatización, parametrización y estructuración preventiva del calendario académico escolar, periodos de evaluación, vinculación docente y distribución de grupos antes del proceso de matrícula.

---

## 🎯 Objetivo del Proyecto

Optimizar los procesos administrativos y académicos institucionales mediante un módulo centralizado que permite:
- Controlar de forma estricta la **unicidad del Año Escolar Activo**.
- Parametrizar dinámicamente el número y fechas (inicio y cierre) de los **períodos de evaluación**.
- Pre-vincular al **cuerpo docente** al año académico programado.
- Definir y distribuir preventivamente la oferta de **grupos por grado** para futuros procesos de matrícula.

---

## 🚀 Características Principales

- 📅 **Gestión de Años Escolares:** Creación y activación de años lectivos con validación de estado único (Año Activo vs. Inactivo).
- ⏱️ **Configuración Dinámica de Periodos:** Asignación personalizada de fechas de apertura y cierre por cada período académico.
- 👨‍🏫 **Asignación Docente:** Vinculación de profesores a la planificación del año correspondiente.
- 👥 **Estructuración de Grupos:** Definición de grupos (A, B, C...) por cada grado escolar.
- 🔒 **Seguridad y Control de Acceso:** Arquitectura con autenticación segura mediante tokens **JWT** y encriptación de contraseñas con **Passlib/Bcrypt**.
- 💻 **Interfaz SPA Interactiva:** Panel de administración dinámico y responsivo construido en React con renderizado en tiempo real.

---

## 🛠️ Stack Tecnológico

### **Backend**
- **Lenguaje:** Python 3.10+
- **Framework Web:** FastAPI (asíncrono con Uvicorn)
- **ORM / Base de Datos:** SQLAlchemy + PyMySQL
- **Validación de Datos:** Pydantic v2
- **Seguridad:** Python-JOSE (JWT) + Passlib (Bcrypt)

### **Frontend**
- **Librería UI:** React 18 (JavaScript + SWC)
- **Tooling / Bundler:** Vite
- **Estilos:** Bootstrap 5 & React-Bootstrap
- **HTTP Client:** Axios
- **Enrutamiento:** React Router DOM v6

### **Base de Datos**
- **Motor:** MySQL (Gestión vía XAMPP / MariaDB)

---

## 📁 Estructura del Proyecto

```text
planificacion_anio/
├── backend/
│   ├── app/
│   │   ├── core/                  # Configuración global, BD, dependencias y seguridad
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── security.py
│   │   ├── modules/
│   │   │   └── administracion/
│   │   │       ├── anio_escolar/   # Módulo principal de Planificación de Año
│   │   │       ├── gestion_docentes/
│   │   │       ├── gestion_estudiantes/
│   │   │       └── gestion_grupos/
│   │   └── main.py                # Punto de entrada FastAPI
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── core/                  # Layouts globales y componentes compartidos
│   │   └── modules/
│   │       └── administracion/    # Vistas y servicios de la interfaz
│   ├── package.json
│   └── vite.config.js
└── DB/                            # Scripts SQL para creación e inserción
