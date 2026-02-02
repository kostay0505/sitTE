'use client';

import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';

interface BrandSelectProps {
  value: string;
  customBrand: string;
  error?: string;
  customBrandError?: string;
  setValue: (field: string, value: any) => void;
  register: any;
}

export const BrandSelect: React.FC<BrandSelectProps> = ({
  value,
  customBrand,
  error,
  customBrandError,
  setValue,
  register,
}) => (
  <div className='space-y-1'>
    <Select
      placeholder='Бренд'
      options={[]}
      value={value}
      onChange={val => setValue('brand', val)}
      className='!h-[40px]'
    />
    <p className='text-[10px] text-gray-600'>
      Если вы не нашли подходящий бренд или модель, выберите “другое” и впишите
      новый бренд, мы добавим его при модерации объявления
    </p>
    {value === 'other' && (
      <Input
        label='Название бренда'
        {...register('customBrand', { required: 'Введите название бренда' })}
        error={customBrandError}
        value={customBrand}
      />
    )}
    {error && <span className='text-red-400 text-xs'>{error}</span>}
  </div>
);
