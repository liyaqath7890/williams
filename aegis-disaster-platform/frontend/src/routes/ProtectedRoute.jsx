import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForRole } from '../utils/roleRedirect';
import { normalizeRole } from '../constants/roleAccess';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { accessToken, bootstrapped, status, user } = useAuth();

  if (!bootstrapped || status === 'loading') {
    return <div className="min-h-screen bg-slate-100 p-6 text-slate-600">Checking secure session...</div>;
  }

  if (!accessToken || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const role = normalizeRole(user.role);

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
