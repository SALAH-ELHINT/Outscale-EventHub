import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import { Permission, PermissionCheck } from '@modules/permissions/defs/types';

interface WithPermissionsProps {
  requiredPermissions: PermissionCheck;
  redirectUrl: string;
}

const withPermissions = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredPermissions, redirectUrl }: WithPermissionsProps
): ComponentType<P> => {
  const WithPermissions: ComponentType<P> = (props: P) => {
    const { can } = usePermissions();
    const router = useRouter();

    const isPermission = (check: PermissionCheck): check is Permission => {
      return (check as Permission).entity !== undefined;
    };

    const evaluatePermission = (permissionCheck: PermissionCheck): boolean => {
      if ('and' in permissionCheck) {
        return permissionCheck.and?.every(evaluatePermission) ?? false;
      }
      if ('or' in permissionCheck) {
        return permissionCheck.or?.some(evaluatePermission) ?? false;
      }
      if ('not' in permissionCheck) {
        if (Array.isArray(permissionCheck.not)) {
          return permissionCheck.not.every((subPermCheck) => !evaluatePermission(subPermCheck));
        }

        return !evaluatePermission(permissionCheck.not!);
      }

      if (isPermission(permissionCheck)) {
        return can(permissionCheck.entity, permissionCheck.action, permissionCheck.entityId);
      }
      return false;
    };

    const updateEntityId = (id: string, permissionCheck: PermissionCheck): PermissionCheck => {
      if (
        isPermission(permissionCheck) &&
        (!permissionCheck.entityId || permissionCheck.entityId !== Number(id))
      ) {
        return { ...permissionCheck, entityId: Number(id) };
      }
      if ('and' in permissionCheck) {
        return { and: permissionCheck.and!.map((pc) => updateEntityId(id, pc)) };
      }
      if ('or' in permissionCheck) {
        return { or: permissionCheck.or!.map((pc) => updateEntityId(id, pc)) };
      }
      if ('not' in permissionCheck) {
        return { not: permissionCheck.not!.map((pc) => updateEntityId(id, pc)) };
      }
      return permissionCheck;
    };

    useEffect(() => {
      // Vérifier les permissions avec entityId si router.query.id existe
      if (router.query.id && typeof router.query.id === 'string') {
        const id =
          isPermission(requiredPermissions) && requiredPermissions.entityQueryKey
            ? (router.query[requiredPermissions.entityQueryKey] as string)
            : (router.query.id as string);

        requiredPermissions = updateEntityId(id, requiredPermissions);
      }

      const hasRequiredPermission = evaluatePermission(requiredPermissions);

      if (!hasRequiredPermission) {
        router.replace(redirectUrl);
      }
    }, [requiredPermissions, redirectUrl, can, router]);

    return <WrappedComponent {...props} />;
  };

  return WithPermissions;
};

export default withPermissions;
