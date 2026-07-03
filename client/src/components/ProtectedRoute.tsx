
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // Basic check for now, real validation happens at the API layer
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
