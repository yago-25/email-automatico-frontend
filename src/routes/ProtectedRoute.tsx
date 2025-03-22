import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, redirectPath = "/" }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
