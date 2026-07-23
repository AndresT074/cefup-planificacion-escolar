import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Pagination, ListGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TabDocentes = ({ docentesDisponibles = [], docentesVinculados = [], onVincular, onDesvincular }) => {
  const navigate = useNavigate();

  // --- ESTADOS PARA BÚSQUEDA ---
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // --- ESTADOS PARA PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // --- 1. LÓGICA DE FILTRADO PARA EL BUSCADOR ---
  // Obtenemos los docentes que NO están vinculados y coinciden con lo escrito
  const docentesLibres = docentesDisponibles.filter(
    docente => !docentesVinculados.some(v => v.id_persona === docente.id_persona)
  );

  const sugerencias = busqueda.trim() === "" 
    ? [] 
    : docentesLibres.filter(d => 
        `${d.nombres} ${d.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
      );

  // --- 2. LÓGICA DE PAGINACIÓN DE LA TABLA ---
  const totalItems = docentesVinculados.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const docentesEnPagina = docentesVinculados.slice(indicePrimerItem, indiceUltimoItem);

  // Función para cambiar página de forma segura
  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  return (
    <div>
      {/* SECCIÓN DE BÚSQUEDA INTELIGENTE */}
      <div className="mb-4 position-relative">
        <Form.Label className="fw-bold text-muted small">🔍 BUSCAR DOCENTE PARA VINCULAR:</Form.Label>
        <InputGroup>
          <Form.Control
            placeholder="Escriba el nombre o apellido (ej: Ju...)"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarSugerencias(true);
            }}
            onFocus={() => setMostrarSugerencias(true)}
          />
          <Button variant="primary" onClick={() => navigate('/docentes')}>
            + Registrar Nuevo
          </Button>
        </InputGroup>

        {/* LISTA DE SUGERENCIAS FLOTANTE */}
        {mostrarSugerencias && (busqueda || sugerencias.length > 0) && (
          <ListGroup 
            className="position-absolute w-100 shadow-lg" 
            style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
          >
            {sugerencias.map(d => (
              <ListGroup.Item 
                key={d.id_persona} 
                action 
                onClick={() => {
                  onVincular(d.id_persona);
                  setBusqueda("");
                  setMostrarSugerencias(false);
                }}
              >
                ✅ {d.nombres} {d.apellidos}
              </ListGroup.Item>
            ))}
            {busqueda && sugerencias.length === 0 && (
              <ListGroup.Item className="text-muted">No se encontraron docentes libres con ese nombre.</ListGroup.Item>
            )}
          </ListGroup>
        )}
        {/* Overlay para cerrar sugerencias al hacer clic fuera */}
        {mostrarSugerencias && <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }} 
          onClick={() => setMostrarSugerencias(false)} 
        />}
      </div>

      {/* CABECERA DE LA TABLA Y SELECTOR DE CANTIDAD */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold text-primary m-0">DOCENTES VINCULADOS A ESTE AÑO</h6>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Mostrar:</span>
          <Form.Select 
            size="sm" 
            style={{ width: '80px' }} 
            value={itemsPorPagina}
            onChange={(e) => {
              setItemsPorPagina(Number(e.target.value));
              setPaginaActual(1); // Volver a la 1 al cambiar el tamaño
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Form.Select>
        </div>
      </div>

      {/* TABLA PAGINADA */}
      <Table striped bordered hover className="bg-white shadow-sm align-middle">
        <thead className="table-dark">
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th>Nombre del Docente</th>
            <th className="text-center" style={{ width: '150px' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {docentesEnPagina.map((d, index) => (
            <tr key={d.id_persona}>
              <td className="text-muted small">{indicePrimerItem + index + 1}</td>
              <td>{d.nombres} {d.apellidos}</td>
              <td className="text-center">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => onDesvincular(d.id_persona)}
                >
                  Quitar
                </Button>
              </td>
            </tr>
          ))}
          
          {docentesVinculados.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted py-4">No hay docentes vinculados.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* CONTROLES DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination size="sm">
            <Pagination.First onClick={() => cambiarPagina(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(totalPaginas)].map((_, i) => (
              <Pagination.Item 
                key={i + 1} 
                active={i + 1 === paginaActual}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} />
            <Pagination.Last onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas} />
          </Pagination>
        </div>
      )}

      <div className="text-end text-muted small mt-1">
        Mostrando {docentesEnPagina.length} de {totalItems} registros
      </div>
    </div>
  );
};

export default TabDocentes;