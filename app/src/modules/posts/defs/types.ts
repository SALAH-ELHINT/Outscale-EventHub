import { CrudObject, Id } from '@common/defs/types';
import { User } from '@modules/users/defs/types';

export interface Post extends CrudObject {
  title: string;
  content: string;
  userId: Id;
  user: User;
}
