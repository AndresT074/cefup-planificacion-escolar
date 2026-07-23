import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './core/components/MainLayout';

// Importación de tus módulos
import GestionAnioPage from './modules/administracion/anio-escolar/pages/GestionAnioPage';
import GestionDocentesPage from './modules/administracion/gestion-docentes/pages/GestionDocentesPage';

// IMPORTACIÓN DEL NUEVO MÓDULO DE GRUPOS (El de tu compañero)
import GestionGrupos from './modules/administracion/gestion_grupos/pages/GestionGrupos';
import VerGrupo from './modules/administracion/gestion_grupos/pages/verGrupo';

// Placeholders para las que faltan
const Dashboard = () => (
  <div className="text-center p-5">
    <h1 className="text-primary fw-bold">Bienvenido a CEFUP</h1>
    <p className="text-muted">Selecciona una opción del menú lateral para comenzar.</p>
  </div>
);
const EstudiantesPlaceholder = () => <div className="p-4"><h3>🎓 Gestión de Estudiantes</h3><p>Módulo de Yimi en desarrollo...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          {/* Tus rutas */}
          <Route path="/añoEscolar" element={<GestionAnioPage />} />
          <Route path="/docentes" element={<GestionDocentesPage />} />
          
          {/* RUTAS CONECTADAS AL MÓDULO DE TU COMPAÑERO */}
          <Route path="/grupos" element={<GestionGrupos />} />
          {/* Asumo que su pantalla de 'verGrupo' necesita un ID en la URL, ajusta la ruta si es diferente */}
          <Route path="/grupos/:id" element={<VerGrupo />} /> 

          {/* Rutas pendientes */}
          <Route path="/estudiantes" element={<EstudiantesPlaceholder />} />
          <Route path="/boletines" element={<div className="p-4">📊 Módulo de Boletines</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;