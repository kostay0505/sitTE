import { api } from '@/api/api';
import { Brand } from './models';

export async function getAllBrands(): Promise<Brand[]> {
    try {
        const response = await api.get<Brand[]>('/brands');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить бренды');
    }
}

export async function getBrandById(id: string): Promise<Brand> {
    try {
        const response = await api.get<Brand>(`/brands/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить бренд');
    }
}

export async function createBrand(data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> {
    try {
        const response = await api.post<Brand>('/brands', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать бренд');
    }
}

export async function updateBrand(id: string, data: Partial<Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Brand> {
    try {
        const response = await api.put<Brand>(`/brands/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить бренд');
    }
}
