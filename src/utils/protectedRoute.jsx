import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ component: Component }) {
  const { user } = useAuth();

  return user ? <Component /> : <Navigate to="/login" />;
}

export default ProtectedRoute;