'use client';

import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { useMyVacancies, useDeleteVacancy } from '@/features/vacancies/hooks';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MyVacanciesPage() {
  const router = useRouter();
  const { data, status } = useMyVacancies();
  const del = useDeleteVacancy();

  const isLoading = status === 'pending';
  const items = data ?? [];

  const onEdit = (id: string) => router.push(`/vacancy/edit/${id}`);
  const onDelete = (id: string) => {
    if (!id) return;
    if (confirm('Удалить вакансию?')) {
      del.mutate(id, {
        onSuccess: () => toast.success('Вакансия удалена'),
        onError: (e: any) =>
          toast.error(e?.message ?? 'Не удалось удалить вакансию'),
      });
    }
  };

  return (
    <ProtectedRoute>
      <Page back={true}>
        <Layout className='p-4 space-y-4 text-black'>
          <h2 className='text-center text-lg font-medium'>Мои вакансии</h2>

          {isLoading && (
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='h-12 rounded-lg bg-white md:bg-[#F5F5FA]'
                />
              ))}
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className='text-center'>Вакансий пока нет</div>
          )}

          <div className='space-y-2'>
            {items.map(v => (
              <div
                key={v.id}
                className='bg-white md:bg-[#F5F5FA] rounded-xl p-3 flex items-center justify-between gap-3'
              >
                <div className='min-w-0'>
                  <div className='text-sm font-medium truncate'>
                    {v.position}
                    {v.companyName ? ` • ${v.companyName}` : ''}
                  </div>
                  <div className='text-xs text-gray-600 truncate'>
                    {v.firstName} {v.lastName ?? ''} • {v.city?.name}
                  </div>
                </div>
                <div className='flex gap-2 shrink-0'>
                  <button
                    className='px-3 py-1 rounded-md bg-black text-white text-xs'
                    onClick={() => onEdit(v.id)}
                  >
                    Редактировать
                  </button>
                  <button
                    className='px-3 py-1 rounded-md bg-white text-black border text-xs'
                    onClick={() => onDelete(v.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Layout>
      </Page>
    </ProtectedRoute>
  );
}
