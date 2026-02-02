import { City } from '../cities/types';
import { UserBasic } from '../user/types';

export type OrderBy = 'date';
export type SortDirection = 'asc' | 'desc';

export type Resume = {
  id: string;
  user: UserBasic;
  firstName: string;
  lastName: string | null;
  position: string;
  phone: string | null;
  city: City;
  description: string;
  files?: string[];
  isActive: boolean;
  updatedAt: string | null;
};

export type ResumesAvailableQuery = {
  cityId?: string;
  orderBy?: OrderBy;
  sortDirection?: SortDirection;
  limit?: number; // default 25 на стороне API
  offset?: number;
};

export type CreateResumeRequest = {
  firstName: string;
  lastName: string | null;
  position: string;
  phone: string | null;
  cityId: string;
  description: string;
  files?: string[];
};

export type UpdateResumeRequest = CreateResumeRequest;

export type ActivateResumeRequest = { id: string };
export type DeleteResumeRequest = { id: string };
