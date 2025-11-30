import { Navigate, Route, Routes } from "react-router-dom";
import LoginPages from "./services/auth/page";
import SSORoutes from "./services/sso/route";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public login route */}
      <Route path="/login" element={<LoginPages />} />

      {/* Protected SSO routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? <SSORoutes /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
