'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/common/Input/Input';
import { TextArea } from '@/components/common/TextArea/TextArea';
import {
  useAvailableCities,
  useCityCountryOptions,
} from '@/features/cities/hooks';
import { ComboSelect } from '../common/Select/ComboSelect';
import { FileUpload } from '../common/FileUpload/FileUpload';
import { ActivateStatusCheckbox } from '../ActivateStatusCheckbox';
import { useToggleActivateResume } from '@/features/resumes/hooks';
import { toast } from 'sonner';

export interface ResumeFormValues {
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  cityId: string;
  description: string;
}

export type ResumeFormSubmitPayload = {
  newFiles: File[];
  existingUrls: string[];
};

interface ResumeFormProps {
  initialValues?: Partial<ResumeFormValues>;
  onSubmit: (data: ResumeFormValues & ResumeFormSubmitPayload) => void;
  submitLabel?: string;
  loading?: boolean;
  existingUrls?: string[]; // имена файлов или абсолютные урлы с бэка
  maxFiles?: number;
  /** Измени это число после успешного сохранения — форма очистит локальные newFiles */
  resetCounter?: number;
  resumeId?: string;
  isActive?: boolean;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Сохранить',
  loading = false,
  existingUrls = [],
  maxFiles = 5,
  resetCounter = 0,
  resumeId,
  isActive,
}) => {
  const toggleActivate = useToggleActivateResume();

  const handleToggle = async () => {
    if (!resumeId) return;
    try {
      await toggleActivate.mutateAsync({ id: resumeId });
      toast.success('Статус резюме изменён');
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
  } = useForm<ResumeFormValues>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      position: '',
      phone: '',
      cityId: '',
      description: '',
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        cityId: '',
        description: '',
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  const { data: cities, status: citiesStatus } = useAvailableCities();
  const { cityOptionsAll } = useCityCountryOptions(cities);

  const values = watch();
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptExisting, setKeptExisting] = useState<string[]>(existingUrls);
  const prevExistingRef = useRef<string | null>(null);

  const disabled = loading || isSubmitting;

  useEffect(() => {
    const next = existingUrls ?? [];
    const nextJson = JSON.stringify(next);
    if (prevExistingRef.current !== nextJson) {
      setKeptExisting(next);
      prevExistingRef.current = nextJson;
    }
  }, [existingUrls]);

  useEffect(() => {
    setNewFiles([]);
  }, [resetCounter]);

  const hasAnyFiles = keptExisting.length + newFiles.length > 0;

  const allFilled =
    values.firstName?.trim() &&
    values.lastName?.trim() &&
    values.position?.trim() &&
    values.phone?.trim() &&
    values.cityId &&
    values.description?.trim() &&
    hasAnyFiles;

  return (
    <form
      onSubmit={handleSubmit(data =>
        onSubmit({
          ...data,
          newFiles,
          existingUrls: keptExisting,
        }),
      )}
      className='space-y-4'
    >
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
          pattern: { value: /^[0-9+\-()\s]+$/, message: 'Некорректный номер' },
        })}
        value={values.phone}
        error={errors.phone?.message}
        disabled={disabled}
        withAutoScroll
        scrollName='phone'
      />

      <ComboSelect
        placeholder='Город*'
        value={values.cityId}
        options={cityOptionsAll}
        onChange={val => setValue('cityId', val, { shouldValidate: true })}
        error={errors.cityId?.message}
        containerClassName='h-[40px]'
        disabled={disabled || citiesStatus === 'pending'}
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

      <FileUpload
        variant='multiple'
        label='Прикрепить файл(ы)'
        existingUrls={keptExisting}
        onRemoveExisting={idx =>
          setKeptExisting(prev => prev.filter((_, i) => i !== idx))
        }
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={maxFiles}
      />
      {resumeId && (
        <ActivateStatusCheckbox
          checked={isActive}
          loading={toggleActivate.isPending || loading}
          onChange={handleToggle}
        />
      )}

      <button
        type='submit'
        disabled={disabled || !allFilled}
        className='w-full bg-primary-green text-white rounded-md py-2 text-sm disabled:opacity-50 hover:opacity-70 active:opacity-70 transition'
      >
        {isSubmitting ? 'Сохранение…' : submitLabel}
      </button>
    </form>
  );
};
