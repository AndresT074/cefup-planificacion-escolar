import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const AnioTable = ({ anios, onActivate, onConfig }) => {
  if (!anios) return null;

  // Función para formatear la fecha sin que se mueva por la zona horaria
  const formatFechaManual = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const getYearManual = (fechaStr) => {
    if (!fechaStr) return "";
    return fechaStr.split('-')[0];
  };

  return (
    <Table striped bordered hover responsive className="mt-4 shadow-sm bg-white">
      <thead className="bg-dark text-white">
        <tr>
          <th>Año</th>
          <th>Fechas</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {anios.map((anio) => (
          <tr key={anio.id_anio_escolar} className={anio.es_anio_actual ? "table-success" : ""}>
            {/* Aquí usamos getYearManual para que el 2024-01-01 se vea como 2024 y no 2023 */}
            <td className="fw-bold">{getYearManual(anio.fecha_inicio)}</td>
            <td>
              {formatFechaManual(anio.fecha_inicio)} - {formatFechaManual(anio.fecha_fin)}
            </td>
            <td>
              {anio.es_anio_actual ? (
                <Badge bg="success">ACTUAL</Badge>
              ) : (
                <Badge bg="secondary">Inactivo</Badge>
              )}
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button variant="primary" size="sm" onClick={() => onConfig(anio)}>
                  ⚙️ Configurar
                </Button>
                {!anio.es_anio_actual && (
                  <Button variant="outline-success" size="sm" onClick={() => onActivate(anio.id_anio_escolar)}>
                    Activar
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AnioTable;