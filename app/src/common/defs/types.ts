export type Id = number;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

export interface AnyObject {
  [key: string]: Any;
}

export interface CrudObject extends AnyObject {
  id: Id;
  createdAt: string;
  updatedAt: string;
}

export interface CrudRow extends AnyObject {
  id: Id;
}

export interface CrudAppRoutes {
  ReadAll: string;
  CreateOne: string;
  UpdateOne: string;
  [key: string]: Any;
}

export interface CrudApiRoutes {
  CreateOne: string;
  ReadAll: string;
  ReadOne: string;
  UpdateOne: string;
  DeleteOne: string;
  [key: string]: string;
}

export enum CRUD_ACTION {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface CrudLabels {
  CreateNewOne: string;
  NewOne: string;
  ReadAll: string;
  Items: string;
  EditOne: string;
}

export interface NavGroup {
  text?: string;
  items: NavItem[];
}
export interface NavItem {
  text: string;
  icon: JSX.Element;
  suffix?: {
    tooltip: string;
    icon: JSX.Element;
    link: string;
  };
  routes?: CrudAppRoutes;
  link: string;
  namespace?: string;
  permission?: CRUD_ACTION;
  children?: NavItem[];
}

export interface BaseModel {
  id: Id;
  created_at: string;
  updated_at: string;
}

export interface OrganizedStats {
  total_events: number;
  published_events: number;
  draft_events: number;
  completed_events: number;
  total_participants: number;
}

export interface ParticipationStats {
  total_registrations: number;
  confirmed_registrations: number;
  pending_registrations: number;
  attended_events: number;
}

export interface DashboardStatistics {
  organized: OrganizedStats;
  participation: ParticipationStats;
}

export interface DashboardUpcomingEvents {
  organized_events: Event[];
  registered_events: Event[];
}

export type EventStatus = 'all' | 'draft' | 'published' | 'completed' | 'cancelled';
export type ParticipantStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'attended';

export interface DashboardFilters {
  status: EventStatus;
  search: string;
  participantStatus: ParticipantStatus;
}