import { City } from '../cities/types';
import { UserBasic } from '../user/types';

export type OrderBy = 'date';
export type SortDirection = 'asc' | 'desc';

export type Vacancy = {
  id: string;
  user: UserBasic;
  firstName: string;
  lastName: string | null;
  companyName: string;
  position: string;
  phone: string | null;
  city: City;
  address: string;
  description: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type VacanciesAvailableQuery = {
  cityId?: string;
  orderBy?: OrderBy;
  sortDirection?: SortDirection;
  limit?: number; // default 25 на стороне API
  offset?: number;
};

export type CreateVacancyRequest = {
  firstName: string;
  lastName: string | null;
  position: string;
  phone: string | null;
  cityId: string;
  address: string;
  description: string; // text
  companyName: string;
};

export type UpdateVacancyRequest = CreateVacancyRequest;

export type ActivateVacancyRequest = { id: string };
export type DeleteVacancyRequest = { id: string };
