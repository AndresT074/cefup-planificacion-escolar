import React, { useState, useEffect } from 'react';
import Formulario from '../components/Formulario';
// Asegúrate de importar actualizarEstudiante desde tu archivo de servicios
import { registrarEstudiante, obtenerEstudiantes, cambiarEstadoEstudiante, actualizarEstudiante } from '../services/api';

const Gestion = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [pestaña, setPestaña] = useState('activos'); 
    const [estudianteAEditar, setEstudianteAEditar] = useState(null); // Estado para rastrear la edición

    const cargarDatos = async () => {
        try {
            const data = await obtenerEstudiantes();
            console.log("Revisando datos de Muxul:", data); 
            setEstudiantes(data);
        } catch (error) {
            console.error("Error al cargar la base de datos");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleGuardar = async (datos) => {
        try {
            if (estudianteAEditar) {
                // Si estamos editando, usamos el ID para la petición PUT
                const id = estudianteAEditar.persona?.id_persona || estudianteAEditar.id_persona;
                await actualizarEstudiante(id, datos);
                alert("✅ Estudiante actualizado correctamente");
                setEstudianteAEditar(null); // Limpiar modo edición
            } else {
                await registrarEstudiante(datos);
                alert("✅ Estudiante registrado en el sistema");
            }
            cargarDatos(); 
        } catch (error) {
            alert("❌ Error al procesar la solicitud");
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        const mensaje = nuevoEstado === 'inactivo' 
            ? "¿Mover al archivo histórico?" 
            : "¿Reactivar estudiante?";
        
        if (window.confirm(mensaje)) {
            try {
                await cambiarEstadoEstudiante(id, nuevoEstado);
                alert("✅ Estado actualizado");
                cargarDatos();
            } catch (error) {
                alert("❌ Error en la actualización de estado");
            }
        }
    };

    // Función para activar el modo edición
    const prepararEdicion = (estudiante) => {
        setEstudianteAEditar(estudiante);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const estudiantesFiltrados = estudiantes.filter(est => {
        const item = est.persona || est; 
        const estadoAPI = (item.estado || "activo").trim().toLowerCase();
        return pestaña === 'activos' ? estadoAPI === 'activo' : estadoAPI === 'inactivo';
    });

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-lg-4 mb-4">
                    {/* Pasamos datosEdicion y onCancelar al Formulario */}
                    <Formulario 
                        onGuardar={handleGuardar} 
                        datosEdicion={estudianteAEditar} 
                        onCancelar={() => setEstudianteAEditar(null)}
                    />
                </div>
                
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Gestión de Alumnado (Muxul)</h5>
                            <div className="btn-group btn-group-sm">
                                <button 
                                    className={`btn ${pestaña === 'activos' ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => setPestaña('activos')}
                                >Activos</button>
                                <button 
                                    className={`btn ${pestaña === 'historial' ? 'btn-secondary' : 'btn-outline-light'}`}
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
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantesFiltrados.length > 0 ? (
                                        estudiantesFiltrados.map((est) => {
                                            const p = est.persona || est;
                                            return (
                                                <tr key={p.id_persona}>
                                                    <td>{p.numero_documento_identidad}</td>
                                                    <td>{`${p.nombres} ${p.apellidos}`}</td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="btn btn-sm btn-info text-white me-2"
                                                            onClick={() => prepararEdicion(est)}
                                                        >Editar</button>
                                                        {pestaña === 'activos' ? (
                                                            <button 
                                                                className="btn btn-sm btn-outline-warning"
                                                                onClick={() => handleCambiarEstado(p.id_persona, 'inactivo')}
                                                            >Archivar</button>
                                                        ) : (
                                                            <button 
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleCambiarEstado(p.id_persona, 'activo')}
                                                            >Reactivar</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="3" className="text-center py-4 text-muted">
                                            No hay registros en esta sección.
                                        </td></tr>
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

export default Gestion;