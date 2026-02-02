import { api } from '@/api/api';
import { cleanParams, pickErrorMessage } from '@/utils/request';
import type {
  Resume,
  ResumesAvailableQuery,
  CreateResumeRequest,
  UpdateResumeRequest,
  ActivateResumeRequest,
  DeleteResumeRequest,
} from './types';

/** GET /resumes/available */
export async function getAvailableResumes(
  query?: ResumesAvailableQuery,
): Promise<Resume[]> {
  try {
    const params = cleanParams(query);
    const { data } = await api.get<Resume[]>('/resumes/available', { params });
    return data;
  } catch (error) {
    throw new Error(
      pickErrorMessage(error, 'Не удалось получить список резюме'),
    );
  }
}

/** GET /resumes/my */
export async function getMyResumes(): Promise<Resume[]> {
  try {
    const { data } = await api.get<Resume[]>('/resumes/my');
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось получить мои резюме'));
  }
}

/** GET /resumes/:id */
export async function getResumeById(id: string): Promise<Resume> {
  try {
    const { data } = await api.get<Resume>(`/resumes/${id}`);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось получить резюме'));
  }
}

/** POST /resumes */
export async function createResume(body: CreateResumeRequest): Promise<Resume> {
  try {
    const { data } = await api.post<Resume>('/resumes', body);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось создать резюме'));
  }
}

/** PUT /resumes (boolean) */
export async function updateResume(
  id: string,
  body: UpdateResumeRequest,
): Promise<boolean> {
  try {
    const { data } = await api.put<boolean>(`/resumes/${id}`, body);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось обновить резюме'));
  }
}

/** PUT /resumes/toggle-activate (boolean) */
export async function toggleActivateResume({
  id,
}: ActivateResumeRequest): Promise<boolean> {
  try {
    const { data } = await api.put<boolean>(`/resumes/toggle-activate/${id}`);
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось активировать резюме'));
  }
}

/** DELETE /resumes (boolean) */
export async function deleteResume(
  body: DeleteResumeRequest,
): Promise<boolean> {
  try {
    const { data } = await api.delete<boolean>('/resumes', { data: body });
    return data;
  } catch (error) {
    throw new Error(pickErrorMessage(error, 'Не удалось удалить резюме'));
  }
}
