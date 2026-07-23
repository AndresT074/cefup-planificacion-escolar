import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import './../../App.css';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [openAdmin, setOpenAdmin] = useState(true); // Controla si se despliega Administración

  // Función para saber si un link está activo
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout-wrapper">
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside className="sidebar shadow">
        <div className="sidebar-brand">CEFUP</div>
        
        <nav className="sidebar-menu">
          <Link to="/" className={`menu-item ${isActive('/')}`}>
             🏠 INICIO
          </Link>

          {/* GRUPO ADMINISTRACIÓN */}
          <div 
            className="menu-item justify-content-between" 
            onClick={() => setOpenAdmin(!openAdmin)}
          >
            <span>📁 ADMINISTRACIÓN</span>
            <span>{openAdmin ? '▾' : '▸'}</span>
          </div>

          <Collapse in={openAdmin}>
            <div className="submenu">
              <Link to="/añoEscolar" className={`menu-item ${isActive('/añoEscolar')}`}>
                📅 Planificación Año
              </Link>
              <Link to="/docentes" className={`menu-item ${isActive('/docentes')}`}>
                👨‍🏫 Gestión Docentes
              </Link>
              <Link to="/estudiantes" className={`menu-item ${isActive('/estudiantes')}`}>
                🎓 Gestión Estudiantes
              </Link>
              <Link to="/grupos" className={`menu-item ${isActive('/grupos')}`}>
                👥 Gestión Grupos
              </Link>
            </div>
          </Collapse>

          <Link to="/boletines" className={`menu-item ${isActive('/boletines')}`}>
             📊 BOLETINES
          </Link>
        </nav>

        <div className="p-3">
            <button className="btn btn-outline-light w-100 btn-sm">🚪 CERRAR SESIÓN</button>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="main-area">
        <header className="top-header">
          <div className="header-title">ADMINISTRACIÓN - GESTIÓN ACADÉMICA</div>
          
          <div className="user-profile">
            <div className="text-end">
              <div className="fw-bold small">Claudia Alves</div>
              <div className="text-muted" style={{fontSize: '0.7rem'}}>Administrator</div>
            </div>
            <img src="https://via.placeholder.com/150" alt="user" className="user-avatar border" />
          </div>
        </header>

        <div className="content-body">
          <div className="bg-white p-4 rounded shadow-sm border" style={{minHeight: '80vh'}}>
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

export default MainLayout;