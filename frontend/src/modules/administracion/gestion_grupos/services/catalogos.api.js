import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const listarAnios = () => API.get("/anio-escolar/");
export const listarGrados = () => API.get("/grado/");

export const listarDocentesVinculados = (anioId) =>
  API.get(`/docente-vinculado/anio/${anioId}`);

export const actualizarAsignacionGrupo = (asignacionId, data) =>
  API.put(`/asignacion-grupo/${asignacionId}`, data);

export const mapDocenteVinculado = (dv) => {
  const persona = dv.persona ?? dv.docente?.persona ?? dv.docente_vinculado?.persona ?? null;
  const id = dv.id_docente_vinculado ?? dv.id_docente_titular ?? dv.id_docente ?? dv.id_persona ?? dv.docente?.id_docente_vinculado ?? dv.docente?.id_docente ?? dv.docente?.id_persona ?? null;
  return { id, nombre: persona ? `${persona.nombres} ${persona.apellidos}` : "Docente sin nombre" };
};