import React, { useState, useEffect } from 'react';

const Formulario = ({ onGuardar, datosEdicion, onCancelar }) => {
    const [formData, setFormData] = useState({
        tipo_documento_identidad: 'CC',
        numero_documento_identidad: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        email: '',
        fecha_ingreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        alergias: '',
        condicion_especial: '',
        observaciones_medicas: ''
    });

    useEffect(() => {
        if (datosEdicion) {
            // Log para que veas en la consola (F12) cómo vienen los datos exactamente
            console.log("Datos que llegaron al formulario:", datosEdicion);

            const p = datosEdicion.persona || datosEdicion;
            
            setFormData({
                tipo_documento_identidad: p.tipo_documento_identidad || 'CC',
                numero_documento_identidad: p.numero_documento_identidad || '',
                nombres: p.nombres || '',
                apellidos: p.apellidos || '',
                fecha_nacimiento: p.fecha_nacimiento || '',
                email: p.email || '',
                // BUSCAMOS LAS ALERGIAS: primero en la raíz, luego en el objeto anidado
                fecha_ingreso: datosEdicion.fecha_ingreso || p.fecha_ingreso || '',
                alergias: datosEdicion.alergias || p.alergias || '',
                condicion_especial: datosEdicion.condicion_especial || p.condicion_especial || '',
                observaciones_medicas: datosEdicion.observaciones_medicas || p.observaciones_medicas || ''
            });
        } else {
            limpiarFormulario();
        }
    }, [datosEdicion]);

    const limpiarFormulario = () => {
        setFormData({
            tipo_documento_identidad: 'CC',
            numero_documento_identidad: '',
            nombres: '',
            apellidos: '',
            fecha_nacimiento: '',
            email: '',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            alergias: '',
            condicion_especial: '',
            observaciones_medicas: ''
        });
    };

    const handleChange = (e) => {
    // Es vital que el 'name' del textarea sea exactamente 'alergias'
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar(formData);
    };

    return (
        <div className="card shadow-sm border-primary">
            <div className={`card-header ${datosEdicion ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
                <h5 className="mb-0">{datosEdicion ? '✏️ Editando Estudiante' : '➕ Registrar Nuevo Estudiante'}</h5>
            </div>
            <form onSubmit={handleSubmit} className="card-body">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label font-weight-bold">Tipo Documento</label>
                        <select name="tipo_documento_identidad" className="form-select" value={formData.tipo_documento_identidad} onChange={handleChange}>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                        </select>
                    </div>
                    <div className="col-md-8">
                        <label className="form-label">Número de Documento</label>
                        <input name="numero_documento_identidad" type="text" className="form-control" value={formData.numero_documento_identidad} onChange={handleChange} required disabled={!!datosEdicion} />
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label">Nombres</label>
                        <input name="nombres" type="text" className="form-control" value={formData.nombres} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Apellidos</label>
                        <input name="apellidos" type="text" className="form-control" value={formData.apellidos} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input name="fecha_nacimiento" type="date" className="form-control" value={formData.fecha_nacimiento} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Fecha de Ingreso</label>
                        <input name="fecha_ingreso" type="date" className="form-control" value={formData.fecha_ingreso} onChange={handleChange} required />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Email</label>
                        <input name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="col-12">
                        <hr className="my-2" />
                        <h6 className="text-primary">Información Médica</h6>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label">Alergias</label>
                        <textarea name="alergias" className="form-control" rows="2" value={formData.alergias} onChange={handleChange} placeholder="Ej: Polen, Penicilina..."></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Observaciones Médicas</label>
                        <textarea name="observaciones_medicas" className="form-control" rows="2" value={formData.observaciones_medicas} onChange={handleChange}></textarea>
                    </div>
                </div>

                <div className="mt-4 d-flex gap-2 justify-content-end">
                    {datosEdicion && (
                        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
                            Cancelar
                        </button>
                    )}
                    <button type="submit" className={`btn ${datosEdicion ? 'btn-warning' : 'btn-success'} px-4`}>
                        {datosEdicion ? 'Actualizar Datos' : 'Guardar Estudiante'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Formulario;