import { api } from '@/api/api';

// api/files

export async function uploadFile(formData: FormData): Promise<{ filename: string }> {
  try {
    const response = await api.post<{ filename: string }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Не удалось загрузить файл');
  }
}