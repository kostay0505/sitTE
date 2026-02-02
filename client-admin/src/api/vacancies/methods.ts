import { api } from '@/api/api';
import { Vacancy } from './models';

export async function getAllVacancies(): Promise<Vacancy[]> {
    try {
        const response = await api.get<Vacancy[]>('/vacancies');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить вакансии');
    }
}

export async function getVacancyById(id: string): Promise<Vacancy> {
    try {
        const response = await api.get<Vacancy>(`/vacancies/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить вакансию');
    }
}

export async function createVacancy(data: Omit<Vacancy, 'id'>): Promise<Vacancy> {
    try {
        const response = await api.post<Vacancy>('/vacancies/admin', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать вакансию');
    }
}

export async function updateVacancy(id: string, data: Partial<Omit<Vacancy, 'id'>>): Promise<Vacancy> {
    try {
        const response = await api.put<Vacancy>('/vacancies/admin', { id, ...data });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить вакансию');
    }
}
