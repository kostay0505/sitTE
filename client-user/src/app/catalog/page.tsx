'use client';

import { useMemo, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Page } from '@/components/Page';
import { SearchInput } from '@/components/SearchInput';
import { ProductCard } from '@/components/Catalog/ProductCard';
import { ROUTES } from '@/config/routes';
import { ProductFilters } from '@/components/ProductFilters';
import { useInfiniteProductsFlat } from '@/features/products/hooks';
import { useCategoryFilterOptions } from '@/features/category/hooks';
import { useClientSearch } from '@/hooks/useClientSearch';
import { useDebouncedProductFilters } from '@/hooks/useDebouncedProductFilters';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAvailableBrands } from '@/features/brands/hooks';
import { useFiltersStore } from '@/stores/filtersStore';

export default function Catalog() {
  const params = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const { searchQuery, setSearchQuery, updateFilters } = useFiltersStore();
  const initialQ = (params.get('q') ?? searchQuery ?? '').trim();

  useEffect(() => {
    const currentFilters = useFiltersStore.getState();

    const filtersToApply = {
      category: currentFilters.category,
      subcategory: currentFilters.subcategory,
      brandId: currentFilters.brandId,
      priceFrom: currentFilters.priceFrom,
      priceTo: currentFilters.priceTo,
      searchQuery: currentFilters.searchQuery,
    };

    const hasChanges = Object.keys(filtersToApply).some(
      key =>
        filtersToApply[key as keyof typeof filtersToApply] !==
        currentFilters[key as keyof typeof currentFilters],
    );

    if (hasChanges) {
      updateFilters(filtersToApply);
    }
  }, []);

  const filters = useDebouncedProductFilters({ delay: 300, limit: 24 });

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
  }, [subcategoryOptions, filters]);

  // Данные списка
  const infinite = useInfiniteProductsFlat(filters.query);
  const items = infinite.items;
  const isLoading = infinite.status === 'pending';

  const [searchInput, setSearchInput] = useState(initialQ);

  // Фильтр по клику/Enter. initialQ применим сразу (автопоиск при заходе с q)
  const search = useClientSearch(items, {
    keys: ['name', 'description'],
    delay: 0,
    initial: initialQ,
  });

  const handleSearch = (q: string) => {
    search.setInput(q);
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
  };

  const { data: brandsData, status: brandsStatus } = useAvailableBrands();
  const brandsLoading = brandsStatus === 'pending';
  const brandOptions = useMemo(
    () =>
      (brandsData ?? []).map(b => ({
        label: b.name,
        value: b.id,
      })),
    [brandsData],
  );

  useEffect(() => {
    if (searchInput.trim() === '') {
      search.reset(); // -> hook вернёт все items
      if (searchQuery !== '') {
        setSearchQuery('');
      }
      // (опционально) почистим q из адресной строки:
      if (params.get('q')) replace(pathname);
    }
  }, [
    searchInput,
    params,
    pathname,
    replace,
    search,
    setSearchQuery,
    searchQuery,
  ]);

  useEffect(() => {
    if (
      filters.brandId &&
      !brandOptions.some(o => o.value === filters.brandId)
    ) {
      filters.setBrandId('');
    }
  }, [brandOptions, filters]);

  const isEmpty = !isLoading && items.length === 0;
  const nothingFound =
    !isLoading && search.query.trim() && search.filtered.length === 0;

  const emptyText = nothingFound
    ? 'Ничего не найдено'
    : isEmpty
      ? 'Продуктов пока нет'
      : '';

  return (
    <Page back={true}>
      <Layout className='p-2 pt-4 flex flex-col gap-5'>
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch} // по клику/Enter применяем
        />

        <ProductFilters
          category={filters.category}
          onCategoryChange={filters.onCategoryChange}
          categoryOptions={categoryOptions}
          subcategory={filters.subcategory}
          onSubcategoryChange={filters.setSubcategory}
          subcategoryOptions={subcategoryOptions}
          brandId={filters.brandId}
          onBrandChange={filters.setBrandId}
          brandOptions={brandOptions}
          brandsLoading={brandsLoading}
          priceFrom={filters.priceFromInput}
          onPriceFromChange={filters.setPriceFromInput}
          priceTo={filters.priceToInput}
          onPriceToChange={filters.setPriceToInput}
          loading={categoriesLoading}
          className='grid grid-cols-2'
        />

        {emptyText && (
          <div className='p-2 pt-4 text-center text-black'>{emptyText}</div>
        )}

        <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
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
    </Page>
  );
}
