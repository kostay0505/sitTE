import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { cn } from '@/utils/cn';
import { ComboSelect } from './common/Select/ComboSelect';

type Option = { label: string; value: string; disabled?: boolean };

interface ProductFiltersProps {
  category: string;
  onCategoryChange: (v: string) => void;
  categoryOptions: Option[];
  subcategory: string;
  onSubcategoryChange: (v: string) => void;
  subcategoryOptions: Option[];
  brandId?: string;
  onBrandChange?: (v: string) => void;
  brandOptions?: Option[];
  brandsLoading?: boolean;
  priceFrom: string;
  onPriceFromChange: (v: string) => void;
  priceTo: string;
  onPriceToChange: (v: string) => void;
  loading?: boolean;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  category,
  onCategoryChange,
  categoryOptions,
  subcategory,
  onSubcategoryChange,
  subcategoryOptions,
  brandId,
  onBrandChange,
  brandOptions,
  brandsLoading,
  priceFrom,
  onPriceFromChange,
  priceTo,
  onPriceToChange,
  loading,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <ComboSelect
        placeholder='Категория'
        value={category}
        options={categoryOptions}
        onChange={onCategoryChange}
        containerClassName='flex-1 !h-[30px] md:!h-[40px]'
        className='text-[10px] md:text-sm'
        disabled={loading || categoryOptions.length === 0}
      />

      <ComboSelect
        placeholder='Подкатегория'
        value={subcategory}
        options={subcategoryOptions}
        onChange={onSubcategoryChange}
        containerClassName='flex-1 !h-[30px] md:!h-[40px]'
        className='text-[10px] md:text-sm'
        disabled={loading || subcategoryOptions.length === 0}
      />

      {!!brandOptions && onBrandChange && (
        <ComboSelect
          placeholder='Бренд'
          value={brandId || ''}
          options={brandOptions}
          onChange={onBrandChange}
          containerClassName='flex-1 !h-[30px] md:!h-[40px]'
          className='text-[10px] md:text-sm'
          disabled={loading || brandsLoading || brandOptions.length === 0}
        />
      )}

      <div className='flex-2 flex border border-[#4D4D4D] rounded-xl bg-white gap-[2px] h-[30px] md:h-[40px] overflow-hidden'>
        <Input
          label='Цена от'
          containerClassName='!border-0 !h-full'
          type='number'
          className='text-[10px] md:text-sm'
          labelClassName='text-[10px] md:text-sm'
          lableFocusedClassName='!text-[5px] md:!text-[9px]'
          value={priceFrom}
          onChange={e => onPriceFromChange(e.target.value)}
          disabled={loading}
        />
        <div className='w-[1px] h-[30px] md:h-[40px] bg-[#4D4D4D]' />
        <Input
          label='Цена до'
          containerClassName='!border-0 !h-full'
          type='number'
          className='text-[10px] md:text-sm'
          labelClassName='text-[10px] md:text-sm'
          lableFocusedClassName='!text-[5px] md:!text-[9px]'
          value={priceTo}
          onChange={e => onPriceToChange(e.target.value)}
          disabled={loading}
        />
      </div>
    </div>
  );
};
