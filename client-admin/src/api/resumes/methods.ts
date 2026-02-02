import { api } from '@/api/api';
import { Resume } from './models';

export async function getAllResumes(): Promise<Resume[]> {
    try {
        const response = await api.get<Resume[]>('/resumes');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить резюме');
    }
}

export async function getResumeById(id: string): Promise<Resume> {
    try {
        const response = await api.get<Resume>(`/resumes/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить резюме');
    }
}

export async function createResume(data: Omit<Resume, 'id'>): Promise<Resume> {
    try {
        const response = await api.post<Resume>('/resumes/admin', data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось создать резюме');
    }
}

export async function updateResume(id: string, data: Partial<Omit<Resume, 'id'>>): Promise<Resume> {
    try {
        const response = await api.put<Resume>(`/resumes/admin/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось обновить резюме');
    }
}
