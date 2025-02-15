import { CrudObject } from '@common/defs/types';
import { ROLE } from '@modules/permissions/defs/types';

export interface User extends CrudObject {
  email: string;
  rolesNames: ROLE[];
  permissionsNames: string[];
}
