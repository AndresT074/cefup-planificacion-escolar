import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Spinner, Form, InputGroup, ListGroup, Button, Badge, Card, Row, Col } from "react-bootstrap";
import {
  listarDocentesVinculados,
  mapDocenteVinculado,
  actualizarAsignacionGrupo,
} from "../services/catalogos.api";

// --- SUB-COMPONENTE PARA BÚSQUEDA INTELIGENTE EN FILAS ---
const BuscadorDocenteFila = ({ docentes, idDocenteActual, alSeleccionar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [mostrar, setMostrar] = useState(false);

  const docenteSeleccionado = docentes.find(d => d.id === idDocenteActual);
  const sugerencias = busqueda.trim() === "" 
    ? [] 
    : docentes.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="position-relative" style={{ minWidth: '220px' }}>
      <InputGroup size="sm">
        <Form.Control
          placeholder={docenteSeleccionado ? docenteSeleccionado.nombre : "Buscar docente..."}
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setMostrar(true);
          }}
          onFocus={() => setMostrar(true)}
          style={{ zIndex: 1 }}
        />
        {idDocenteActual && (
          <Button variant="outline-secondary" size="sm" onClick={() => { alSeleccionar(null); setBusqueda(""); }} style={{ zIndex: 1 }}>✕</Button>
        )}
      </InputGroup>

      {mostrar && busqueda && (
        <ListGroup className="position-absolute shadow-lg mt-1" style={{ top: '100%', left: 0, right: 0, zIndex: 9999, maxHeight: '200px', overflowY: 'auto' }}>
          {sugerencias.map(d => (
            <ListGroup.Item key={d.id} action className="py-2 px-3" style={{ fontSize: '0.9rem' }} onClick={() => { alSeleccionar(d.id); setBusqueda(""); setMostrar(false); }}>
              {d.nombre}
            </ListGroup.Item>
          ))}
          {busqueda && sugerencias.length === 0 && <ListGroup.Item className="small text-muted p-2">No encontrado</ListGroup.Item>}
        </ListGroup>
      )}
      {mostrar && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setMostrar(false)} />}
    </div>
  );
};

const VerGrupo = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const API_URL = "http://localhost:8000/api";

  const [grupo, setGrupo] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]); 
  const [areas, setAreas] = useState([]); 
  const [cargando, setCargando] = useState(true);
  const [editandoDocentes, setEditandoDocentes] = useState(false);
  const [guardandoCambios, setGuardandoCambios] = useState(false);
  const [docentesVinculados, setDocentesVinculados] = useState([]);
  const [asignacionesEditadas, setAsignacionesEditadas] = useState({});

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resGrupo = await axios.get(`${API_URL}/grupo/${id}`);
      setGrupo(resGrupo.data);

      if (resGrupo.data.id_grado <= 103) {
        const resAreas = await axios.get(`${API_URL}/grado/${resGrupo.data.id_grado}/areas`);
        setAreas(resAreas.data);
      } else {
        const resAsig = await axios.get(`${API_URL}/asignacion-grupo/grupo/${id}`);
        setAsignaturas(resAsig.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { if (id) cargarDatos(); }, [id]);

  const activarEdicionDocentes = async () => {
    try {
      const resp = await listarDocentesVinculados(grupo.id_anio_escolar);
      setDocentesVinculados((resp.data || []).map(mapDocenteVinculado));
      const base = {};
      asignaturas.forEach(item => { base[item.id_grupo_asignatura] = item.id_docente; });
      setAsignacionesEditadas(base);
      setEditandoDocentes(true);
    } catch (e) { console.error(e); }
  };

  const guardarAsignacionesDocente = async () => {
    try {
      setGuardandoCambios(true);
      const promesas = Object.entries(asignacionesEditadas).map(([idAsig, idDoc]) =>
        actualizarAsignacionGrupo(idAsig, { id_docente: idDoc ? Number(idDoc) : null })
      );
      await Promise.all(promesas);
      await cargarDatos();
      setEditandoDocentes(false);
    } catch (e) { console.error(e); } finally { setGuardandoCambios(false); }
  };

  if (cargando) return <Spinner animation="border" variant="primary" className="d-block mx-auto mt-5" />;
  if (!grupo) return <Alert variant="danger">Grupo no encontrado</Alert>;

  const esPreescolar = grupo.id_grado <= 103;

  return (
    <div className="container py-4">
      {/* BOTÓN VOLVER */}
      <div className="mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate("/grupos")}>
          ← Volver a Grupos
        </Button>
      </div>

      {/* HEADER DE INFORMACIÓN DEL GRUPO */}
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <h2 className="text-primary fw-bold mb-1">Grupo {grupo.nombre_grupo}</h2>
              <p className="text-muted mb-0">
                <span className="fw-bold text-dark">{grupo.grado?.nombre_grado}</span> | 
                Año Escolar: {grupo.anio_escolar?.fecha_inicio?.substring(0, 4)}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
               <div className="small text-muted fw-bold text-uppercase">Docente Titular</div>
               {grupo.docente_titular ? (
                 <Badge bg="primary" className="fs-6 p-2 shadow-sm">
                   👨‍🏫 {grupo.docente_titular.persona.nombres} {grupo.docente_titular.persona.apellidos}
                 </Badge>
               ) : (
                 <Badge bg="warning" text="dark" className="fs-6">Sin Titular asignado</Badge>
               )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABLA DE ASIGNATURAS / ÁREAS */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold m-0 border-start border-4 border-primary ps-3">
                {esPreescolar ? "Áreas de Desarrollo" : "Asignaturas del Grupo"}
            </h4>
            
            {!esPreescolar && (
                !editandoDocentes ? (
                    <Button variant="primary" className="shadow-sm fw-bold" onClick={activarEdicionDocentes}>
                        Asignar Docentes
                    </Button>
                ) : (
                    <div className="btn-group shadow-sm">
                        <Button variant="success" className="fw-bold" onClick={guardarAsignacionesDocente} disabled={guardandoCambios}>
                            💾 Guardar Cambios
                        </Button>
                        <Button variant="secondary" onClick={() => setEditandoDocentes(false)}>Cancelar</Button>
                    </div>
                )
            )}
          </div>

          <div className="table-responsive" style={{ overflow: 'visible' }}>
            <table className="table table-hover align-middle border">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '45%' }}>Materia / Área</th>
                  <th>Docente Responsable</th>
                </tr>
              </thead>
              <tbody>
                {esPreescolar ? (
                  areas.map(a => (
                    <tr key={a.id_area}>
                      <td className="fw-bold">{a.nombre_area}</td>
                      <td>
                        <span className="text-primary fw-bold">
                            {grupo.docente_titular ? `${grupo.docente_titular.persona.nombres} ${grupo.docente_titular.persona.apellidos}` : "Sin Titular"}
                        </span>
                        <br /><small className="text-muted">(Responsabilidad del Titular)</small>
                      </td>
                    </tr>
                  ))
                ) : (
                  asignaturas.map(item => (
                    <tr key={item.id_grupo_asignatura}>
                      <td className="fw-bold">{item.asignatura?.nombre_asignatura}</td>
                      <td style={{ position: 'relative', overflow: 'visible' }}>
                        {editandoDocentes ? (
                          <BuscadorDocenteFila 
                             docentes={docentesVinculados}
                             idDocenteActual={asignacionesEditadas[item.id_grupo_asignatura]}
                             alSeleccionar={(idDoc) => setAsignacionesEditadas({...asignacionesEditadas, [item.id_grupo_asignatura]: idDoc})}
                          />
                        ) : (
                          <Badge bg="info" text="dark" className="p-2 fs-7 shadow-sm">
                              {item.docente ? `👨‍🏫 ${item.docente.persona.nombres} ${item.docente.persona.apellidos}` : "⚠️ No asignado"}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VerGrupo;