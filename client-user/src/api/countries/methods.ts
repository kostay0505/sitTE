import { api } from '@/api/api';
import { pickErrorMessage } from '@/utils/request';
import type { Country } from './types';

export async function getAvailableCountries(): Promise<Country[]> {
  try {
    const { data } = await api.get<Country[]>('/countries/available');
    return data;
  } catch (e) {
    throw new Error(pickErrorMessage(e, 'Не удалось получить список стран'));
  }
}
