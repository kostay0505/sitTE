import { api } from '@/api/api';
import type { City } from './types';
import { pickErrorMessage } from '@/utils/request';

export async function getAvailableCities(): Promise<City[]> {
  try {
    const { data } = await api.get<City[]>('/cities/available');
    return data;
  } catch (error: any) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить список городов'),
    );
  }
}
