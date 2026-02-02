import { api } from '@/api/api';
import type { ActiveCategoriesResponse } from './types';
import { pickErrorMessage } from '@/utils/request';

export async function getActiveCategories(): Promise<ActiveCategoriesResponse> {
  try {
    const { data } = await api.get<ActiveCategoriesResponse>(
      '/categories/available',
    );
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить список категорий'),
    );
  }
}
