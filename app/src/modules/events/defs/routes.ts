import { Id } from '@common/defs/types';

const Events = {
  LIST: '/events',
  CREATE: '/events/create',
  DETAILS: (id: Id) => `/events/${id}`,
  EDIT: (id: Id) => `/events/${id}/edit`,
};

export default Events;
