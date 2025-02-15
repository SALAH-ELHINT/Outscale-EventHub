import { useMemo } from 'react';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { ROLE } from '@modules/permissions/defs/types';

interface RolesAPI {
  hasRole: (role: ROLE) => boolean;
  hasNotRole: (role: ROLE) => boolean;
}

const useRoles = (): RolesAPI => {
  const { user } = useAuth();

  const hasRole = (role: ROLE): boolean => {
    if (!user) {
      return false;
    }
    return user.rolesNames.includes(role);
  };

  const hasNotRole = (role: ROLE): boolean => {
    return !hasRole(role);
  };

  return useMemo(() => ({ hasRole, hasNotRole }), [user?.roles]);
};

export default useRoles;
