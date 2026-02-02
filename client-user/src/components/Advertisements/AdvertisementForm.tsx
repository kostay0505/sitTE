'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { TextArea } from '@/components/common/TextArea/TextArea';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import {
  currencyOptions,
  unitOptions,
} from '@/services/mocks/advertisements/mockAds';
import { useAvailableBrands } from '@/features/brands/hooks';
import { useCategoryFilterOptions } from '@/features/category/hooks';
import { cn } from '@/utils/cn';
import { toImageSrc } from '@/utils/toImageSrc';
import { ComboSelect } from '../common/Select/ComboSelect';
import { ActivateStatusCheckbox } from '../ActivateStatusCheckbox';
import { useToggleActivateProduct } from '@/features/products/hooks';
import { toast } from 'sonner';
import { resolveFormCategoryValues } from '@/utils/category';

type FormValues = {
  title: string;
  description: string;
  priceCash: number | string;
  priceNonCash: number | string;
  currency: string;
  categoryId: string;
  subcategoryId?: string;
  brandId: string;
  quantity: number | string;
  unit: string;
  priceOnRequest: boolean;

  // скрытые поля только для валидации превью
  previewLocal: string;
  previewPresent: string;
};

export type AdvertisementFormValues = Omit<
  FormValues,
  'previewLocal' | 'previewPresent'
>;

interface AdvertisementFormProps {
  productId?: string;
  initialValues?: Partial<AdvertisementFormValues>;
  initialPreviewUrl?: string | null;
  initialFileNames?: string[];
  onSubmit: (
    data: AdvertisementFormValues & {
      files: File[];
      previewFile: File | null;
      keepFileNames: string[];
    },
  ) => Promise<boolean>;
  submitLabel?: string;
  mode?: 'create' | 'edit';
  maxFiles?: number;
  isActive?: boolean;
  loading?: boolean;
  className?: string;
}

export const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  productId,
  initialValues,
  initialPreviewUrl = null,
  initialFileNames,
  onSubmit,
  submitLabel = 'Сохранить',
  mode = 'edit',
  maxFiles = 5,
  isActive,
  loading = false,
  className,
}) => {
  const toggleActivate = useToggleActivateProduct();

  const handleToggle = async () => {
    if (!productId) return;
    try {
      await toggleActivate.mutateAsync({ id: productId });
      toast.success('Статус продукта изменён');
    } catch {
      toast.error('Ошибка при изменении статуса');
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priceCash: '' as any,
      priceNonCash: '' as any,
      currency: '',
      categoryId: '',
      subcategoryId: '',
      brandId: '',
      quantity: 1 as any,
      unit: 'piece',
      priceOnRequest: false,
      previewLocal: '',
      previewPresent: initialPreviewUrl ? '1' : '0',
      ...(initialValues as any),
    },
  });

  // подавляем пересчёты валидации при пост-сабмит очистке
  const suppressValidationRef = useRef(false);

  // ресетим форму ТОЛЬКО при смене товара (productId)
  const prevProductIdRef = useRef<string | undefined>(undefined);

  // категории/подкатегории
  const {
    isLoading: categoriesLoading,
    categoryOptions,
    getSubcategoryOptions,
    all: categories,
  } = useCategoryFilterOptions();

  useEffect(() => {
    if (productId && prevProductIdRef.current !== productId && initialValues) {
      const { categoryId, subcategoryId } = resolveFormCategoryValues(
        initialValues.categoryId,
        categories,
      );

      initialValues.categoryId = categoryId;
      initialValues.subcategoryId = subcategoryId;

      reset({
        title: '',
        description: '',
        priceCash: '' as any,
        priceNonCash: '' as any,
        currency: '',
        categoryId: '',
        subcategoryId: '',
        brandId: '',
        quantity: 1 as any,
        unit: 'piece',
        priceOnRequest: false,
        previewLocal: '',
        previewPresent: initialPreviewUrl ? '1' : '0',
        ...(initialValues as any),
      } as any);
      prevProductIdRef.current = productId;
    }
    // если productId нет (create) — ничего не делаем
  }, [productId, initialValues, initialPreviewUrl, reset, categories]);

  const values = watch();

  const subcategoryOptions = useMemo(
    () => getSubcategoryOptions(values.categoryId || null),
    [getSubcategoryOptions, values.categoryId],
  );

  useEffect(() => {
    if (
      values.subcategoryId &&
      !subcategoryOptions.some(
        o => String(o.value) === String(values.subcategoryId),
      )
    ) {
      setValue('subcategoryId', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [subcategoryOptions, setValue, values.subcategoryId]);

  // бренды
  const brandsQuery = useAvailableBrands();
  const brandOptions = useMemo(
    () => (brandsQuery.data ?? []).map(b => ({ label: b.name, value: b.id })),
    [brandsQuery.data],
  );

  // превью + новые файлы
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // старые fileName (для edit)
  const [keepFileNames, setKeepFileNames] = useState<string[]>(
    initialFileNames ?? [],
  );

  // синхронизируем при реальном изменении пропа
  const prevInitFilesRef = useRef<string | null>(null);
  useEffect(() => {
    const nextJson = initialFileNames ? JSON.stringify(initialFileNames) : null;
    if (prevInitFilesRef.current !== nextJson) {
      setKeepFileNames(initialFileNames ?? []);
      prevInitFilesRef.current = nextJson;
    }
  }, [initialFileNames]);

  const handleReorderExisting = (newOrder: string[]) => {
    setKeepFileNames(newOrder);
  };

  const existingUrls = useMemo(
    () => keepFileNames.map(item => toImageSrc(item)),
    [keepFileNames],
  );

  // наличие превью (локальное или initial)
  useEffect(() => {
    if (suppressValidationRef.current) return;
    if (isSubmitting) return;
    const hasPreview = !!previewFile || !!initialPreviewUrl;
    setValue('previewPresent', hasPreview ? '1' : '0', {
      shouldValidate: true,
    });
  }, [previewFile, initialPreviewUrl, isSubmitting, setValue]);

  // локальные изменения превью
  const handlePreviewChange = (f: File | null) => {
    setPreviewFile(f);
    setValue('previewLocal', f ? f.name : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // локальные файлы (опциональны)
  const handleFilesChange = (next: File[]) => {
    setFiles(next);
  };

  const handleRemoveExisting = (idx: number) => {
    setKeepFileNames(prev => prev.filter((_, i) => i !== idx));
  };

  const disabled = loading || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(
        async ({ previewLocal, previewPresent, ...data }) => {
          const ok = await onSubmit({
            ...(data as AdvertisementFormValues),
            files,
            previewFile,
            keepFileNames,
          });
          if (ok) {
            // отключаем валидацию на время очистки, чтобы не мигали ошибки
            suppressValidationRef.current = true;
            setFiles([]);
            setPreviewFile(null);
            if (!initialPreviewUrl) {
              setValue('previewPresent', '0', { shouldValidate: false });
            }
            requestAnimationFrame(() => {
              suppressValidationRef.current = false;
            });
          }
        },
      )}
      className={cn('space-y-4', className)}
    >
      <Input
        label='Название объявления*'
        {...register('title', { required: 'Обязательное поле' })}
        error={errors.title?.message as string}
        value={values.title}
        disabled={disabled}
        withAutoScroll
        scrollName='title'
      />

      {/* Категория (обяз.) */}
      <input
        type='hidden'
        {...register('categoryId', { required: 'Обязательное поле' })}
        value={values.categoryId}
      />
      <ComboSelect
        placeholder='Категория*'
        value={values.categoryId}
        options={categoryOptions}
        onChange={val => {
          setValue('categoryId', val, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setValue('subcategoryId', '', {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        error={errors.categoryId?.message as string}
        containerClassName='h-[40px]'
        disabled={disabled || categoriesLoading}
      />

      {/* Подкатегория (необяз.) */}
      <ComboSelect
        placeholder='Подкатегория'
        value={values.subcategoryId || ''}
        options={subcategoryOptions}
        onChange={val =>
          setValue('subcategoryId', val, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        containerClassName='h-[40px]'
        disabled={disabled || categoriesLoading || !values.categoryId}
      />

      {/* Бренд (обяз.) */}
      <input
        type='hidden'
        {...register('brandId', { required: 'Обязательное поле' })}
        value={values.brandId}
      />

      <ComboSelect
        placeholder='Бренд*'
        value={values.brandId}
        options={brandOptions}
        onChange={val =>
          setValue('brandId', val, { shouldDirty: true, shouldValidate: true })
        }
        error={errors.brandId?.message as string}
        containerClassName='h-[40px]'
        disabled={disabled || brandsQuery.status === 'pending'}
      />

      <div className='flex gap-2'>
        <Input
          label='Количество*'
          type='number'
          {...register('quantity', {
            required: 'Обязательное поле',
            validate: v => (Number(v) >= 1 ? true : 'Минимум 1'),
          })}
          containerClassName='flex-1'
          value={values.quantity}
          error={errors.quantity?.message as string}
          disabled={disabled}
          withAutoScroll
          scrollName='quantity'
        />
        {/* Ед.изм (обяз.) */}
        <input
          type='hidden'
          {...register('unit', { required: 'Обязательное поле' })}
          value={values.unit}
        />
        <Select
          placeholder='шт / комп*'
          options={unitOptions}
          value={values.unit}
          onChange={val =>
            setValue('unit', val, { shouldDirty: true, shouldValidate: true })
          }
          error={errors.unit?.message as string}
          containerClassName='w-[140px]'
          disabled={disabled}
        />
      </div>

      <TextArea
        label='Описание*'
        {...register('description', { required: 'Обязательное поле' })}
        className='h-24 resize-none'
        value={values.description}
        error={errors.description?.message as string}
        disabled={disabled}
        withAutoScroll
        scrollName='description'
      />

      <div className='flex gap-2'>
        <Input
          label='Цена (наличные)*'
          type='number'
          {...register('priceCash', {
            required: 'Обязательное поле',
            validate: v => (Number(v) >= 0 ? true : 'Должно быть >= 0'),
          })}
          containerClassName='flex-1'
          value={values.priceCash}
          error={errors.priceCash?.message as string}
          disabled={disabled || values.priceOnRequest}
          withAutoScroll
          scrollName='priceCash'
        />
        {/* Валюта (обяз.) */}
        <input
          type='hidden'
          {...register('currency', { required: values.priceOnRequest ? false : 'Обязательное поле' })}
          value={values.currency}
        />
        <Select
          placeholder='Валюта*'
          options={currencyOptions}
          value={values.currency}
          onChange={val =>
            setValue('currency', val, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          error={errors.currency?.message as string}
          containerClassName='w-[140px]'
          className='text-sm'
          disabled={disabled || values.priceOnRequest}
        />
      </div>

      <Input
        label='Цена (безнал)*'
        type='number'
        {...register('priceNonCash', {
          required: 'Обязательное поле',
          validate: v => (Number(v) >= 0 ? true : 'Должно быть >= 0'),
        })}
        containerClassName='flex-1'
        value={values.priceNonCash}
        error={errors.priceNonCash?.message as string}
        disabled={disabled || values.priceOnRequest}
        withAutoScroll
        scrollName='priceNonCash'
      />

      {/* Чек-бокс "Цена по запросу" */}
      <div className='flex items-center gap-2'>
        <input
          type='checkbox'
          id='priceOnRequest'
          {...register('priceOnRequest')}
          checked={values.priceOnRequest}
          onChange={e => {
            const checked = e.target.checked;
            setValue('priceOnRequest', checked, {
              shouldDirty: true,
              shouldValidate: true,
            });
            if (checked) {
              setValue('priceCash', 0, { shouldDirty: true, shouldValidate: true });
              setValue('priceNonCash', 0, { shouldDirty: true, shouldValidate: true });
            }
          }}
          disabled={disabled}
          className='w-4 h-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green focus:ring-2'
        />
        <label htmlFor='priceOnRequest' className='text-sm text-gray-700 cursor-pointer'>
          Цена по запросу
        </label>
      </div>

      {/* Превью (обязательное) */}
      <input
        type='hidden'
        {...register('previewPresent', {
          validate: v => (v === '1' ? true : 'Добавьте обложку (превью)'),
        })}
        value={values.previewPresent}
      />
      {/* Доп. правило для create */}
      <input
        type='hidden'
        {...register(
          'previewLocal',
          mode === 'create' ? { required: 'Добавьте обложку (превью)' } : {},
        )}
        value={values.previewLocal}
      />
      <FileUpload
        variant='single'
        label={`Обложка (превью)${mode === 'create' ? '*' : ''}`}
        file={previewFile}
        initialUrl={initialPreviewUrl || undefined}
        onFileChange={handlePreviewChange}
        accept='image/*,.webp,.png,.jpg,.jpeg'
        error={
          (errors.previewPresent?.message as string) ||
          (errors.previewLocal?.message as string)
        }
        withAutoScroll
        scrollName='previewLocal'
      />

      <FileUpload
        variant='multiple'
        label='Добавить фотографии и видео'
        existingUrls={existingUrls}
        onRemoveExisting={handleRemoveExisting}
        onReorderExisting={handleReorderExisting}
        files={files}
        onFilesChange={handleFilesChange}
        maxFiles={maxFiles}
        accept='image/*,.webp,.png,.jpg,.jpeg,.gif,.svg,.bmp,.avif,video/*,.mp4,.webm,.ogg,.mov,.avi,.wmv,.flv,.mkv'
        enableDragAndDrop
      />

      {productId && (
        <ActivateStatusCheckbox
          checked={isActive}
          loading={toggleActivate.isPending || loading}
          onChange={handleToggle}
        />
      )}

      <button
        type='submit'
        disabled={disabled || !isValid}
        className='w-full bg-primary-green text-white text-sm rounded-md py-2 disabled:opacity-50 hover:opacity-70 active:opacity-70 transition'
      >
        {isSubmitting ? 'Сохранение…' : submitLabel}
      </button>
    </form>
  );
};
