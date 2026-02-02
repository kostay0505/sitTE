'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/common/Input/Input';
import { TextArea } from '@/components/common/TextArea/TextArea';
import {
  useAvailableCities,
  useCityCountryOptions,
} from '@/features/cities/hooks';
import { ComboSelect } from '../common/Select/ComboSelect';
import { useToggleActivateVacancy } from '@/features/vacancies/hooks';
import { toast } from 'sonner';
import { ActivateStatusCheckbox } from '../ActivateStatusCheckbox';

export interface VacancyFormValues {
  firstName: string;
  lastName: string;
  companyName: string;
  position: string;
  phone: string;
  cityId: string; // UUID
  address: string;
  description: string;
}

interface VacancyFormProps {
  initialValues?: Partial<VacancyFormValues>;
  onSubmit: (data: VacancyFormValues) => void;
  submitLabel?: string;
  loading?: boolean;
  vacanyId?: string;
  isActive?: boolean;
}

export const VacancyForm: React.FC<VacancyFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Сохранить',
  loading = false,
  vacanyId,
  isActive,
}) => {
  const toggleActivate = useToggleActivateVacancy();

  const handleToggle = async () => {
    if (!vacanyId) return;

    try {
      await toggleActivate.mutateAsync({ id: vacanyId });
      toast.success('Статус вакансии изменён');
    } catch {
      toast.error('Ошибка при изменении статуса');
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<VacancyFormValues>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      position: '',
      phone: '',
      cityId: '',
      address: '',
      description: '',
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) reset({ ...initialValues });
  }, [initialValues, reset]);

  const { data: cities, status: citiesStatus } = useAvailableCities();
  const { cityOptionsAll } = useCityCountryOptions(cities);

  const values = watch();
  const disabled = loading || isSubmitting;

  const allFilled =
    values.firstName?.trim() &&
    values.lastName?.trim() &&
    values.companyName?.trim() &&
    values.position?.trim() &&
    values.phone?.trim() &&
    values.cityId &&
    values.address?.trim();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Input
        label='Имя контактного лица*'
        {...register('firstName', { required: 'Обязательное поле' })}
        value={values.firstName}
        error={errors.firstName?.message}
        disabled={disabled}
        withAutoScroll
        scrollName='firstName'
      />

      <Input
        label='Фамилия контактного лица*'
        {...register('lastName', { required: 'Обязательное поле' })}
        value={values.lastName}
        error={errors.lastName?.message}
        disabled={disabled}
      />

      <Input
        label='Компания*'
        {...register('companyName', { required: 'Обязательное поле' })}
        value={values.companyName}
        error={errors.companyName?.message}
        disabled={disabled}
        withAutoScroll
        scrollName='companyName'
      />

      <Input
        label='Должность*'
        {...register('position', { required: 'Обязательное поле' })}
        value={values.position}
        error={errors.position?.message}
        disabled={disabled}
      />

      <Input
        label='Контактный телефон*'
        {...register('phone', {
          required: 'Обязательное поле',
          pattern: {
            value: /^[0-9+\-()\s]+$/,
            message: 'Некорректный номер',
          },
        })}
        value={values.phone}
        error={errors.phone?.message}
        disabled={disabled}
      />

      <ComboSelect
        placeholder='Город*'
        value={values.cityId}
        options={cityOptionsAll}
        onChange={val => setValue('cityId', val, { shouldValidate: true })}
        error={errors.cityId?.message}
        containerClassName='h-[40px]'
        disabled={disabled || citiesStatus === 'pending'}
        withAutoScroll
        scrollName='cityId'
      />

      <Input
        label='Адрес*'
        {...register('address', { required: 'Обязательное поле' })}
        value={values.address}
        error={errors.address?.message}
        disabled={disabled}
        withAutoScroll
        scrollName='address'
      />

      <TextArea
        label='Описание*'
        {...register('description', { required: 'Обязательное поле' })}
        value={values.description}
        error={errors.description?.message}
        disabled={disabled}
        className='h-24 resize-none'
        withAutoScroll
        scrollName='description'
      />

      {vacanyId && (
        <ActivateStatusCheckbox
          checked={isActive}
          loading={toggleActivate.isPending || loading}
          onChange={handleToggle}
        />
      )}

      <button
        type='submit'
        className='w-full bg-primary-green text-white text-sm rounded-md py-2 disabled:opacity-50 hover:opacity-70 active:opacity-70 transition'
        disabled={disabled || !allFilled}
      >
        {isSubmitting ? 'Сохранение…' : submitLabel}
      </button>
    </form>
  );
};
