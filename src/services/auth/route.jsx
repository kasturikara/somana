import { Route, Routes } from "react-router-dom";
import LoginPages from "./page";
import { NotFoundPages } from "../../component/pages";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPages />} />

      <Route path="*" element={<NotFoundPages />} />
    </Routes>
  );
};

export default AuthRoutes;
