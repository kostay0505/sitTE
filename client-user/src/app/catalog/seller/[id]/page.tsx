'use client';

import { Layout } from '@/components/Layout';
import { Page } from '@/components/Page';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton/ImageWithSkeleton';
import { ProductCard } from '@/components/Catalog/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { SearchInput } from '@/components/SearchInput';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';
import { cn } from '@/utils/cn';

import { useSeller } from '@/features/users/hooks';
import { useInfiniteProductsFlat } from '@/features/products/hooks';
import type { ProductsAvailableQuery } from '@/api/products/types';
import { useClientSearch } from '@/hooks/useClientSearch';
import { useDebouncedProductFilters } from '@/hooks/useDebouncedProductFilters';
import { useCategoryFilterOptions } from '@/features/category/hooks';

import { ROUTES } from '@/config/routes';
import { toImageSrc } from '@/utils/toImageSrc';
import { ShareIcon } from '@/components/common/SvgIcon';
import { ShareModal } from '@/components/Product/ShareModal';
import { ContactModal } from '@/components/Product/ContactModal';

export default function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { data: seller, status: sellerStatus } = useSeller(id);
  const sellerLoading = sellerStatus === 'pending';

  // удобные вычисления прямо в компоненте (вместо uiSeller)
  const sellerName = useMemo(() => {
    if (!seller) return '';
    return (
      seller.username ||
      [seller.firstName, seller.lastName].filter(Boolean).join(' ') ||
      'Продавец'
    );
  }, [seller]);

  // фильтры
  const filters = useDebouncedProductFilters({ delay: 300, limit: 24 });

  // категории/подкатегории
  const {
    isLoading: categoriesLoading,
    categoryOptions,
    getSubcategoryOptions,
  } = useCategoryFilterOptions();

  const subcategoryOptions = useMemo(
    () => getSubcategoryOptions(filters.category || null),
    [getSubcategoryOptions, filters.category],
  );

  useEffect(() => {
    if (
      filters.subcategory &&
      !subcategoryOptions.some(o => o.value === filters.subcategory)
    ) {
      filters.setSubcategory('');
    }
  }, [subcategoryOptions, filters.subcategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // товары продавца
  const query: ProductsAvailableQuery = useMemo(
    () => ({ ...filters.query, sellerId: seller?.tgId ?? id }),
    [filters.query, seller?.tgId, id],
  );

  const infinite = useInfiniteProductsFlat(query);
  const items = infinite.items;
  const isLoading = infinite.status === 'pending';

  // поиск по товарам
  const search = useClientSearch(items, {
    keys: ['name', 'description'],
    delay: 300,
  });

  if (!sellerLoading && !seller) {
    return (
      <div className='p-2 pt-4 text-black text-center'>Продавец не найден</div>
    );
  }

  return (
    <Page back={true}>
      <Layout className='p-2 pt-4 flex flex-col gap-4'>
        {/* Поиск */}
        <SearchInput value={search.input} onChange={search.setInput} />

        {/* Фильтры */}
        <ProductFilters
          category={filters.category}
          onCategoryChange={v => {
            filters.onCategoryChange(v);
            filters.setSubcategory('');
          }}
          categoryOptions={categoryOptions}
          subcategory={filters.subcategory}
          onSubcategoryChange={filters.setSubcategory}
          subcategoryOptions={subcategoryOptions}
          priceFrom={filters.priceFromInput}
          onPriceFromChange={filters.setPriceFromInput}
          priceTo={filters.priceToInput}
          onPriceToChange={filters.setPriceToInput}
          loading={categoriesLoading}
        />

        {/* Продавец */}
        <div
          className={cn(
            'bg-white rounded-xl p-4 flex gap-3 items-start relative',
            'md:bg-[#F5F5FA]',
          )}
        >
          <ImageWithSkeleton
            src={toImageSrc(seller?.photoUrl)}
            alt={`${sellerName} Logo`}
            containerClassName='!w-[100px] !h-[100px]'
            className='object-contain w-full h-full rounded-md'
            isLoading={sellerLoading}
          />
          <div className='flex-1 flex flex-col gap-1'>
            {sellerLoading ? (
              <>
                <Skeleton />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={15} />
                ))}
              </>
            ) : (
              <>
                <h2 className='text-normal text-black line-clamp-1'>
                  {sellerName}
                </h2>

                <div className='text-[10px] md:text-sm text-black flex gap-1'>
                  e-mail:{' '}
                  {seller?.email ? (
                    <a href={`mailto:${seller.email}`} className='line-clamp-1'>
                      {seller.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>

                <div className='text-[10px] md:text-sm text-black flex gap-1'>
                  телефон:{' '}
                  {seller?.phone ? (
                    <a href={`tel:${seller.phone}`} className='line-clamp-1'>
                      {seller.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>

                {/* страна/город из вложенного city */}

                <p className='text-[10px] md:text-sm text-black line-clamp-1'>
                  страна:{' '}
                  {seller?.city?.country?.name ? seller.city.country.name : '-'}
                </p>

                <p className='text-[10px] md:text-sm text-black line-clamp-1'>
                  город: {seller?.city?.name ? seller.city.name : '-'}
                </p>

                <div className='flex justify-end mt-2'>
                  <button
                    type='button'
                    onClick={e => {
                      e.stopPropagation();
                      setIsOpen(true);
                    }}
                    className='min-w-12 hover:opacity-75 ease-in-out flex gap-1 absolute left-4 bot-4'
                  >
                    <p className='text-black text-sm md:text-base pt-1'>
                      Поделиться
                    </p>
                    <ShareIcon width={22} height={22} />
                  </button>
                  <button
                    type='button'
                    onClick={() => setIsContactModalOpen(true)}
                    className='flex items-center gap-2 text-black text-sm md:text-base hover:opacity-70 transition'
                    disabled={sellerLoading}
                  >
                    Связаться
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Товары */}
        {!isLoading && search.filtered.length === 0 && (
          <div className='p-2 pt-4 text-center text-black'>
            Продуктов пока нет
          </div>
        )}
        <div className='grid grid-cols-3 md:grid-cols-4 gap-3'>
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <ProductCard key={`sk-${i}`} isLoading />
              ))
            : search.filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  href={`${ROUTES.CATALOG}/${p.id}`}
                />
              ))}
        </div>

        {infinite.hasNextPage && (
          <div className='flex justify-center py-4'>
            <button
              className='px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50'
              onClick={() => infinite.fetchNextPage()}
              disabled={infinite.isFetchingNextPage}
            >
              {infinite.isFetchingNextPage ? 'Загрузка…' : 'Показать ещё'}
            </button>
          </div>
        )}
      </Layout>
      <ShareModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        url={`${seller?.url}`}
      />
      <ContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        username={seller?.username ?? null}
        email={seller?.email ?? null}
        phone={seller?.phone ?? null}
      />
    </Page>
  );
}
