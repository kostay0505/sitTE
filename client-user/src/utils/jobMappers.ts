import { Resume } from '@/api/resumes/types';
import { Vacancy } from '@/api/vacancies/types';
import { JobItemUI } from '@/components/Job/JobDetails';

// резюме -> JobItemUI
export const mapResumeToJobItem = (r: Resume): JobItemUI => ({
  id: r.id,
  title: r.position, // заголовок карточки
  city: r.city?.name ?? '',
  contactPerson: [r.firstName, r.lastName].filter(Boolean).join(' '),
  contactPhone: r.phone ?? undefined,
  contactEmail: r.user?.email ?? undefined,
  telegramUsername: r.user?.username ? `@${r.user.username}` : undefined,
  description: r.description ?? '',
});

// вакансия -> JobItemUI
export const mapVacancyToJobItem = (v: Vacancy): JobItemUI => ({
  id: v.id,
  title: [v.position, v.companyName].filter(Boolean).join(' • '),
  city: v.city?.name ?? '',
  contactPerson: [v.firstName, v.lastName].filter(Boolean).join(' '),
  contactPhone: v.phone ?? undefined,
  contactEmail: v.user?.email ?? undefined,
  telegramUsername: v.user?.username ? `@${v.user.username}` : undefined,
  address: v.address ?? '',
  description: v.description ?? '',
});
