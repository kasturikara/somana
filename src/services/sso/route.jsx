import { Navigate, Route, Routes } from "react-router-dom";
import {
  DashboardPages,
  SyncPages,
  SSOClonePage,
  SSOServicesPage,
} from "./pages";
import { NotFoundPages } from "../../component/pages";

const SSORoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<DashboardPages />} />
      <Route path="/sso-clone" element={<SSOClonePage />} />
      <Route path="/sso-services" element={<SSOServicesPage />} />
      <Route path="/sync-sso" element={<SyncPages />} />

      <Route path="*" element={<NotFoundPages />} />
    </Routes>
  );
};

export default SSORoutes;
