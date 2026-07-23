import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Spinner, Form, InputGroup, Row, Col, Pagination } from "react-bootstrap";

import { listarGrupos, actualizarGrupo } from "../services/grupos.api";
import { listarAnios, listarGrados } from "../services/catalogos.api";

import GrupoForm from "../components/GrupoForm";
import GruposTable from "../components/GruposTable";

function GestionGrupos() {
  const [anios, setAnios] = useState([]);
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [grupoActual, setGrupoActual] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(true);

  // --- NUEVOS ESTADOS: BÚSQUEDA Y PAGINACIÓN ---
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const navigate = useNavigate();

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const cargarCatalogos = async () => {
    try {
      setCargando(true);
      const [resAnios, resGrados] = await Promise.all([listarAnios(), listarGrados()]);
      setAnios(resAnios.data || []);
      setGrados(resGrados.data || []);
    } catch (error) {
      mostrarNotificacion("danger", "Error cargando Años o Grados.");
    } finally {
      setCargando(false);
    }
  };

  const recargarGrupos = async () => {
    if (!anioSeleccionado || !gradoSeleccionado) return;
    try {
      const resp = await listarGrupos(anioSeleccionado, gradoSeleccionado);
      setGrupos(resp.data || []);
      setPaginaActual(1); // Resetear a la página 1 al filtrar
    } catch (error) {
      mostrarNotificacion("danger", "Error al cargar los grupos.");
    }
  };

  useEffect(() => { cargarCatalogos(); }, []);
  useEffect(() => { recargarGrupos(); }, [anioSeleccionado, gradoSeleccionado]);

  // --- LÓGICA DE FILTRADO (Búsqueda por nombre de grupo o nombre de docente) ---
  const gruposFiltrados = grupos.filter((g) => {
    const term = busqueda.toLowerCase();
    const nombreGrupo = g.nombre_grupo.toLowerCase();
    const docente = g.docente_titular?.persona 
        ? `${g.docente_titular.persona.nombres} ${g.docente_titular.persona.apellidos}`.toLowerCase() 
        : "";
    return nombreGrupo.includes(term) || docente.includes(term);
  });

  // --- LÓGICA DE PAGINACIÓN ---
  const totalItems = gruposFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const gruposPaginados = gruposFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) setPaginaActual(numero);
  };

  const handleSubmit = async (data) => {
    try {
      await actualizarGrupo(grupoActual.id_grupo, data);
      setMostrarModal(false);
      mostrarNotificacion("success", "Grupo actualizado con éxito.");
      recargarGrupos();
    } catch (error) {
      mostrarNotificacion("danger", "No se pudo actualizar el grupo.");
    }
  };

  return (
    <div className="container-fluid py-2">
      {notificacion && <Alert variant={notificacion.tipo} dismissible className="shadow mb-4">{notificacion.mensaje}</Alert>}

      <div className="card shadow-sm border-0 mb-4 bg-white p-4">
          <h2 className="text-primary fw-bold mb-4">Gestión Avanzada de Grupos</h2>
          
          <Row className="g-3">
            <Col md={4}>
              <label className="form-label small fw-bold">Año Escolar</label>
              <Form.Select className="shadow-sm" value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)}>
                <option value="">-- Seleccione año --</option>
                {anios.map((a) => <option key={a.id_anio_escolar} value={a.id_anio_escolar}>{a.fecha_inicio.substring(0, 4)} {a.es_anio_actual ? "(Actual)" : ""}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}>
              <label className="form-label small fw-bold">Grado Académico</label>
              <Form.Select className="shadow-sm" value={gradoSeleccionado} onChange={(e) => setGradoSeleccionado(e.target.value)}>
                <option value="">-- Seleccione grado --</option>
                {grados.map((g) => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
              </Form.Select>
            </Col>
            
            {/* BUSCADOR PREDICTIVO */}
            <Col md={4}>
              <label className="form-label small fw-bold">🔍 Buscar por Docente</label>
              <InputGroup>
                <Form.Control 
                  placeholder="Escriba nombre del grupo o profesor..." 
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                />
              </InputGroup>
            </Col>
          </Row>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <div className="text-muted small">
            Mostrando <strong>{gruposPaginados.length}</strong> de <strong>{totalItems}</strong> grupos
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Items por página:</span>
          <Form.Select size="sm" style={{ width: '80px' }} value={itemsPorPagina} onChange={(e) => setItemsPorPagina(Number(e.target.value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </Form.Select>
        </div>
      </div>

      <GruposTable 
        grupos={gruposPaginados} 
        onEditar={(g) => { setGrupoActual(g); setMostrarModal(true); }} 
        onVer={(id_grupo) => navigate(`/grupos/${id_grupo}`)} 
      />

      {/* COMPONENTE DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => cambiarPagina(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} />
            {[...Array(totalPaginas)].map((_, i) => (
              <Pagination.Item key={i + 1} active={i + 1 === paginaActual} onClick={() => cambiarPagina(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} />
            <Pagination.Last onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas} />
          </Pagination>
        </div>
      )}

      {/* MODAL EDITAR */}
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">✏️ Editar Grupo</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <GrupoForm grupoInicial={grupoActual} onSubmit={handleSubmit} onCancel={() => setMostrarModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionGrupos;