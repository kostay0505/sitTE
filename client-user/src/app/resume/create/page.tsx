'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  ResumeForm,
  type ResumeFormValues,
  type ResumeFormSubmitPayload,
} from '@/components/Resume/ResumeForm';
import { uploadFile } from '@/api/files/methods';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCreateResume } from '@/features/resumes/hooks';
import type { CreateResumeRequest } from '@/api/resumes/types';
import { ROUTES } from '@/config/routes';

export default function CreateResumePage() {
  const create = useCreateResume();
  const router = useRouter();

  const handleSubmit = async (
    data: ResumeFormValues & ResumeFormSubmitPayload,
  ) => {
    try {
      let files: string[] = [];
      if (data.newFiles?.length) {
        const uploaded = await Promise.all(
          data.newFiles.map(async file => {
            const fd = new FormData();
            fd.append('file', file);
            const { filename } = await uploadFile(fd);
            return filename;
          }),
        );
        files = uploaded.filter(Boolean);
      }

      const body: CreateResumeRequest = {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        position: data.position,
        phone: data.phone ?? null,
        cityId: data.cityId,
        description: data.description ?? '',
        ...(files.length ? { files } : {}), // отправляем только если есть
      };

      await create.mutateAsync(body);
      toast.success('Резюме создано');
      router.push(ROUTES.PROFILE);
    } catch (e: any) {
      toast.error(e?.message ?? 'Не удалось создать резюме');
    }
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-4 space-y-4 text-black'>
          <h2 className='text-center text-lg font-medium'>Создать резюме</h2>
          <ResumeForm
            maxFiles={5}
            onSubmit={handleSubmit}
            submitLabel={create.isPending ? 'Создание…' : 'Создать'}
            loading={create.isPending}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
