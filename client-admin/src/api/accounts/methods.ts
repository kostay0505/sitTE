import { unstable_noStore as noStore } from 'next/cache';
import { api } from '@/api/api';
import { Account, CreateAccountDto, UpdateAccountDto, AccountsResponse } from './models';

export async function getAllAccounts(
  page = 1,
  limit = 10,
  search?: string
): Promise<AccountsResponse> {
  noStore();
  try {
    const params: any = { page, limit };
    if (search) params.search = search;

    const response = await api.get<AccountsResponse>(`/accounts`, {
      params
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Не удалось получить список аккаунтов');
  }
}

export async function createAccount(data: CreateAccountDto): Promise<Account> {
  try {
    const response = await api.post<Account>(`/accounts`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Не удалось создать аккаунт');
  }
}

export async function updateAccount(id: string, data: UpdateAccountDto): Promise<Account> {
  try {
    const response = await api.put<Account>(`/accounts/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Не удалось обновить аккаунт');
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    await api.delete(`/accounts/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Не удалось удалить аккаунт');
  }
}

export async function checkLoginExists(login: string): Promise<boolean> {
  try {
    const response = await api.post<{ exists: boolean }>(`/accounts/check-login`, { login });
    return response.data.exists;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Не удалось проверить логин');
  }
} 