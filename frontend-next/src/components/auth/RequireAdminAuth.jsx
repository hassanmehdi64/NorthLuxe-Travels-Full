import Loader from "../spinner/Loader";
import { Navigate, useLocation } from "@/lib/router";
import { useAuth } from "../../context/useAuth";

const RequireAdminAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage label="Checking session" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

export default RequireAdminAuth;
