import { CrudAppRoutes } from '@common/defs/types';

const prefix = '/users';
const Routes: CrudAppRoutes = {
  ReadAll: prefix,
  Me: prefix + '/me',
  CreateOne: prefix + '/create',
  UpdateOne: prefix + '/{id}',
};

export default Routes;
