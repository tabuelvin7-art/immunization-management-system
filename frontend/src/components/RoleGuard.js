import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useContext(AuthContext);

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
};

export default RoleGuard;