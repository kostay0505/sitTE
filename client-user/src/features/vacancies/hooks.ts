'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  toggleActivateVacancy,
  deleteVacancy,
  getMyVacancies,
} from '@/api/vacancies/methods';
import type {
  VacanciesAvailableQuery,
  Vacancy,
  CreateVacancyRequest,
  UpdateVacancyRequest,
  ActivateVacancyRequest,
} from '@/api/vacancies/types';
import { QK } from '@/lib/queryKeys';

export function useVacancies(q?: VacanciesAvailableQuery) {
  return useQuery({
    queryKey: QK.vacancies.available(q ?? {}),
    queryFn: () => getAvailableVacancies(q),
  });
}

export function useVacancy(id: string) {
  return useQuery({
    queryKey: QK.vacancies.byId(id),
    queryFn: () => getVacancyById(id),
    enabled: !!id,
  });
}

export function useMyVacancies() {
  return useQuery({
    queryKey: QK.vacancies.my(),
    queryFn: getMyVacancies,
  });
}

export function useCreateVacancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVacancyRequest) => createVacancy(body),
    onSuccess: (vac: Vacancy) => {
      qc.invalidateQueries({ queryKey: QK.vacancies.available({}) });
      qc.invalidateQueries({ queryKey: QK.vacancies.my() });
      qc.invalidateQueries({ queryKey: QK.vacancies.byId(vac.id) });
    },
  });
}

export function useUpdateVacancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateVacancyRequest }) =>
      updateVacancy(id, body),
    onSuccess: (_ok, { id }) => {
      qc.invalidateQueries({ queryKey: QK.vacancies.byId(id) });
      qc.invalidateQueries({ queryKey: QK.vacancies.available({}) });
      qc.invalidateQueries({ queryKey: QK.vacancies.my() });
    },
  });
}

export function useToggleActivateVacancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ActivateVacancyRequest) => toggleActivateVacancy(body),
    onSuccess: (_ok, vars) => {
      qc.invalidateQueries({ queryKey: QK.vacancies.byId(vars.id) });
      qc.invalidateQueries({ queryKey: QK.vacancies.available({}) });
      qc.invalidateQueries({ queryKey: QK.vacancies.my() });
    },
  });
}

export function useDeleteVacancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVacancy({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.vacancies.my() });
      qc.invalidateQueries({ queryKey: QK.vacancies.available({}) });
    },
  });
}
