import React, { useEffect, useState } from 'react';
import { Alert, Button, Nav } from 'react-bootstrap';
import AnioForm from '../components/AnioForm';
import AnioTable from '../components/AnioTable';
import TabPeriodos from '../components/TabPeriodos';
import TabDocentes from '../components/TabDocentes';
import TabGrupos from '../components/TabGrupos';
import * as api from '../services/anio.api';

const GestionAnioPage = () => {
  const [view, setView] = useState('list');
  const [mensaje, setMensaje] = useState(null);
  const [anios, setAnios] = useState([]);
  const [selectedAnio, setSelectedAnio] = useState(null);
  const [tab, setTab] = useState('periodos');
  const [datosTab, setDatosTab] = useState({ periodos: [], docentesV: [], docentesT: [], grupos: [], grados: [] });

  useEffect(() => { cargarAnios(); }, []);
  useEffect(() => { if (view === 'config' && selectedAnio) cargarDatosTab(selectedAnio.id_anio_escolar, tab); }, [tab, view]);

  const cargarAnios = async () => {
    const res = await api.getAnios();
    setAnios(res.data);
  };

  const cargarDatosTab = async (idAnio, tipoTab) => {
    try {
      if (tipoTab === 'periodos') {
        const res = await api.getPeriodos(idAnio);
        setDatosTab(prev => ({ ...prev, periodos: res.data }));
      } else if (tipoTab === 'docentes') {
        const resV = await api.getDocentesVinculados(idAnio);
        const resT = await api.getAllDocentes();
        setDatosTab(prev => ({ ...prev, docentesV: resV.data, docentesT: resT.data }));
      } else if (tipoTab === 'grupos') {
        const resG = await api.getGrupos(idAnio);
        const resGr = await api.getGrados();
        setDatosTab(prev => ({ ...prev, grupos: resG.data, grados: resGr.data }));
      }
    } catch (e) { setMensaje({ t: 'danger', m: 'Error cargando datos' }); }
  };

  return (
    <div>
      {mensaje && <Alert variant={mensaje.t} dismissible onClose={() => setMensaje(null)}>{mensaje.m}</Alert>}
      {view === 'list' ? (
        <>
          <AnioForm onSubmit={async (d) => { await api.createAnio(d); cargarAnios(); setMensaje({t:'success',m:'Año creado'}); }} />
          <AnioTable anios={anios} onActivate={async (id) => { await api.activateAnio(id); cargarAnios(); }} onConfig={(a) => { setSelectedAnio(a); setView('config'); }} />
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>⚙️ Configuración Año {selectedAnio.fecha_inicio.split('-')[0]}</h3>
            <Button variant="outline-secondary" size="sm" onClick={() => { setView('list'); setMensaje(null); }}>⬅ Volver</Button>
          </div>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item><Nav.Link active={tab === 'periodos'} onClick={() => setTab('periodos')}>1. Periodos</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link active={tab === 'docentes'} onClick={() => setTab('docentes')}>2. Docentes</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link active={tab === 'grupos'} onClick={() => setTab('grupos')}>3. Grupos</Nav.Link></Nav.Item>
          </Nav>
          {tab === 'periodos' && <TabPeriodos periodos={datosTab.periodos} onGuardarPeriodo={async (id, i, f) => { await api.updatePeriodo(id, {fecha_inicio:i, fecha_fin:f}); setMensaje({t:'success',m:'Periodo guardado'}); }} onModificarCantidad={async (a) => { a === 'add' ? await api.addPeriodo(selectedAnio.id_anio_escolar) : await api.removeLastPeriodo(selectedAnio.id_anio_escolar); cargarDatosTab(selectedAnio.id_anio_escolar, 'periodos'); }} />}
          {tab === 'docentes' && <TabDocentes docentesDisponibles={datosTab.docentesT} docentesVinculados={datosTab.docentesV} onVincular={async (id) => { await api.vincularDocente(selectedAnio.id_anio_escolar, id); cargarDatosTab(selectedAnio.id_anio_escolar, 'docentes'); }} onDesvincular={async (id) => { await api.desvincularDocente(selectedAnio.id_anio_escolar, id); cargarDatosTab(selectedAnio.id_anio_escolar, 'docentes'); }} />}
          {tab === 'grupos' && <TabGrupos anioId={selectedAnio.id_anio_escolar} grados={datosTab.grados} gruposActuales={datosTab.grupos} onCrearGrupo={async (g, n) => { await api.createGrupo(selectedAnio.id_anio_escolar, g, n); cargarDatosTab(selectedAnio.id_anio_escolar, 'grupos'); setMensaje({t:'success',m:'Grupo vinculado'}); }} onEliminarGrupo={async (id) => { await api.deleteGrupo(id); cargarDatosTab(selectedAnio.id_anio_escolar, 'grupos'); }} />}
        </>
      )}
    </div>
  );
};

export default GestionAnioPage;