import { Routes, Route } from "react-router-dom";
import GestionGrupos from "./pages/GestionGrupos";
import VerGrupo from "./pages/verGrupo";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/administracion/gestion_grupos"
        element={<GestionGrupos />}
      />

      <Route
        path="/administracion/gestion_grupos/ver/:id_grupo"
        element={<VerGrupo />}
      />
    </Routes>
  );
}