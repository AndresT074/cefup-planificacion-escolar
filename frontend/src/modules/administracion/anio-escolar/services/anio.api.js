import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api/anios' });

export const getAnios = () => API.get('/');
export const createAnio = (data) => API.post('/', data);
export const updateAnio = (id, data) => API.put(`/${id}`, data);
export const activateAnio = (id) => API.put(`/${id}/activar`);
export const getPeriodos = (id) => API.get(`/${id}/periodos`);
export const updatePeriodo = (id_p, data) => API.put(`/periodos/${id_p}`, data);
export const addPeriodo = (id) => API.post(`/${id}/periodos`);
export const removeLastPeriodo = (id) => API.delete(`/${id}/periodos/ultimo`);
export const getAllDocentes = () => API.get('/docentes/todos');
export const getDocentesVinculados = (id) => API.get(`/${id}/docentes`);
export const vincularDocente = (id, id_per) => API.post(`/${id}/docentes/${id_per}`);
export const desvincularDocente = (id, id_per) => API.delete(`/${id}/docentes/${id_per}`);
export const getGrados = () => API.get('/grados/todos');

export const getGrupos = (idAnio, idGrado = null, historial = false) => {
    let url = `/${idAnio}/grupos?`;
    if (idGrado) url += `id_grado=${idGrado}&`;
    if (historial) url += `historial=true`;
    return API.get(url);
};

export const createGrupo = (id, id_grado, nombre) => API.post(`/${id}/grupos?id_grado=${id_grado}&nombre=${nombre}`);
export const deleteGrupo = (id_g) => API.delete(`/grupos/${id_g}`);