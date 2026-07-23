import React, { useState, useEffect } from 'react';

const FormularioDocente = ({ onGuardar, datosEdicion, onCancelar }) => {
    // 1. Estado inicial con todos los campos de Persona y Docente
    const estadoInicial = {
        tipo_documento_identidad: 'CC',
        numero_documento_identidad: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '', 
        email: '',
        ultimo_titulo_profesional: '',
        actual_cargo: 'Docente',
        fecha_contratacion: new Date().toISOString().split('T')[0]
    };

    const [formData, setFormData] = useState(estadoInicial);

    // 2. Efecto para cargar datos al editar sin que se rompa por valores nulos
    useEffect(() => {
        if (datosEdicion) {
            const base = datosEdicion.persona || datosEdicion;
            setFormData({
                tipo_documento_identidad: base?.tipo_documento_identidad || 'CC',
                numero_documento_identidad: base?.numero_documento_identidad || '',
                nombres: base?.nombres || '',
                apellidos: base?.apellidos || '',
                fecha_nacimiento: base?.fecha_nacimiento || '',
                email: base?.email || '',
                ultimo_titulo_profesional: datosEdicion?.ultimo_titulo_profesional || base?.ultimo_titulo_profesional || '',
                actual_cargo: datosEdicion?.actual_cargo || base?.actual_cargo || 'Docente',
                fecha_contratacion: datosEdicion?.fecha_contratacion || base?.fecha_contratacion || ''
            });
        } else {
            setFormData(estadoInicial);
        }
    }, [datosEdicion]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Creamos una copia de los datos del estado
        const datosParaEnviar = { ...formData };

        // LIMPIEZA CRÍTICA: Convertimos strings vacíos en null 
        // para que el validador de Python los acepte
        if (!datosParaEnviar.fecha_nacimiento || datosParaEnviar.fecha_nacimiento === "") {
            datosParaEnviar.fecha_nacimiento = null;
        }
        if (!datosParaEnviar.email || datosParaEnviar.email.trim() === "") {
            datosParaEnviar.email = null;
        }
        // Aseguramos que la fecha de contratación no viaje vacía
        if (!datosParaEnviar.fecha_contratacion) {
            datosParaEnviar.fecha_contratacion = new Date().toISOString().split('T')[0];
        }

        console.log("Enviando datos unificados:", datosParaEnviar);
        onGuardar(datosParaEnviar);
    };

    return (
        <div className={`card shadow-sm ${datosEdicion ? 'border-primary' : 'border-info'}`}>
            <div className={`card-header text-white ${datosEdicion ? 'bg-primary' : 'bg-info'}`}>
                <h5 className="mb-0">
                    {datosEdicion ? '✏️ Editando Docente' : '➕ Registrar Nuevo Docente'}
                </h5>
            </div>
            <form onSubmit={handleSubmit} className="card-body">
                <div className="row g-3">
                    {/* Identificación */}
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Tipo Doc.</label>
                        <select name="tipo_documento_identidad" className="form-select" onChange={handleChange} value={formData.tipo_documento_identidad}>
                            <option value="CC">CC</option>
                            <option value="CE">CE</option>
                        </select>
                    </div>
                    <div className="col-md-8">
                        <label className="form-label small fw-bold">Número Documento</label>
                        <input name="numero_documento_identidad" className="form-control" value={formData.numero_documento_identidad || ''} onChange={handleChange} required disabled={!!datosEdicion} />
                    </div>

                    {/* Nombres y Apellidos */}
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Nombres</label>
                        <input name="nombres" className="form-control" value={formData.nombres || ''} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Apellidos</label>
                        <input name="apellidos" className="form-control" value={formData.apellidos || ''} onChange={handleChange} required />
                    </div>

                    {/* Fechas */}
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">F. Nacimiento</label>
                        <input name="fecha_nacimiento" type="date" className="form-control" value={formData.fecha_nacimiento || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">F. Contratación</label>
                        <input name="fecha_contratacion" type="date" className="form-control" value={formData.fecha_contratacion || ''} onChange={handleChange} required />
                    </div>

                    {/* Datos Profesionales */}
                    <div className="col-md-12">
                        <label className="form-label small fw-bold">Email Institucional</label>
                        <input name="email" type="email" className="form-control" value={formData.email || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-8">
                        <label className="form-label small fw-bold">Título Profesional</label>
                        <input name="ultimo_titulo_profesional" className="form-control" value={formData.ultimo_titulo_profesional || ''} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Cargo</label>
                        <input name="actual_cargo" className="form-control" value={formData.actual_cargo || ''} onChange={handleChange} required />
                    </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button type="submit" className={`btn ${datosEdicion ? 'btn-primary' : 'btn-info text-white shadow-sm'}`}>
                        {datosEdicion ? '💾 Guardar Cambios' : '🚀 Registrar Docente'}
                    </button>
                    {datosEdicion && (
                        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
                            ❌ Cancelar Edición
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FormularioDocente;