import { api } from '../api';
import { AdminLoginDto, AdminLoginResponse, AdminRefreshResponse } from './types';

export async function adminLogin(dto: AdminLoginDto): Promise<AdminLoginResponse> {
    try {
        const response = await api.post<AdminLoginResponse>('/auth/admin/login', dto);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Ошибка при авторизации');
    }
}

export async function adminRefreshToken(): Promise<AdminRefreshResponse> {
    try {
        const response = await api.post<AdminRefreshResponse>('/auth/admin/refresh');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Ошибка при обновлении токенов');
    }
}

export async function adminLogout(): Promise<{ message: string }> {
    try {
        const response = await api.post<{ message: string }>('/auth/admin/logout');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Ошибка при выходе');
    }
} 