import { api } from '@/api/api';
import { City } from './models';

export async function getAllCities(): Promise<City[]> {
    try {
        const response = await api.get<City[]>('/cities');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить города');
    }
}
export async function getCityById(id: string): Promise<City> {
    try {
        const response = await api.get<City>(`/cities/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить город');
    }
}

export async function createCity(data: Omit<City, 'id' | 'createdAt' | 'updatedAt'>): Promise<City> {
    try {
        const response = await api.post<City>('/cities', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать город');
    }
}

export async function updateCity(id: string, data: Partial<Omit<City, 'id' | 'createdAt' | 'updatedAt'>>): Promise<City> {
    try {
        const response = await api.put<City>(`/cities/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить город');
    }
}

