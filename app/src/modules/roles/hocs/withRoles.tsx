import React, { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useRoles from '@modules/roles/hooks/useRoles';
import { RoleCheck } from '@modules/roles/defs/types';

interface WithRolesProps {
  requiredRoles: RoleCheck;
  redirectUrl: string;
}

const withRoles = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredRoles, redirectUrl }: WithRolesProps
): ComponentType<P> => {
  const WithRoles: ComponentType<P> = (props: P) => {
    const { hasRole } = useRoles();
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    const evaluateRole = (roleCheck: RoleCheck): boolean => {
      if (typeof roleCheck === 'string') {
        return hasRole(roleCheck);
      }

      const keys = Object.keys(roleCheck);
      if (keys.length !== 1) {
        throw new Error('Only one top-level role logic operator (and, or, not) is allowed.');
      }

      if ('not' in roleCheck) {
        if (roleCheck.not === undefined) {
          return false;
        }

        if (Array.isArray(roleCheck.not)) {
          return roleCheck.not.every((subRoleCheck) => !evaluateRole(subRoleCheck));
        }

        return !evaluateRole(roleCheck.not);
      }

      if ('and' in roleCheck) {
        return roleCheck.and?.every(evaluateRole) ?? false;
      }

      if ('or' in roleCheck) {
        return roleCheck.or?.some(evaluateRole) ?? false;
      }

      return false;
    };

    useEffect(() => {
      const hasRequiredRole = evaluateRole(requiredRoles);
      const currentPath = router.pathname;

      if (!hasRequiredRole && !redirecting) {
        if (currentPath !== redirectUrl) {
          setRedirecting(true);
          router.replace(redirectUrl);
        }
      }
    }, [requiredRoles, redirectUrl, hasRole, redirecting, router]);

    return <WrappedComponent {...props} />;
  };

  WithRoles.displayName = `withRoles(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithRoles;
};

export default withRoles;
