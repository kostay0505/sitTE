import { api } from '@/api/api';

export async function getSiteContentAll(): Promise<Record<string, any>> {
  const { data } = await api.get<Record<string, any>>('/site-content');
  return data;
}

export async function getSiteContentKey(key: string): Promise<any> {
  const { data } = await api.get(`/site-content/${key}`);
  return data;
}
