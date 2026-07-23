import React from 'react';

export default function GruposTable({ grupos, onEditar, onVer }) {
  
  const getNombreDocenteTitular = (grupo) => {
    const docente = grupo.docente_titular;
    if (!docente) return <span className="text-muted italic">No asignado</span>;

    const persona = docente.persona;
    return `${persona?.nombres || ""} ${persona?.apellidos || ""}`.trim() || "Docente sin nombre";
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="ps-4">Nombre Grupo</th>
              <th>Grado</th>
              <th>Año Escolar</th>
              <th>Docente Titular</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No se encontraron grupos con esos criterios.
                </td>
              </tr>
            ) : (
              grupos.map((g) => (
                <tr key={g.id_grupo}>
                  <td className="ps-4 fw-bold text-primary">{g.nombre_grupo}</td>
                  <td>{g.grado?.nombre_grado}</td>
                  <td>{g.anio_escolar?.fecha_inicio.substring(0, 4)}</td>
                  <td>{getNombreDocenteTitular(g)}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-outline-info btn-sm fw-bold" onClick={() => onVer(g.id_grupo)}>
                        📚 Asignaturas 
                      </button>
                      <button className="btn btn-warning btn-sm text-dark fw-bold" onClick={() => onEditar(g)}>
                        ✏️ Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}