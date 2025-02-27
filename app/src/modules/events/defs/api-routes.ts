import { Id } from '@common/defs/types';

const API_PREFIX = '/api';

const Events = {
  BASE: `${API_PREFIX}/events`,
  LIST: `${API_PREFIX}/events`,
  CREATE: `${API_PREFIX}/events`,
  DETAILS: (id: Id) => `${API_PREFIX}/events/${id}`,
  UPDATE: (id: Id) => `${API_PREFIX}/events/${id}`,
  DELETE: (id: Id) => `${API_PREFIX}/events/${id}`,
  EDIT: (id: Id) => `${API_PREFIX}/events/${id}/edit`,
  REGISTER: (id: Id) => `${API_PREFIX}/events/${id}/register`,
  CANCEL_REGISTRATION: (id: Id) => `${API_PREFIX}/events/${id}/unregister`,
  PARTICIPANTS: (id: Id) => `${API_PREFIX}/events/${id}/participants`,
  UPDATE_PARTICIPANT_STATUS: (eventId: Id, participantId: Id) => 
    `${API_PREFIX}/events/${eventId}/participants/${participantId}`,
  COMMENTS: (id: Id) => `${API_PREFIX}/events/${id}/comments`,
  UPDATE_COMMENT: (eventId: Id, commentId: Id) => `${API_PREFIX}/events/${eventId}/comments/${commentId}`,
  DELETE_COMMENT: (eventId: Id, commentId: Id) => `${API_PREFIX}/events/${eventId}/comments/${commentId}`,
  RATINGS: (id: Id) => `${API_PREFIX}/events/${id}/ratings`,
  UPDATE_RATING: (eventId: Id, ratingId: Id) => `${API_PREFIX}/events/${eventId}/ratings/${ratingId}`,
  DELETE_RATING: (eventId: Id, ratingId: Id) => `${API_PREFIX}/events/${eventId}/ratings/${ratingId}`,
  CATEGORIES: `${API_PREFIX}/events/categories`,
  DASHBOARD: {
    REGISTERED_EVENTS: `${API_PREFIX}/dashboard/registered-events`,
    ORGANIZED_EVENTS: `${API_PREFIX}/dashboard/organized-events`,
    PARTICIPANT_EVENTS: `${API_PREFIX}/dashboard/participant-events`,
    STATISTICS: `${API_PREFIX}/dashboard/statistics`,
    EVENT_PARTICIPANTS: (eventId: Id) => `${API_PREFIX}/dashboard/events/${eventId}/participants`,
    UPCOMING_EVENTS: `${API_PREFIX}/dashboard/upcoming-events`,
    ACTIVITY_SUMMARY: `${API_PREFIX}/dashboard/activity-summary`,
  }
} as const;

export default Events;