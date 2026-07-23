import axios from 'axios';

// Ajuste de URL para coincidir con tu backend
const API_URL = 'http://localhost:8000/api/docentes';

export const registrarDocente = async (docenteData) => {
    const response = await axios.post(`${API_URL}/`, docenteData);
    return response.data;
};

export const obtenerDocentes = async () => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
};

export const cambiarEstadoDocente = async (id, nuevoEstado) => {
    // Nota: Verifica si tu backend tiene esta ruta PATCH, si no, usa PUT
    const response = await axios.patch(`${API_URL}/${id}/estado`, { 
        estado: nuevoEstado 
    });
    return response.data;
};

export const actualizarDocente = async (id, docenteData) => {
    // Corregido para usar Axios igual que el resto
    const response = await axios.put(`${API_URL}/${id}`, docenteData);
    return response.data;
};