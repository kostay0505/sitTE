'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import {
  VacancyForm,
  type VacancyFormValues,
} from '@/components/Vacancy/VacancyForm';
import { useCreateVacancy } from '@/features/vacancies/hooks';
import type { CreateVacancyRequest } from '@/api/vacancies/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

export default function CreateVacancyPage() {
  const create = useCreateVacancy();
  const router = useRouter();

  const handleSubmit = async (data: VacancyFormValues) => {
    try {
      const body: CreateVacancyRequest = {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        position: data.position,
        phone: data.phone ?? null,
        cityId: data.cityId,
        address: data.address,
        description: data.description ?? '',
        companyName: data.companyName ?? '',
      };
      await create.mutateAsync(body);
      toast.success('Вакансия создана');
      router.push(ROUTES.PROFILE);
    } catch (e: any) {
      toast.error(e?.message ?? 'Не удалось создать вакансию');
    }
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-4 space-y-4 text-black'>
          <h2 className='text-center text-lg font-medium'>Создать вакансию</h2>
          <VacancyForm
            onSubmit={handleSubmit}
            submitLabel={create.isPending ? 'Создание…' : 'Создать'}
            loading={create.isPending}
          />
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
