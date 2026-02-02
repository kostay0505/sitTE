'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  VacancyForm,
  type VacancyFormValues,
} from '@/components/Vacancy/VacancyForm';
import { useVacancy, useUpdateVacancy } from '@/features/vacancies/hooks';
import type { UpdateVacancyRequest } from '@/api/vacancies/types';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditVacancyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vacancy, status } = useVacancy(id);
  const update = useUpdateVacancy();

  const loading = status === 'pending';

  const initialValues: Partial<VacancyFormValues> = vacancy
    ? {
        firstName: vacancy.firstName,
        lastName: vacancy.lastName ?? '',
        companyName: vacancy.companyName ?? '',
        position: vacancy.position,
        phone: vacancy.phone ?? '',
        cityId: vacancy.city?.id ?? '',
        address: vacancy.address,
        description: vacancy.description ?? '',
      }
    : {};

  const handleSubmit = async (data: VacancyFormValues) => {
    if (!id) return;
    try {
      const body: UpdateVacancyRequest = {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        companyName: data.companyName ?? '',
        position: data.position,
        phone: data.phone ?? null,
        cityId: data.cityId,
        address: data.address,
        description: data.description ?? '',
      };
      const ok = await update.mutateAsync({ id, body });
      if (ok) {
        toast.success('Вакансия обновлена');
        // router.push(ROUTES.JOB);
      } else {
        toast.error('Не удалось обновить вакансию');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Ошибка при обновлении вакансии');
    }
  };

  if (status === 'error') {
    return (
      <ProtectedRoute>
        <Page back={true}>
          <Layout className='p-4'>
            <div className='text-center text-red-500'>
              Не удалось загрузить вакансию
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
          <h2 className='text-lg font-medium'>Редактирование вакансии</h2>

          <VacancyForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel={update.isPending ? 'Сохранение…' : 'Сохранить'}
            loading={loading || update.isPending}
            vacanyId={vacancy?.id}
            isActive={vacancy?.isActive}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
