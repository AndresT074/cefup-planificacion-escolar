import React from 'react';
import Gestion from './pages/Gestion';

// Definimos la ruta interna del módulo [cite: 25]
export const estudiantesRoutes = [
    {
        path: 'estudiantes', // La ruta final será /administracion/estudiantes
        element: <Gestion />
    }
];