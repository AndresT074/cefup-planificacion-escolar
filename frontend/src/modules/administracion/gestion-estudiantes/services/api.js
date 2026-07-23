import axios from 'axios';

// Agregamos /api/v1 para que coincida con el backend
const API_URL = 'http://localhost:8000/api/v1/estudiantes'; 

export const registrarEstudiante = async (estudianteData) => {
    // Esto enviará el POST a http://localhost:8000/api/v1/estudiantes/
    const response = await axios.post(`${API_URL}/`, estudianteData);
    return response.data;
};

export const obtenerEstudiantes = async () => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
};


export const cambiarEstadoEstudiante = async (id, nuevoEstado) => {
    // Fíjate que usamos PATCH y la ruta que definimos en el Router del Backend
    const response = await axios.patch(`${API_URL}/${id}/estado`, { 
        estado: nuevoEstado 
    });
    return response.data;
};



// ... (mantén tus funciones anteriores: obtenerEstudiantes, registrarEstudiante, etc.)

export const actualizarEstudiante = async (id, datos) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, datos);
        return response.data;
    } catch (error) {
        console.error("Error en la API al actualizar:", error);
        throw error;
    }
};

