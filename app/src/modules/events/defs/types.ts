import { BaseModel, Id } from '@common/defs/types';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type ParticipantStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';

export interface EventCategory {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  pivot?: {
    eventId: number;
    categoryId: number;
  };
}

export interface EventDateInfo {
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface EventParticipation {
  current: number;
  maximum: number;
  isFull: boolean;
  availabilityPercentage: number;
}

export interface EventOrganizer {
  id: number;
  email: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rolesNames: string[];
  permissionsNames: string[];
}

export interface UserRating {
  id: number;
  eventId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: EventOrganizer;
}

export interface EventRatings {
  average: number;
  count: number;
  userRating: UserRating | null;
}

export interface EventComment {
  id: number;
  content: string;
  user: EventOrganizer;
  createdAt: string;
}

export interface EventComments {
  recent: EventComment[];
  userComments: EventComment[];
}

export interface EventEngagement {
  ratings: EventRatings;
  comments: EventComments;
}

export interface ConfirmedParticipant {
  id: number;
  user: EventOrganizer;
  status: ParticipantStatus;
  registrationDate: string;
}

export interface EventTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface EventPermissions {
  canComment: boolean;
  canRate: boolean;
  canEdit: boolean;
  canManageParticipants: boolean;
}

export interface UserInteraction {
  registrationStatus?: ParticipantStatus | null;
  isRegistered: boolean;
  isOrganizer: boolean;
  hasRated: boolean;
}

export interface Event extends BaseModel {
  title: string;
  description: string;
  location: string;
  dateInfo: EventDateInfo;
  participation: EventParticipation;
  status: EventStatus;
  organizer: EventOrganizer;
  image: string | null;
  categories: EventCategory[];
  engagement?: EventEngagement;
  confirmedParticipants?: ConfirmedParticipant[];
  timestamps?: EventTimestamps;
  permissions: EventPermissions;
  userInteraction: UserInteraction;
}

export interface EventParticipant extends BaseModel {
  event_id: Id;
  user_id: Id;
  status: ParticipantStatus;
  registration_date: string;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  totalItems: number;
}

export interface EventListResponse {
  success: boolean;
  data: {
    items: Event[];
    meta: PaginationMeta;
  };
}

export interface EventDetailsResponse {
  success: boolean;
  data: {
    item: Event;
  };
}

export interface AddCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AddRatingRequest {
  rating: number;
  comment?: string;
}

export interface UpdateRatingRequest {
  rating: number;
  comment?: string;
}

export interface UpdateParticipantStatusRequest {
  status: ParticipantStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ItemResponse<T> {
  item: T;
}

export interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface CommentResponse {
  comment: EventComment;
}

export interface RatingResponse {
  rating: UserRating;
}