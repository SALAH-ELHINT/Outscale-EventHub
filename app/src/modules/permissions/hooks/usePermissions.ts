import { CRUD_ACTION, Id } from '@common/defs/types';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { useMemo } from 'react';

interface PermissionsAPI {
  can: (entityName: string, action: string | CRUD_ACTION | CRUD_ACTION[], entityId?: Id) => boolean;
  canNot: (
    entityName: string,
    action: string | CRUD_ACTION | CRUD_ACTION[],
    entityId?: Id
  ) => boolean;
}

const usePermissions = (): PermissionsAPI => {
  const { user } = useAuth();

  const can = (
    entityName: string,
    action: string | CRUD_ACTION | CRUD_ACTION[],
    entityId?: Id
  ): boolean => {
    if (!user) {
      return false;
    }

    // Vérifie le droit de faire toutes les actions sur toutes les "entity"
    if (user.permissionsNames.includes(`${entityName}.*`)) {
      return true;
    }

    const actionsParam = Array.isArray(action) ? action : [action];

    const permissions = actionsParam
      .map((action) =>
        entityId
          ? [`${entityName}.${entityId}.${action}`, `${entityName}.${action}`]
          : `${entityName}.${action}`
      )
      .flat();

    // Vérifie le droit de faire l'action "action" sur toutes les "entity"
    if (permissions.some((permission) => user.permissionsNames.includes(permission))) {
      return true;
    }

    // Aucune correspondance trouvée
    return false;
  };

  const canNot = (
    entityName: string,
    action: string | CRUD_ACTION | CRUD_ACTION[],
    entityId?: Id
  ): boolean => {
    return !can(entityName, action, entityId);
  };

  return useMemo(() => ({ can, canNot }), [user?.permissionsNames]);
};

export default usePermissions;
