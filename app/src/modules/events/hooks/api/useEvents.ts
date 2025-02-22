import { CrudApiRoutes } from '@common/defs/types';
import useApi, { FetchApiOptions } from '@common/hooks/useApi';
import type { UseItems, UseItemsHook } from '@common/hooks/useItems';
import useItems from '@common/hooks/useItems';
import Events from '@modules/events/defs/api-routes';
import { Event } from '@modules/events/defs/types';
import { useCallback } from 'react';

interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  status: string;
  image_id?: number;
}

interface UpdateEventInput extends CreateEventInput {
  current_participants?: number;
}

interface EventsHook extends UseItemsHook<Event, CreateEventInput, UpdateEventInput> {
  CreateOne: (data: CreateEventInput, options?: any) => Promise<any>;
  DeleteOne: (id: number, options?: FetchApiOptions) => Promise<any>;
  register: (eventId: number) => Promise<any>;
  cancelRegistration: (eventId: number) => Promise<any>;
  addComment: (eventId: number, content: string, options?: FetchApiOptions) => Promise<any>;
  updateComment: (eventId: number, commentId: number, content: string, options?: FetchApiOptions) => Promise<any>;
  deleteComment: (eventId: number, commentId: number, options?: FetchApiOptions) => Promise<any>;
  addRating: (eventId: number, rating: number, comment?: string, options?: FetchApiOptions) => Promise<any>;
  updateRating: (eventId: number, rating: number, ratingId: number, comment?: string, options?: FetchApiOptions) => Promise<any>;
  deleteRating: (eventId: number, ratingId: number, options?: FetchApiOptions) => Promise<any>;
  updateParticipantStatus: (eventId: number, participantId: number, status: string, options?: FetchApiOptions) => Promise<any>;
  getParticipants: (eventId: number, options?: FetchApiOptions) => Promise<any>;
  categories: () => Promise<any>;
  getRegisteredEvents: (options?: FetchApiOptions) => Promise<any>;
  getOrganizedEvents: (options?: FetchApiOptions) => Promise<any>;
  getEventStatistics: (options?: FetchApiOptions) => Promise<any>;
  getDashboardEventParticipants: (eventId: number, options?: FetchApiOptions) => Promise<any>;
  getUpcomingEvents: (options?: FetchApiOptions) => Promise<any>;
}

interface AddCommentRequest {
  content: string;
}

interface UpdateCommentRequest {
  content: string;
}

interface AddRatingRequest {
  rating: number;
  comment?: string;
}

interface UpdateRatingRequest {
  rating: number;
  comment?: string;
}


const useEvents = (opts?: Parameters<UseItems<Event, CreateEventInput, UpdateEventInput>>[0]): EventsHook => {
  const fetchApi = useApi();

  const apiRoutes: CrudApiRoutes = {
    CreateOne: Events.CREATE,
    ReadAll: Events.LIST,
    ReadOne: Events.DETAILS('{id}' as any),
    UpdateOne: Events.UPDATE('{id}' as any),
    DeleteOne: Events.DELETE('{id}' as any),
    Unregister: Events.CANCEL_REGISTRATION('{id}' as any),
    Register: Events.REGISTER('{id}' as any)
  };

  const itemsHook = useItems<Event, CreateEventInput, UpdateEventInput>(apiRoutes, opts);

  const CreateOne = useCallback(async (data: CreateEventInput, options?: any) => {
    return fetchApi(Events.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
  }, [fetchApi]);

  const DeleteOne = useCallback(async (id: number, options?: FetchApiOptions) => {
    return fetchApi(Events.DELETE(id), {
      method: 'DELETE',
      displaySuccess: true,
      ...options,
    });
  }, [fetchApi]);

  const register = useCallback(async (eventId: number) => {
    return fetchApi(Events.REGISTER(eventId), {
      method: 'POST',
      displaySuccess: true
    });
  }, [fetchApi]);

  const cancelRegistration = useCallback(async (eventId: number) => {
    return fetchApi(Events.CANCEL_REGISTRATION(eventId), {
      method: 'POST',
      displaySuccess: true
    });
  }, [fetchApi]);

  const addComment = useCallback(async (eventId: number, content: string, options?: FetchApiOptions) => {
    const data: AddCommentRequest = { content };
    return fetchApi(Events.COMMENTS(eventId), {
      method: 'POST',
      displaySuccess: true,
      data,
      ...options,
    });
  }, [fetchApi]);

  const updateComment = useCallback(async (
    eventId: number,
    commentId: number,
    content: string,
    options?: FetchApiOptions
  ) => {
    const data: UpdateCommentRequest = { content };
    return fetchApi(Events.UPDATE_COMMENT(eventId, commentId), {
      method: 'PUT',
      displaySuccess: true,
      data,
      ...options,
    });
  }, [fetchApi]);

  const deleteComment = useCallback(async (
    eventId: number,
    commentId: number,
    options?: FetchApiOptions
  ) => {
    return fetchApi(Events.DELETE_COMMENT(eventId, commentId), {
      method: 'DELETE',
      displaySuccess: true,
      ...options,
    });
  }, [fetchApi]);

  const addRating = useCallback(async (
    eventId: number,
    rating: number,
    comment?: string,
    options?: FetchApiOptions
  ) => {
    const data: AddRatingRequest = { rating, comment };
    return fetchApi(Events.RATINGS(eventId), {
      method: 'POST',
      displaySuccess: true,
      data,
      ...options,
    });
  }, [fetchApi]);

  const updateRating = useCallback(async (
    eventId: number,
    rating: number,
    ratingId: number,
    comment?: string,
    options?: FetchApiOptions
  ) => {
    const data: UpdateRatingRequest = { rating, comment };
    return fetchApi(Events.UPDATE_RATING(eventId, ratingId), {
      method: 'PUT',
      displaySuccess: true,
      data,
      ...options,
    });
  }, [fetchApi]);

  const deleteRating = useCallback(async (eventId: number, ratingId: number, options?: FetchApiOptions) => {
    return fetchApi(Events.DELETE_RATING(eventId, ratingId), {
      method: 'DELETE',
      displaySuccess: true,
      ...options,
    });
  }, [fetchApi]);

  const updateParticipantStatus = useCallback(async (
    eventId: number,
    participantId: number,
    status: string,
    options?: FetchApiOptions
  ) => {
    return fetchApi(Events.UPDATE_PARTICIPANT_STATUS(eventId, participantId), {
      method: 'PUT',
      displaySuccess: true,
      data: { status },
      ...options,
    });
  }, [fetchApi]);

  const getParticipants = useCallback(async (eventId: number, options?: FetchApiOptions) => {
    return fetchApi(Events.PARTICIPANTS(eventId), {
      method: 'GET',
      displaySuccess: true,
      ...options,
    });
  }, [fetchApi]);

  const categories = useCallback(async () => {
    return fetchApi(Events.CATEGORIES, {
      method: 'GET',
      displaySuccess: true,
    });
  }, [fetchApi]);

  const getRegisteredEvents = useCallback(async (options?: FetchApiOptions) => {
    return fetchApi(Events.DASHBOARD.REGISTERED_EVENTS, {
      method: 'GET',
      ...options,
    });
  }, [fetchApi]);

  const getOrganizedEvents = useCallback(async (options?: FetchApiOptions) => {
    return fetchApi(Events.DASHBOARD.ORGANIZED_EVENTS, {
      method: 'GET',
      ...options,
    });
  }, [fetchApi]);

  const getEventStatistics = useCallback(async (options?: FetchApiOptions) => {
    return fetchApi(Events.DASHBOARD.STATISTICS, {
      method: 'GET',
      ...options,
    });
  }, [fetchApi]);

  const getDashboardEventParticipants = useCallback(async (eventId: number, options?: FetchApiOptions) => {
    return fetchApi(Events.DASHBOARD.EVENT_PARTICIPANTS(eventId), {
      method: 'GET',
      ...options,
    });
  }, [fetchApi]);

  const getUpcomingEvents = useCallback(async (options?: FetchApiOptions) => {
    return fetchApi(Events.DASHBOARD.UPCOMING_EVENTS, {
      method: 'GET',
      ...options,
    });
  }, [fetchApi]);

  return {
    ...itemsHook,
    CreateOne,
    DeleteOne,
    register,
    cancelRegistration,
    addComment,
    updateComment,
    deleteComment,
    addRating,
    updateRating,
    deleteRating,
    updateParticipantStatus,
    getParticipants,
    categories,
    getRegisteredEvents,
    getOrganizedEvents,
    getEventStatistics,
    getDashboardEventParticipants,
    getUpcomingEvents,
  };
};

export default useEvents;