import { api } from '@/api/api';
import type { AvailableBrandsResponse, Brand } from './types';
import { pickErrorMessage } from '@/utils/request';

export async function getAvailableBrands(): Promise<AvailableBrandsResponse> {
  try {
    const { data } =
      await api.get<AvailableBrandsResponse>('/brands/available');
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить список брендов'),
    );
  }
}

export async function getBrandById(id: string): Promise<Brand> {
  try {
    const { data } = await api.get<Brand>(`/brands/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить данные бренда'),
    );
  }
}
