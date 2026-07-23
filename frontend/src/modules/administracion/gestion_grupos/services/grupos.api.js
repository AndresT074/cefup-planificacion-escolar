import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const listarGrupos = (anio, grado) =>
  API.get(`/grupo/por-anio-grado/${anio}/${grado}`);

export const actualizarGrupo = (id, data) =>
  API.put(`/grupo/${id}`, data);