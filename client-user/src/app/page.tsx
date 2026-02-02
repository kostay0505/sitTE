'use client';

import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Page } from '@/components/Page';
import { SearchInput } from '@/components/SearchInput';
import {
  Carousel,
  defaultCarouselBreakpoints,
} from '@/components/common/Carousel/Carousel';
import { ProductCard } from '@/components/Catalog/ProductCard';
import { ROUTES } from '@/config/routes';
import { useProductsBasicInfo } from '@/features/products/hooks';
import type { ProductBasic } from '@/api/products/types';
import { QuestionsSection } from '@/components/Catalog/QuestionsSection';
import { useClientSearch } from '@/hooks/useClientSearch';
import { Brands } from '@/components/Catalog/Brands';
import { useAvailableBrands } from '@/features/brands/hooks';
import { useRouter } from 'next/navigation';
import { InfoSection } from '@/components/Catalog/InfoSection';

function renderProductsCarousel(
  label: string,
  items: ProductBasic[] | undefined,
  isLoading: boolean,
  emptyText: string, // ← текст для пустого состояния
) {
  const has = (items?.length ?? 0) > 0;

  const list = isLoading
    ? Array.from({ length: 10 }).map((_, i) => ({ id: `sk-${i}` }) as any)
    : has
      ? items!
      : [];

  return (
    <Carousel
      key={label}
      items={list}
      renderItem={(item: any) => (
        <ProductCard
          product={isLoading ? undefined : (item as ProductBasic)}
          isLoading={isLoading}
          href={isLoading ? '' : `${ROUTES.CATALOG}/${item.id}`}
        />
      )}
      label={label}
      breakpoints={defaultCarouselBreakpoints}
      emptyText={emptyText}
    />
  );
}

export default function Home() {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');

  const { data, status } = useProductsBasicInfo();
  const isLoadingProducts = status === 'pending';

  const { data: brands = [], status: brandsStatus } = useAvailableBrands();
  const brandsLoading = brandsStatus === 'pending';

  const newItems = useMemo(() => data?.new ?? [], [data]);
  const mainSellerItems = useMemo(() => data?.mainSeller ?? [], [data]);
  const popularItems = useMemo(() => data?.popular ?? [], [data]);

  const sNew = useClientSearch(newItems, {
    keys: ['name', 'description'],
    delay: 300,
  });
  const sMain = useClientSearch(mainSellerItems, {
    keys: ['name', 'description'],
    delay: 300,
  });
  const sPopular = useClientSearch(popularItems, {
    keys: ['name', 'description'],
    delay: 300,
  });

  const emptyText = 'Продуктов пока нет';

  const handleSearch = (q: string) => {
    router.push(`${ROUTES.CATALOG}?q=${encodeURIComponent(q)}`);
  };

  return (
    <Page back={false}>
      <Layout className='px-2 pt-4 flex flex-col gap-5'>
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          className='md:hidden'
          onSearch={handleSearch}
        />
        <div className='flex flex-col gap-5'>
          <InfoSection />
          {renderProductsCarousel(
            'Новое',
            sNew.filtered,
            isLoadingProducts,
            emptyText,
          )}
          {(isLoadingProducts || sMain.filtered.length > 0) &&
            renderProductsCarousel(
              'Touring Expert',
              sMain.filtered,
              isLoadingProducts,
              emptyText,
            )}
          {renderProductsCarousel(
            'Лучшие предложения',
            sPopular.filtered,
            isLoadingProducts,
            emptyText,
          )}
        </div>

        <QuestionsSection />

        <Brands
          brands={brands
            .sort((a, b) => (b.productCount) - (a.productCount))
            .slice(0, 25)}
          isLoading={brandsLoading}
        />
      </Layout>
    </Page>
  );
}
