import React, { useState, useEffect } from 'react';
// CORRECCIÓN DE IMPORTACIONES
import FormularioDocente from '../components/FormularioDocente';
import { 
    registrarDocente, 
    obtenerDocentes, 
    cambiarEstadoDocente, 
    actualizarDocente 
} from '../services/docentes.api';

const GestionDocentes = () => {
    const [docentes, setDocentes] = useState([]);
    const [pestaña, setPestaña] = useState('activos'); 
    const [docenteAEditar, setDocenteAEditar] = useState(null); 

    // Función unificada para cargar datos desde la API
    const cargarDatos = async () => {
        try {
            const data = await obtenerDocentes();
            setDocentes(data);
        } catch (error) {
            console.error("Error al conectar con la API de docentes");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleGuardar = async (formData) => {
        try {
            if (docenteAEditar) {
                // Actualización: Usamos el ID almacenado en el estado de edición
                await actualizarDocente(docenteAEditar.id_persona, formData);
                alert("✅ Docente actualizado con éxito");
            } else {
                // Registro: Creación de un nuevo docente
                await registrarDocente(formData);
                alert("✅ Docente registrado con éxito");
            }
            
            // Limpiamos el estado de edición y refrescamos la tabla
            setDocenteAEditar(null);
            await cargarDatos(); // Corregido: antes decía cargarDocentes()
            
        } catch (error) {
            console.error(error);
            // Captura el IntegrityError (Duplicados) o errores de validación 422
            alert("❌ Error: No se pudo procesar la solicitud. El documento podría estar duplicado o los datos son inválidos.");
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        const accion = nuevoEstado === 'inactivo' ? "retirar" : "reincorporar";
        if (window.confirm(`¿Está seguro de que desea ${accion} a este docente?`)) {
            try {
                await cambiarEstadoDocente(id, nuevoEstado);
                alert(`✅ Docente ${nuevoEstado === 'inactivo' ? 'movido al historial' : 'reincorporado'}`);
                await cargarDatos();
            } catch (error) {
                alert("❌ Error al actualizar el estado");
            }
        }
    };

    const prepararEdicion = (docente) => {
        setDocenteAEditar(docente);
        // Efecto visual para que el usuario vea el formulario cargado
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    // Filtrado lógico según la pestaña seleccionada
    const docentesFiltrados = docentes.filter(doc => 
        pestaña === 'activos' ? doc.estado === 'activo' : doc.estado === 'inactivo'
    );

    return (
        <div className="container-fluid py-4">
            <div className="row">
                {/* Columna del Formulario */}
                <div className="col-lg-4 mb-4">
                    <FormularioDocente 
                        onGuardar={handleGuardar} 
                        datosEdicion={docenteAEditar}
                        onCancelar={() => setDocenteAEditar(null)}
                    />
                </div>
                
                {/* Columna de la Tabla */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-info">
                        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Plantilla de Docentes (Muxul)</h5>
                            <div className="btn-group btn-group-sm">
                                <button 
                                    className={`btn ${pestaña === 'activos' ? 'btn-light' : 'btn-outline-light'}`}
                                    onClick={() => setPestaña('activos')}
                                >Activos</button>
                                <button 
                                    className={`btn ${pestaña === 'historial' ? 'btn-light' : 'btn-outline-light'}`}
                                    onClick={() => setPestaña('historial')}
                                >Historial</button>
                            </div>
                        </div>
                        <div className="table-responsive p-3">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Documento</th>
                                        <th>Nombre Completo</th>
                                        <th>Título</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docentesFiltrados.length > 0 ? (
                                        docentesFiltrados.map((doc) => (
                                            <tr key={doc.id_persona}>
                                                <td>{doc.numero_documento_identidad}</td>
                                                <td>{`${doc.nombres} ${doc.apellidos}`}</td>
                                                <td>
                                                    <small className="text-muted text-uppercase">
                                                        {doc.ultimo_titulo_profesional || 'SIN TÍTULO'}
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-sm btn-info text-white me-2"
                                                        onClick={() => prepararEdicion(doc)}
                                                    >Editar</button>
                                                    {pestaña === 'activos' ? (
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => handleCambiarEstado(doc.id_persona, 'inactivo')}
                                                        >Retirar</button>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleCambiarEstado(doc.id_persona, 'activo')}
                                                        >Reactivar</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4">
                                                No hay registros en {pestaña === 'activos' ? 'el listado activo' : 'el historial'}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionDocentes;