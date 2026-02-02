import { Resume } from '../resumes/types';
import { Vacancy } from '../vacancies/types';

export type JobType = 'resume' | 'vacancy';
export type OrderBy = 'date';
export type SortDirection = 'asc' | 'desc';

export type JobsAvailableRequest = {
  userId?: string;
  cityId?: string;
  searchQuery?: string;
  type?: JobType;
  orderBy?: OrderBy; // 'date'
  sortDirection?: SortDirection; // 'asc' | 'desc'
  limit?: number; // default 25
  offset?: number; // for paging
};

export type JobsAvailableItem =
  | { type: 'resume'; data: Resume }
  | { type: 'vacancy'; data: Vacancy };
