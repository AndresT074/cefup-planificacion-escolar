import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Spinner, ListGroup, InputGroup } from "react-bootstrap";
import { listarDocentesVinculados, mapDocenteVinculado } from "../services/catalogos.api";

export default function GrupoForm({ grupoInicial, onSubmit, onCancel }) {
  const [nombre, setNombre] = useState(grupoInicial?.nombre_grupo || "");
  const [idDocente, setIdDocente] = useState(grupoInicial?.id_docente_titular || "");
  const [docentes, setDocentes] = useState([]);
  const [cargandoDocentes, setCargandoDocentes] = useState(false);

  // --- ESTADOS PARA BÚSQUEDA INTELIGENTE ---
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [docenteSeleccionadoNombre, setDocenteSeleccionadoNombre] = useState("");

  const anioId = grupoInicial?.id_anio_escolar || grupoInicial?.anio_escolar?.id_anio_escolar;

  useEffect(() => {
    if (anioId) {
      setCargandoDocentes(true);
      listarDocentesVinculados(anioId)
        .then(res => {
          const data = res.data || res;
          const lista = (data || []).map(mapDocenteVinculado);
          setDocentes(lista);

          // Si ya hay un docente asignado al inicio, buscamos su nombre para mostrarlo
          const actual = lista.find(d => d.id === grupoInicial?.id_docente_titular);
          if (actual) setDocenteSeleccionadoNombre(actual.nombre);
        })
        .catch(err => console.error("Error cargando docentes:", err))
        .finally(() => setCargandoDocentes(false));
    }
  }, [anioId, grupoInicial]);

  // --- LÓGICA DE FILTRADO ---
  const sugerencias = busqueda.trim() === "" 
    ? [] 
    : docentes.filter(d => 
        d.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );

  const manejarSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre_grupo: nombre,
      id_docente_titular: idDocente === "" ? null : Number(idDocente),
      id_anio_escolar: anioId,
      id_grado: grupoInicial?.id_grado || grupoInicial?.grado?.id_grado
    });
  };

  return (
    <Form onSubmit={manejarSubmit}>
      <div className="card p-3 bg-light mb-4 border-0 shadow-sm">
        <Row>
          <Col md={6}>
            <Form.Label className="small fw-bold text-muted text-uppercase">Año Escolar</Form.Label>
            <Form.Control 
                disabled 
                className="bg-white border-0 fw-bold"
                value={grupoInicial?.anio_escolar?.fecha_inicio?.substring(0,4) || ""} 
            />
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-bold text-muted text-uppercase">Grado Académico</Form.Label>
            <Form.Control 
                disabled 
                className="bg-white border-0 fw-bold"
                value={grupoInicial?.grado?.nombre_grado || ""} 
            />
          </Col>
        </Row>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Nombre del Grupo</Form.Label>
        <Form.Control 
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
            required 
            placeholder="Ej: A, B, 101"
            className="form-control-lg"
        />
      </Form.Group>

      {/* SECCIÓN DE BÚSQUEDA INTELIGENTE DE DOCENTE */}
      <Form.Group className="mb-3 position-relative">
        <Form.Label className="fw-bold text-primary">
            👨‍🏫 Docente Titular {cargandoDocentes && <Spinner animation="border" size="sm" className="ms-2" />}
        </Form.Label>
        
        <InputGroup>
          <Form.Control 
            placeholder="Escriba el nombre del docente..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarSugerencias(true);
            }}
            onFocus={() => setMostrarSugerencias(true)}
          />
          {idDocente && (
            <Button variant="outline-danger" onClick={() => {
                setIdDocente("");
                setDocenteSeleccionadoNombre("");
                setBusqueda("");
            }}>
              Quitar
            </Button>
          )}
        </InputGroup>

        {/* Indicador de docente seleccionado actualmente */}
        {docenteSeleccionadoNombre && !busqueda && (
            <div className="mt-2">
                <span className="badge bg-info text-dark p-2">
                    Seleccionado: <strong>{docenteSeleccionadoNombre}</strong>
                </span>
            </div>
        )}

        {/* LISTA DE SUGERENCIAS FLOTANTE */}
        {mostrarSugerencias && busqueda && (
          <ListGroup 
            className="position-absolute w-100 shadow-lg mt-1" 
            style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
          >
            {sugerencias.map(d => (
              <ListGroup.Item 
                key={d.id} 
                action 
                className="d-flex justify-content-between align-items-center"
                onClick={() => {
                  setIdDocente(d.id);
                  setDocenteSeleccionadoNombre(d.nombre);
                  setBusqueda("");
                  setMostrarSugerencias(false);
                }}
              >
                <span>{d.nombre}</span>
                <small className="text-muted">Seleccionar ↑</small>
              </ListGroup.Item>
            ))}
            {sugerencias.length === 0 && (
              <ListGroup.Item className="text-muted">No se encontraron docentes.</ListGroup.Item>
            )}
          </ListGroup>
        )}

        {/* Overlay para cerrar sugerencias */}
        {mostrarSugerencias && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }} 
            onClick={() => setMostrarSugerencias(false)} 
          />
        )}
        
        <Form.Text className="text-muted small d-block mt-1">
            Solo docentes vinculados al año {grupoInicial?.anio_escolar?.fecha_inicio?.substring(0,4)}.
        </Form.Text>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top">
        <Button variant="outline-secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="success" type="submit" className="px-4 fw-bold shadow-sm">
            💾 Guardar Cambios
        </Button>
      </div>
    </Form>
  );
}