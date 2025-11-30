import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPages } from "./pages";
import { NotFoundPages } from "../../component/pages";

const SSORoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<DashboardPages />} />

      <Route path="*" element={<NotFoundPages />} />
    </Routes>
  );
};

export default SSORoutes;
