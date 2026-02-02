'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QK } from '@/lib/queryKeys';
import { editUser, getUserData, getUserSeller } from '@/api/user/methods';
import type {
  EditUserDataRequest,
  UserBasic,
  UserDataResponse,
} from '@/api/user/types';
import { toast } from 'sonner';
import { pickErrorMessage } from '@/utils/request';

/** GET /users/me */
export function useUserData(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number; // v5
}) {
  return useQuery<UserDataResponse>({
    queryKey: QK.users.me(),
    queryFn: getUserData,
    staleTime: options?.staleTime ?? 5 * 60_000,
    gcTime: options?.gcTime ?? 10 * 60_000,
    enabled: options?.enabled ?? true,
    // placeholderData: prev => prev, // включи если хочешь держать старые данные на refetch
  });
}

/** PUT /users — редактирование профиля */
export function useEditUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EditUserDataRequest) => editUser(body),
    onSuccess: () => {
      toast.success('Данные профиля сохранены');
      qc.invalidateQueries({ queryKey: QK.users.me() });
    },
    onError: err => {
      toast.error(pickErrorMessage(err, 'Не удалось сохранить изменения'));
    },
  });
}

/** GET /users/seller/:id — данные продавца */
export function useSeller(
  id?: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  },
) {
  return useQuery<UserBasic>({
    enabled: (options?.enabled ?? true) && !!id,
    queryKey: QK.users.seller(id || ''),
    queryFn: () => getUserSeller(id!),
    staleTime: options?.staleTime ?? 5 * 60_000,
    gcTime: options?.gcTime ?? 10 * 60_000,
  });
}
