import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const AnioForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ fecha_inicio: '', fecha_fin: '', num_periodos: 4 });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ fecha_inicio: '', fecha_fin: '', num_periodos: 4 });
  };

  return (
    <Card className="p-3 shadow-sm mb-4">
      <Card.Body>
        <h2 className="text-primary fw-bold mb-4">📅 Nuevo Año Escolar</h2>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control 
                  type="date" 
                  required 
                  value={form.fecha_inicio}
                  onChange={e => setForm({...form, fecha_inicio: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control 
                  type="date" 
                  required 
                  value={form.fecha_fin}
                  onChange={e => setForm({...form, fecha_fin: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Periodos</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" max="6" 
                  value={form.num_periodos}
                  onChange={e => setForm({...form, num_periodos: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-center">
              <Button variant="primary" type="submit" className="w-100 mt-2">
                Crear
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AnioForm;