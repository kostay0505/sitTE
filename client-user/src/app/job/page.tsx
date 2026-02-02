'use client';

import { useMemo, useState } from 'react';
import { Page } from '@/components/Page';
import { Layout } from '@/components/Layout';
import { Select } from '@/components/common/Select/Select';
import { SearchInput } from '@/components/SearchInput';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';
import { useAvailableJobs } from '@/features/jobs/hooks';
import { format } from 'date-fns';

import {
  useAvailableCities,
  useCityCountryOptions,
} from '@/features/cities/hooks';
import { JobDetails, JobItemUI } from '@/components/Job/JobDetails';
import { ComboSelect } from '@/components/common/Select/ComboSelect';
import type { JobType } from '@/api/jobs/types';
import { Resume } from '@/api/resumes/types';
import { Vacancy } from '@/api/vacancies/types';

type SortDir = 'asc' | 'desc' | '';
type KindFilter = '' | 'resume' | 'vacancy';

const mapResumeToJobItem = (r: Resume): JobItemUI => ({
  id: r.id,
  title: r.position,
  city: r.city?.name ?? '',
  contactPerson: [r.firstName, r.lastName].filter(Boolean).join(' '),
  contactPhone: r.phone ?? undefined,
  contactEmail: r.user?.email ?? undefined,
  telegramUsername: r.user?.username ? `${r.user.username}` : undefined,
  description: r.description ?? '',
  date: r.updatedAt ?? undefined,
  files: Array.isArray(r.files) ? r.files : [],
});

const mapVacancyToJobItem = (v: Vacancy): JobItemUI => ({
  id: v.id,
  title: [v.position, v.companyName].filter(Boolean).join(' • '),
  city: v.city?.name ?? '',
  contactPerson: [v.firstName, v.lastName].filter(Boolean).join(' '),
  contactPhone: v.phone ?? undefined,
  contactEmail: v.user?.email ?? undefined,
  telegramUsername: v.user?.username ? `${v.user.username}` : undefined,
  address: v.address ?? '',
  description: v.description ?? '',
  date: v.updatedAt ?? undefined,
  files: [],
});

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [kind, setKind] = useState<KindFilter>(''); // '' = все
  const [sortOrder, setSortOrder] = useState<SortDir>('desc');
  const [openedId, setOpenedId] = useState<string | null>(null);

  // города
  const { data: cities, status: citiesStatus } = useAvailableCities();
  const { cityOptionsAll } = useCityCountryOptions(cities);

  const jobsQ = useAvailableJobs({
    cityId: cityId || undefined,
    searchQuery: search || undefined,
    type: (kind || undefined) as JobType | undefined,
    orderBy: 'date',
    sortDirection: (sortOrder || undefined) as 'asc' | 'desc' | undefined,
    limit: 24,
    offset: 0,
  });

  const isLoading = citiesStatus === 'pending' || jobsQ.isLoading;

  const items: JobItemUI[] = useMemo(() => {
    const list: JobItemUI[] =
      (jobsQ.data ?? []).map(i =>
        i.type === 'resume'
          ? mapResumeToJobItem(i.data)
          : mapVacancyToJobItem(i.data),
      ) ?? [];

    const q = search.trim().toLowerCase();
    return q
      ? list.filter(i =>
          [i.title, i.contactPerson, i.city]
            .filter(Boolean)
            .some(s => String(s).toLowerCase().includes(q)),
        )
      : list;
  }, [jobsQ.data, search]);

  const typeOptions = [
    { label: 'Все', value: '' },
    { label: 'Резюме', value: 'resume' },
    { label: 'Вакансии', value: 'vacancy' },
  ];
  const dateSortOptions = [
    { label: 'Все', value: '' },
    { label: 'Сначала новые', value: 'desc' },
    { label: 'Сначала старые', value: 'asc' },
  ];

  return (
    <Page back={true}>
      <Layout className='p-2 pt-4 flex flex-col gap-5'>
        {/* 🔍 Поиск */}
        <SearchInput value={search} onChange={setSearch} />

        {/* 🔧 Фильтры */}
        <div className='flex flex-wrap gap-2'>
          <ComboSelect
            placeholder='Город'
            value={cityId}
            options={cityOptionsAll}
            onChange={setCityId}
            containerClassName='flex-1 !h-[30px] md:!h-[40px]'
            className='text-[10px] md:text-sm'
            disabled={isLoading || cityOptionsAll.length === 0}
          />
          <Select
            placeholder='Резюме/Вакансии'
            value={kind}
            onChange={val => setKind(val as KindFilter)}
            options={typeOptions}
            containerClassName='flex-1 !h-[30px] md:!h-[40px]'
            className='!pr-5 text-[10px] md:text-sm'
            selectStyle={{ backgroundPosition: 'right 4px center' }}
            disabled={isLoading}
          />
          <Select
            placeholder='По дате'
            value={sortOrder}
            onChange={val => setSortOrder(val as SortDir)}
            options={dateSortOptions}
            containerClassName='w-[150px] !h-[30px] md:!h-[40px]'
            className='!pr-5 text-[10px] md:text-sm'
            selectStyle={{ backgroundPosition: 'right 4px center' }}
            disabled={isLoading}
          />
        </div>

        {/* 📄 Список */}
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={36} />
          ))
        ) : items.length === 0 ? (
          <div className='text-center text-black pt-2'>Ничего не найдено</div>
        ) : (
          items.map(item => {
            const isOpen = openedId === item.id;
            return (
              <div
                key={item.id}
                className='bg-white rounded-xl overflow-hidden md:bg-[#F5F5FA]'
              >
                <button
                  type='button'
                  onClick={() =>
                    setOpenedId(prev => (prev === item.id ? null : item.id))
                  }
                  className='w-full px-4 py-2 text-black text-sm md:text-base flex justify-between items-center text-left'
                >
                  <div className='line-clamp-1'>{item.title}</div>
                  <div className='text-right text-xs md:text-sm'>
                    <div className='line-clamp-1'>{item.city}</div>
                    {item.date && (
                      <div>{format(new Date(item.date), 'dd.MM.yyyy')}</div>
                    )}
                  </div>
                </button>

                {isOpen && <JobDetails job={item as any} />}
              </div>
            );
          })
        )}
      </Layout>
    </Page>
  );
}
