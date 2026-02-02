'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getResumeById,
  createResume,
  updateResume,
  getAvailableResumes,
  getMyResumes,
  deleteResume,
  toggleActivateResume,
} from '@/api/resumes/methods';
import type {
  CreateResumeRequest,
  UpdateResumeRequest,
  ResumesAvailableQuery,
  Resume,
  ActivateResumeRequest,
} from '@/api/resumes/types';
import { QK } from '@/lib/queryKeys';

export function useResume(id: string) {
  return useQuery({
    queryKey: QK.resumes.byId(id),
    queryFn: () => getResumeById(id),
    enabled: !!id,
  });
}

export function useResumes(q?: ResumesAvailableQuery) {
  return useQuery({
    queryKey: QK.resumes.available(q ?? {}),
    queryFn: () => getAvailableResumes(q),
  });
}

export function useMyResumes() {
  return useQuery({
    queryKey: QK.resumes.my(),
    queryFn: getMyResumes,
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateResumeRequest) => createResume(body),
    onSuccess: (res: Resume) => {
      qc.invalidateQueries({ queryKey: QK.resumes.available({}) });
      qc.invalidateQueries({ queryKey: QK.resumes.my() });
      qc.invalidateQueries({ queryKey: QK.resumes.byId(res.id) });
    },
  });
}

export function useUpdateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateResumeRequest }) =>
      updateResume(id, body),
    onSuccess: (_ok, vars) => {
      qc.invalidateQueries({ queryKey: QK.resumes.byId(vars.id) });
      qc.invalidateQueries({ queryKey: QK.resumes.my() });
      qc.invalidateQueries({ queryKey: QK.resumes.available({}) });
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResume({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.resumes.my() });
    },
  });
}

export function useToggleActivateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ActivateResumeRequest) => toggleActivateResume(body),
    onSuccess: (_ok, vars) => {
      qc.invalidateQueries({ queryKey: QK.resumes.byId(vars.id) });
      qc.invalidateQueries({ queryKey: QK.resumes.my() });
      qc.invalidateQueries({ queryKey: QK.resumes.available({}) });
    },
  });
}
