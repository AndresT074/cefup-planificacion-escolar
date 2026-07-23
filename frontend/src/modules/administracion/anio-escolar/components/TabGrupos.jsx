import React, { useState } from 'react';
import { Form, Table, Button, Row, Col, Pagination, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TabGrupos = ({ anioId, grados = [], onCrearGrupo, onEliminarGrupo, gruposActuales = [] }) => {
  const navigate = useNavigate();
  
  const [gradoSel, setGradoSel] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);
  const [showTitularAlert, setShowTitularAlert] = useState(false);
  const [idGrupoPendiente, setIdGrupoPendiente] = useState(null); // Variable correcta

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const gruposFiltrados = gradoSel 
    ? gruposActuales.filter(g => String(g.id_grado) === String(gradoSel))
    : gruposActuales;

  const totalItems = gruposFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina) || 1;
  const indiceUltimo = paginaActual * itemsPorPagina;
  const indicePrimero = indiceUltimo - itemsPorPagina;
  const gruposPaginados = gruposFiltrados.slice(indicePrimero, indiceUltimo);

  const handleVincular = async () => {
    if (!gradoSel || !nombreNuevo) return;
    setErrorLocal(null);
    try {
        await onCrearGrupo(gradoSel, nombreNuevo.toUpperCase().trim());
        setNombreNuevo('');
        // Importante: No reseteamos gradoSel aquí para que el usuario vea su nuevo grupo
    } catch (err) {
        setErrorLocal(err.response?.data?.detail || "Error al vincular");
    }
  };

  const handleDesvincularSeguro = async (idGrupo) => {
    setErrorLocal(null);
    const grupo = gruposActuales.find(g => g.id_grupo === idGrupo);
    
    // VALIDACIÓN: id_docente_titular debe venir del backend
    if (grupo?.id_docente_titular !== null && grupo?.id_docente_titular !== undefined) {
        setIdGrupoPendiente(idGrupo);
        setShowTitularAlert(true);
        return;
    }

    if (!window.confirm(`¿Está seguro de eliminar el grupo ${grupo?.nombre_grupo}?`)) return;
    
    try {
        await onEliminarGrupo(idGrupo);
    } catch (err) {
        const msg = err.response?.data?.detail || "Error";
        setErrorLocal(msg);
        if (msg.includes("titular")) setShowTitularAlert(true);
    }
  };

  return (
    <div className="pt-2">
      {errorLocal && <Alert variant="danger" dismissible>{errorLocal}</Alert>}

      <div className="bg-light p-3 rounded border mb-4">
        <Row className="g-3 align-items-end">
          <Col md={5}>
            <Form.Label className="small fw-bold">1. Seleccionar Grado</Form.Label>
            <Form.Select value={gradoSel} onChange={e => { setGradoSel(e.target.value); setPaginaActual(1); }}>
              <option value="">-- Todos los grados --</option>
              {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="small fw-bold">2. Nombre del Nuevo Grupo</Form.Label>
            <Form.Control 
              placeholder="Ej: A, B..." 
              value={nombreNuevo}
              onChange={e => setNombreNuevo(e.target.value)}
              disabled={!gradoSel}
            />
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100 fw-bold" onClick={handleVincular} disabled={!gradoSel || !nombreNuevo}>
                + Vincular al Año
            </Button>
          </Col>
        </Row>
      </div>

      <Table striped bordered hover className="bg-white align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Grado</th>
            <th>Grupo</th>
            <th className="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {gruposPaginados.map(g => (
            <tr key={g.id_grupo}>
              <td>{g.id_grupo}</td>
              <td>{g.nombre_grado}</td>
              <td className="fw-bold text-primary">Grupo {g.nombre_grupo}</td>
              <td className="text-center">
                <Button variant="outline-danger" size="sm" onClick={() => handleDesvincularSeguro(g.id_grupo)}>
                    Desvincular
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showTitularAlert} onHide={() => setShowTitularAlert(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-5 fw-bold">🛑 Grupo con Titular</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p>Este grupo tiene un titular vinculado. Elimine el titular y vuelva a intentarlo.</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button variant="secondary" onClick={() => setShowTitularAlert(false)}>Cerrar</Button>
          <Button 
            variant="primary" 
            onClick={() => {
                setShowTitularAlert(false);
                navigate(`/grupos/`);
            }}
          >
            🔍 Gestionar Grupo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TabGrupos;