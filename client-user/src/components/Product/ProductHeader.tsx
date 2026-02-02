'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import { Skeleton } from '../common/Skeleton/Skeleton';
import { ROUTES } from '@/config/routes';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Product } from '@/api/products/types';
import { formatCurrencyNumber, getCurrencySymbol } from '@/utils/currency';
import { toImageSrc } from '@/utils/toImageSrc';
import { ShareIcon } from '../common/SvgIcon';
import { Link } from '@/components/Link/Link';
import { ContactModal } from './ContactModal';

interface Props {
  product?: Product;
  className?: string;
  isLoading?: boolean;
  isOpen?: boolean;
  setIsOpen?: () => void;
}

const unitShort = (t?: Product['quantityType']) =>
  t === 'piece' ? 'шт.' : t === 'set' ? 'компл.' : (t ?? '');

export const ProductHeader: FC<Props> = ({
  product,
  className,
  isLoading,
  isOpen,
  setIsOpen,
}) => {
  const [steps, setSteps] = useState(1);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Лимит на добавление штук/комплектов (quantity теперь лимит)
  const maxQty = useMemo(
    () => Math.max(1, Number(product?.quantity ?? 1)),
    [product?.quantity],
  );

  // Клампим текущее значение при смене товара/лимита
  useEffect(() => {
    setSteps(prev => Math.min(Math.max(1, prev), maxQty));
  }, [maxQty]);

  // Цена за 1 единицу
  const priceCashPerUnit = useMemo(
    () => Number(product?.priceCash ?? 0),
    [product?.priceCash],
  );
  const priceNonCashPerUnit = useMemo(
    () => Number(product?.priceNonCash ?? 0),
    [product?.priceNonCash],
  );

  const currency = product?.currency;

  // Итоги (шаг = 1, значит totalUnits === steps)
  const totalUnits = steps;
  const totalCash = steps * priceCashPerUnit;
  const totalNonCash = steps * priceNonCashPerUnit;

  const increment = () => setSteps(prev => (prev < maxQty ? prev + 1 : prev));
  const decrement = () => setSteps(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className='flex justify-between md:items-start'>
      <div className={cn('w-full flex flex-col gap-2', className)}>
        {/* Название */}
        {isLoading ? (
          <Skeleton height={'28px'} />
        ) : (
          <div className='flex justify-between'>
            <div className='text-xl font-bold text-black'>{product?.name}</div>
            <button
              type='button'
              onClick={setIsOpen}
              className=' max-w-7 max-h-7 cursor-pointer hover:opacity-75 ease-in-out'
            >
              <ShareIcon width={24} height={24} />
            </button>
          </div>
        )}

        <div className='flex justify-between items-end'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              {/* Итоговая цена за выбранное кол-во */}
              {isLoading ? (
                <>
                  <Skeleton height={'24px'} />
                  <Skeleton height={'15px'} />
                </>
              ) : Number(product?.priceCash) === 0 ? (
                <div className='text-normal text-black'>Цена по запросу</div>
              ) : (
                <>
                  <div className='text-normal text-black'>
                    {getCurrencySymbol(currency)}{' '}
                    {formatCurrencyNumber(totalCash)} Наличными
                  </div>
                  <div className='text-[10px] text-black'>
                    {getCurrencySymbol(currency)}{' '}
                    {formatCurrencyNumber(totalNonCash)} Безналичный расчёт
                  </div>
                </>
              )}
            </div>

            {/* Продавец */}
            {isLoading ? (
              <Skeleton height={'24px'} />
            ) : (
              <div className='text-normal text-black line-clamp-1'>
                Продавец:{' '}
                <Link
                  href={`${ROUTES.SALLER}/${product?.user.tgId}`}
                  className='underline'
                >
                  {product?.user.lastName || product?.user.firstName
                    ? `${product?.user.lastName ?? ''} ${product?.user.firstName ?? ''}`.trim()
                    : product?.user.username ?? 'Продавец'}
                </Link>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setIsContactModalOpen(true)}
                className='bg-primary-green text-white text-sm rounded-lg px-6 py-2 disabled:opacity-70'
                disabled={isLoading}
              >
                Купить
              </button>

              {/* Счётчик кол-ва (1..quantity) */}
              <div className='flex items-center bg-gray-50 rounded-md px-3 py-2 gap-2 text-sm font-medium'>
                <button
                  className='w-5 h-5 text-xl text-black leading-none disabled:opacity-70 cursor-pointer'
                  onClick={decrement}
                  disabled={isLoading || steps <= 1}
                  aria-label='Уменьшить количество'
                >
                  -
                </button>

                <span className='block text-black text-center w-6'>
                  {totalUnits}
                </span>

                <button
                  className='w-5 h-5 text-xl text-black leading-none disabled:opacity-70 cursor-pointer'
                  onClick={increment}
                  disabled={isLoading || steps >= maxQty}
                  aria-label='Увеличить количество'
                >
                  +
                </button>
              </div>

              {/* Тип единицы */}
              <span className='text-xs text-black line-clamp-1'>
                {unitShort(product?.quantityType)}
              </span>
            </div>
            {product?.viewCount !== undefined && (
              <div className='text-xs text-black'>
                Просмотров: {product.viewCount}
              </div>
            )}
          </div>

          {/* Mobile brand image */}
          <Link
            href={
              product?.brand.id ? `${ROUTES.BRANDS}/${product?.brand.id}` : ''
            }
            className='rounded-md hover:opacity-70 active:opacity-70 transition md:hidden text-black'
          >
            {product?.brand?.photo ? (
              <ImageWithSkeleton
                src={toImageSrc(product?.brand?.photo)}
                alt={product?.brand?.name ?? product?.brand?.id ?? 'brand'}
                containerClassName='!w-[80px] !h-[80px]'
                className='rounded-md object-contain'
                isLoading={isLoading}
              />
            ) : (
              product?.brand?.name
            )}
          </Link>
        </div>
      </div>

      {/* Desktop brand image */}
      <Link
        href={product?.brand.id ? `${ROUTES.BRANDS}/${product?.brand.id}` : ''}
        className='rounded-md hover:opacity-70 active:opacity-70 transition hidden md:inline-block'
      >
        {product?.brand?.photo ? (
          <ImageWithSkeleton
            src={toImageSrc(product?.brand?.photo)}
            alt={product?.brand?.name ?? product?.brand?.id ?? 'brand'}
            containerClassName='!w-[120px] !h-[120px]'
            className='rounded-md object-contain'
            isLoading={isLoading}
          />
        ) : (
          product?.brand?.name
        )}
      </Link>

      <ContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        username={product?.user.username ?? null}
        email={product?.user.email ?? null}
        phone={product?.user.phone ?? null}
      />
    </div>
  );
};
