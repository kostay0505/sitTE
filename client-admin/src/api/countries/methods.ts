import { api } from '@/api/api';
import { Country } from './models';

export async function getAllCountries(): Promise<Country[]> {
    try {
        const response = await api.get<Country[]>('/countries');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить страны');
    }
}

export async function getCountryById(id: string): Promise<Country> {
    try {
        const response = await api.get<Country>(`/countries/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить страну');
    }
}

export async function createCountry(data: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Promise<Country> {
    try {
        const response = await api.post<Country>('/countries', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать страну');
    }
}

export async function updateCountry(id: string, data: Partial<Omit<Country, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Country> {
    try {
        const response = await api.put<Country>(`/countries/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить страну');
    }
}
