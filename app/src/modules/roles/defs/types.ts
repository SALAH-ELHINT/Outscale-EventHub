import { ROLE } from '@modules/permissions/defs/types';

type RoleCheckWithOperator =
  | { and: RoleCheck[]; or?: never; not?: never }
  | { or: RoleCheck[]; and?: never; not?: never }
  | { not: RoleCheck[]; and?: never; or?: never };

export type RoleCheck = ROLE | ROLE[] | RoleCheckWithOperator;
