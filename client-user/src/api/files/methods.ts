import { api } from '@/api/api';

export async function uploadFile(
  formData: FormData,
): Promise<{ filename: string }> {
  try {
    // Do NOT set Content-Type manually — axios sets it with the correct multipart boundary
    const response = await api.post<{ filename: string }>(
      '/files/upload',
      formData,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Upload failed');
  }
}
