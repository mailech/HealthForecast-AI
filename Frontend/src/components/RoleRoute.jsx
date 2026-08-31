import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AccessDenied from './AccessDenied';

export default function RoleRoute({ allowedRoles, children }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  // Support exact title case or normalized strings
  const normalizedUserRole = (role || '').toLowerCase().replace(/ /g, '_');
  const isAllowed = allowedRoles.some(r => {
    const norm = r.toLowerCase().replace(/ /g, '_');
    return r === role || norm === normalizedUserRole;
  });

  if (!isAllowed) {
    return <AccessDenied requiredRole={allowedRoles.join(' or ')} />;
  }

  return children;
}
