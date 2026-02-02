import { api } from '@/api/api';
import { Category } from './models';

export async function getAllCategories(): Promise<Category[]> {
    try {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить категории');
    }
}

export async function getCategoryById(id: string): Promise<Category> {
    try {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить категорию');
    }
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать категорию');
    }
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    try {
        const response = await api.put<Category>(`/categories/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить категорию');
    }
}
