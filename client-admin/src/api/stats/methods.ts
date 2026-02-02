import { api } from '@/api/api';
import { Stats } from './models';

export async function getStats(): Promise<Stats> {
    try {
        const response = await api.get<Stats>('/stats');
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Не удалось загрузить статистику');
    }
}
