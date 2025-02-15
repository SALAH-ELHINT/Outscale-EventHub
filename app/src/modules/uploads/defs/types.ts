import { CrudObject } from '@common/defs/types';

export interface Upload extends CrudObject {
  name?: string;
  path: string;
}
