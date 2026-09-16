import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AccessDenied from './AccessDenied';

export default function RoleRoute({ allowedRoles, children }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  const normUserRole = (role || '').toLowerCase().replace(/ /g, '');

  const isAllowed = allowedRoles.some(r => {
    const norm = r.toLowerCase().replace(/ /g, '');
    if (r === role || norm === normUserRole) return true;
    if (norm === 'admin' && (normUserRole === 'admin' || normUserRole === 'hospitaladministrator')) return true;
    if (norm === 'researcher' && (normUserRole === 'researcher' || normUserRole === 'healthcareresearcher')) return true;
    if (norm === 'sysadmin' && (normUserRole === 'sysadmin' || normUserRole === 'systemadministrator')) return true;
    return false;
  });

  if (!isAllowed) {
    return <AccessDenied requiredRole={allowedRoles.join(' or ')} />;
  }

  return children;
}
