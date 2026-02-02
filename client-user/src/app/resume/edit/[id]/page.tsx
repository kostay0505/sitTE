'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  ResumeForm,
  type ResumeFormValues,
  type ResumeFormSubmitPayload,
} from '@/components/Resume/ResumeForm';
import { useResume, useUpdateResume } from '@/features/resumes/hooks';
import { uploadFile } from '@/api/files/methods';
import type { UpdateResumeRequest } from '@/api/resumes/types';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export default function EditResumePage() {
  const { id } = useParams<{ id: string }>();
  const { data: resume, status } = useResume(id);
  const update = useUpdateResume();
  const [resetCounter, setResetCounter] = useState(0);

  const loading = status === 'pending';

  const initialValues: Partial<ResumeFormValues> = resume
    ? {
        firstName: resume.firstName,
        lastName: resume.lastName ?? '',
        position: resume.position,
        phone: resume.phone ?? '',
        cityId: resume.city?.id ?? '',
        description: resume.description ?? '',
      }
    : {};

  const existingUrls: string[] = Array.isArray(resume?.files)
    ? (resume?.files as string[])
    : typeof resume?.files === 'string'
      ? [resume.files as unknown as string]
      : [];

  const handleSubmit = async (
    data: ResumeFormValues & ResumeFormSubmitPayload,
  ) => {
    if (!id) return;
    try {
      let uploadedUrls: string[] = [];
      if (data.newFiles?.length) {
        const uploaded = await Promise.all(
          data.newFiles.map(async file => {
            const fd = new FormData();
            fd.append('file', file);
            const { filename } = await uploadFile(fd);
            return filename;
          }),
        );
        uploadedUrls = uploaded.filter(Boolean);
      }

      const MAX = 5;
      const files = [...data.existingUrls, ...uploadedUrls].slice(0, MAX);

      const body: UpdateResumeRequest = {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        position: data.position,
        phone: data.phone ?? null,
        cityId: data.cityId,
        description: data.description ?? '',
        ...(files.length ? { files } : { files: [] }),
      };

      const ok = await update.mutateAsync({ id, body });
      if (ok) {
        toast.success('Резюме обновлено');
        // Сбрасываем локальные newFiles в форме (и она подхватит новые existingUrls из useResume)
        setResetCounter(prev => prev + 1);
      } else {
        toast.error('Не удалось обновить резюме');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Ошибка при обновлении резюме');
    }
  };

  if (status === 'error') {
    return (
      <ProtectedRoute>
        <Page back={true}>
          <Layout className='p-4'>
            <div className='text-center text-red-500'>
              Не удалось загрузить резюме
            </div>
          </Layout>
        </Page>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-4 space-y-4 text-black'>
          <h2 className='text-center text-lg font-medium'>Изменить резюме</h2>

          <ResumeForm
            maxFiles={5}
            initialValues={initialValues}
            existingUrls={existingUrls}
            resetCounter={resetCounter} // ← важно
            onSubmit={handleSubmit}
            submitLabel={update.isPending ? 'Сохранение…' : 'Сохранить'}
            loading={loading || update.isPending}
            resumeId={resume?.id}
            isActive={resume?.isActive}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
