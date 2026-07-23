import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

const TabPeriodos = ({ periodos, onGuardarPeriodo, onModificarCantidad }) => {
  return (
    <Row>
      <Col xs={12} className="mb-3">
        <Button variant="outline-primary" size="sm" onClick={() => onModificarCantidad('add')}>+ Añadir Periodo</Button>{' '}
        <Button variant="outline-danger" size="sm" onClick={() => onModificarCantidad('remove')}>- Quitar Último</Button>
      </Col>
      {periodos.map(p => (
        <Col md={4} key={p.id_periodo} className="mb-3">
          <Card className="p-3 border-0 bg-light shadow-sm">
            <strong className="mb-2">Periodo {p.orden_periodo}</strong>
            <label className="small text-muted">Fecha Inicio</label>
            <input type="date" className="form-control mb-2" defaultValue={p.fecha_inicio.split('T')[0]} id={`in-${p.id_periodo}`} />
            
            <label className="small text-muted">Fecha Cierre</label>
            <input type="date" className="form-control mb-3" defaultValue={p.fecha_fin.split('T')[0]} id={`fi-${p.id_periodo}`} />
            
            <Button size="sm" variant="success" onClick={() => {
              const inicio = document.getElementById(`in-${p.id_periodo}`).value;
              const fin = document.getElementById(`fi-${p.id_periodo}`).value;
              onGuardarPeriodo(p.id_periodo, inicio, fin);
            }}>
              💾 Guardar Fechas
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TabPeriodos;