'use client';

import { FC, useMemo } from 'react';
import { Trash2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Skeleton } from '../common/Skeleton/Skeleton';
import type { ProductBasic, Product } from '@/api/products/types';
import { formatPrice } from '@/utils/currency';
import { toImageSrc } from '@/utils/toImageSrc';
import { FavoriteButton } from '@/components/FavoriteButton';
import { AppTooltip } from '@/components/common/Tooltip/Tooltip';
import { Link } from '@/components/Link/Link';
import { PostingIcon } from '@/components/common/SvgIcon';

interface Props {
  product?: ProductBasic;
  fullProduct?: Product;
  coverImage?: boolean;
  isLoading?: boolean;
  href?: string;
  hideFavorite?: boolean;
  showDelete?: boolean;
  showStatus?: boolean;
  showPosting?: boolean;
  onDelete?: (id: string) => void;
  onPosting?: (product: ProductBasic) => void;
}

export const ProductCard: FC<Props> = ({
  product,
  fullProduct,
  isLoading = false,
  coverImage = false,
  href = '',
  hideFavorite = false,
  showDelete,
  showStatus = false,
  showPosting = false,
  onDelete,
  onPosting,
}) => {
  const normalizedStatus = useMemo(() => {
    const s = (product?.status || '').toLowerCase();
    if (s === 'approve') return 'approved';
    if (s === 'rejacted') return 'rejected';
    return s;
  }, [product?.status]) as 'moderation' | 'approved' | 'rejected' | '';

  const { colorClasses, tooltipText } = useMemo(() => {
    switch (normalizedStatus) {
      case 'approved':
        return {
          colorClasses: 'text-green-600 bg-green-50 md:bg-green-100/60',
          tooltipText: 'Ваше объявление активно',
        };
      case 'moderation':
        return {
          colorClasses: 'text-blue-600 bg-blue-50 md:bg-blue-100/60',
          tooltipText: 'Ваше объявление на модерации, ожидайте',
        };
      case 'rejected':
        return {
          colorClasses: 'text-red-600 bg-red-50 md:bg-red-100/60',
          tooltipText: 'Ваше объявление отклонено, обновите его',
        };
      default:
        return { colorClasses: '', tooltipText: '' };
    }
  }, [normalizedStatus]);

  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-col justify-between h-full bg-white rounded-xl shadow-md transition hover:shadow-lg',
        'max-h-[199px] md:max-h-[436px]',
        'p-4 rounded-xl',
        !href && 'pointer-events-none',
        'md:bg-[#F5F5FA] md:shadow-none md:hover:shadow-none',
      )}
    >
      {/* Правый верхний угол */}
      {!isLoading && (
        <div className='absolute top-2 right-2 z-10 flex flex-col items-end gap-1'>
          {/* New Badge */}
          {product?.isNew && (
            <div className='bg-[#C4C4C4] text-[8px] text-black px-2 py-0.5 rounded-full'>
              New
            </div>
          )}

          {showStatus && normalizedStatus && tooltipText && (
            <AppTooltip
              content={tooltipText + (product?.viewCount ? `<br>Просмотров: ${product.viewCount}` : '')}
              side='left'
              align='center'
              className='max-w-[200px]'
            >
              <div
                role="button"
                tabIndex={0}
                aria-label='Статус объявления'
                className={cn(
                  'inline-flex items-center justify-center rounded-full z-10',
                  'shadow-sm transition cursor-pointer',
                  'touch-none select-none',
                  colorClasses,
                )}
              >
                <Info className={cn('w-4 h-4 md:w-5 md:h-5 rounded-full')} />
              </div>
            </AppTooltip>
          )}
        </div>
      )}

      {/* Favorite */}
      {!isLoading && !hideFavorite && product?.id && (
        <FavoriteButton
          productId={product.id}
          isFavorite={!!product.isFavorite}
          className={cn(
            'absolute top-2 z-10 w-6 h-6',
            showDelete ? 'right-12' : 'left-2',
          )}
          size={24}
        />
      )}

      {/* Delete */}
      {showDelete && product?.id && (
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(product.id);
          }}
          className='absolute top-2 left-2 z-10'
          title='Удалить объявление'
        >
          <Trash2 className='w-5 h-5 text-red-500 md:w-6 md:h-6' />
        </button>
      )}

      {/* Posting */}
      {showPosting && product && (
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onPosting?.(product);
          }}
          className='absolute bottom-2 right-2 z-10'
          title='Поделиться в Telegram'
        >
          <PostingIcon className='w-5 h-5 text-blue-500 md:w-6 md:h-6' />
        </button>
      )}

      <div className={cn('!pb-0 mb-4', 'overflow-hidden')}>
        <ImageWithSkeleton
          src={toImageSrc(product?.preview as string)}
          alt={product?.name || ''}
          isLoading={isLoading}
          containerClassName='w-full rounded-xl !h-[100px] md:!h-[300px]'
          className={cn(
            coverImage ? 'object-cover' : 'object-contain',
            'rounded-xl',
          )}
          skeletonClassName='!rounded-xl'
        />
      </div>

      <div className='flex flex-col gap-1 text-black'>
        {isLoading ? (
          <>
            <Skeleton height={32} width='100%' />
            {/* <Skeleton height={32} width='100%' /> */}
            <Skeleton height={15} width='100%' />
          </>
        ) : (
          <>
            <div className='text-xs md:text-lg font-medium text-center line-clamp-2 min-h-8 md:min-h-14'>
              {product?.name}
            </div>
            <div className='text-[10px] md:text-lg text-center text-base font-medium'>
              {Number(product?.priceCash) === 0 
                ? 'Цена по запросу' 
                : formatPrice(product?.priceCash, product?.currency)
              }
            </div>
          </>
        )}
      </div>
    </Link>
  );
};
