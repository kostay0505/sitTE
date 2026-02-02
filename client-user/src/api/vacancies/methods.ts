import { api } from '@/api/api';
import { cleanParams, pickErrorMessage } from '@/utils/request';
import type {
  Vacancy,
  VacanciesAvailableQuery,
  CreateVacancyRequest,
  UpdateVacancyRequest,
  ActivateVacancyRequest,
  DeleteVacancyRequest,
} from './types';

/** GET /vacancies/available — список доступных вакансий */
export async function getAvailableVacancies(
  query?: VacanciesAvailableQuery,
): Promise<Vacancy[]> {
  try {
    const params = cleanParams(query);
    const { data } = await api.get<Vacancy[]>('/vacancies/available', {
      params,
    });
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить список вакансий'),
    );
  }
}

export async function getMyVacancies(): Promise<Vacancy[]> {
  try {
    const { data } = await api.get<Vacancy[]>('/vacancies/my');
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить мои вакансии'),
    );
  }
}

/** GET /vacancies/:id — детальная информация о вакансии */
export async function getVacancyById(id: string): Promise<Vacancy> {
  try {
    const { data } = await api.get<Vacancy>(`/vacancies/${id}`);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось получить вакансию'));
  }
}

/** POST /vacancies — создание вакансии */
export async function createVacancy(
  body: CreateVacancyRequest,
): Promise<Vacancy> {
  try {
    const { data } = await api.post<Vacancy>('/vacancies', body);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось создать вакансию'));
  }
}

/** PUT /vacancies — редактирование вакансии (Response: boolean) */
export async function updateVacancy(
  id: string,
  body: UpdateVacancyRequest,
): Promise<boolean> {
  try {
    const { data } = await api.put<boolean>(`/vacancies/${id}`, body);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось обновить вакансию'));
  }
}

/** PUT /vacancies/toggle-activate — активация вакансии (Response: boolean) */
export async function toggleActivateVacancy({
  id,
}: ActivateVacancyRequest): Promise<boolean> {
  try {
    const { data } = await api.put<boolean>(`/vacancies/toggle-activate/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось активировать вакансию'),
    );
  }
}

/** DELETE /vacancies — удаление вакансии (body: { id }) (Response: boolean) */
export async function deleteVacancy(
  body: DeleteVacancyRequest,
): Promise<boolean> {
  try {
    const { data } = await api.delete<boolean>('/vacancies', { data: body });
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось удалить вакансию'));
  }
}
