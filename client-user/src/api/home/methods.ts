import { api } from '@/api/api';
import type { HomeProductCard, HomeCategory, HomeBrand } from './types';

export async function getHomeCategories(): Promise<HomeCategory[]> {
  const { data } = await api.get<HomeCategory[]>('/home/categories');
  return data;
}

export async function getTouringExpertProducts(
  categoryId?: string,
  limit = 12,
): Promise<HomeProductCard[]> {
  const { data } = await api.get<HomeProductCard[]>('/home/touring-expert', {
    params: { categoryId, limit },
  });
  return data;
}

export async function getBestsellers(
  categoryId?: string,
  limit = 12,
): Promise<HomeProductCard[]> {
  const { data } = await api.get<HomeProductCard[]>('/home/bestsellers', {
    params: { categoryId, limit },
  });
  return data;
}

export async function getFeaturedBrands(
  categoryId?: string,
  limit = 12,
): Promise<HomeBrand[]> {
  const { data } = await api.get<HomeBrand[]>('/home/brands', {
    params: { categoryId, limit },
  });
  return data;
}
