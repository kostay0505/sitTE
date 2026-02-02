'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import type { ProductsAvailableQuery } from '@/api/products/types';
import { useFiltersStore } from '@/stores/filtersStore';

type Init = {
  category?: string;
  subcategory?: string;
  priceFrom?: string; // строка для инпута
  priceTo?: string; // строка для инпута
  delay?: number; // мс, по умолчанию 300
  limit?: number; // по умолчанию 25
};

export function useDebouncedProductFilters(init?: Init) {
  const {
    category,
    subcategory,
    brandId,
    priceFrom,
    priceTo,
    setCategory: setStoreCategory,
    setSubcategory: setStoreSubcategory,
    setBrandId: setStoreBrandId,
    setPriceFrom: setStorePriceFrom,
    setPriceTo: setStorePriceTo,
  } = useFiltersStore();

  // ==== сырой ввод из инпутов (меняется на каждую клавишу) ====
  const [priceFromInput, setPriceFromInput] = useState(
    init?.priceFrom ?? priceFrom ?? '',
  );
  const [priceToInput, setPriceToInput] = useState(
    init?.priceTo ?? priceTo ?? '',
  );

  // ==== применённые значения (используются в запросе) ====
  const [appliedPriceFrom, setAppliedPriceFrom] = useState(priceFromInput);
  const [appliedPriceTo, setAppliedPriceTo] = useState(priceToInput);

  useEffect(() => {
    if (priceFrom && priceFrom !== priceFromInput) {
      setPriceFromInput(priceFrom);
      setAppliedPriceFrom(priceFrom);
    }
    if (priceTo && priceTo !== priceToInput) {
      setPriceToInput(priceTo);
      setAppliedPriceTo(priceTo);
    }
  }, []);

  const delay = init?.delay ?? 300;
  const limit = init?.limit ?? 24;

  // Дебаунсим применение цен
  const applyDebounced = useMemo(
    () =>
      debounce((from: string, to: string) => {
        setAppliedPriceFrom(from);
        setAppliedPriceTo(to);
      }, delay),
    [delay],
  );

  useEffect(() => {
    applyDebounced(priceFromInput, priceToInput);
    return () => applyDebounced.cancel();
  }, [priceFromInput, priceToInput, applyDebounced]);

  // Для применения сразу (onBlur, кнопка «Применить» и т.п.)
  const applyNow = useCallback(() => {
    applyDebounced.cancel();
    setAppliedPriceFrom(priceFromInput);
    setAppliedPriceTo(priceToInput);
  }, [priceFromInput, priceToInput, applyDebounced]);

  // Меняем категорию — всегда сбрасываем подкатегорию
  const onCategoryChange = useCallback(
    (v: string) => {
      setStoreCategory(v);
    },
    [setStoreCategory],
  );

  // Готовим query для бекенда (используем ТОЛЬКО применённые значения)
  const query: ProductsAvailableQuery = useMemo(() => {
    const priceCashFrom =
      appliedPriceFrom && !Number.isNaN(Number(appliedPriceFrom))
        ? Number(appliedPriceFrom)
        : null;
    const priceCashTo =
      appliedPriceTo && !Number.isNaN(Number(appliedPriceTo))
        ? Number(appliedPriceTo)
        : null;

    return {
      categoryId: subcategory || category || null,
      brandId: brandId || null,

      priceCashFrom,
      priceCashTo,
      limit,
      offset: 0, // управляется useInfiniteQuery
    };
  }, [category, brandId, subcategory, appliedPriceFrom, appliedPriceTo, limit]);

  const setSubcategoryWithStore = useCallback(
    (v: string) => {
      setStoreSubcategory(v);
    },
    [setStoreSubcategory],
  );

  const setBrandIdWithStore = useCallback(
    (v: string) => {
      setStoreBrandId(v);
    },
    [setStoreBrandId],
  );

  const setPriceFromInputWithStore = useCallback((v: string) => {
    setPriceFromInput(v);
  }, []);

  const setPriceToInputWithStore = useCallback((v: string) => {
    setPriceToInput(v);
  }, []);

  useEffect(() => {
    if (appliedPriceFrom !== priceFrom) {
      setStorePriceFrom(appliedPriceFrom);
    }
    if (appliedPriceTo !== priceTo) {
      setStorePriceTo(appliedPriceTo);
    }
  }, [
    appliedPriceFrom,
    appliedPriceTo,
    priceFrom,
    priceTo,
    setStorePriceFrom,
    setStorePriceTo,
  ]);

  return {
    // ввод
    category,
    subcategory,
    brandId,

    priceFromInput,
    priceToInput,

    // сеттеры для UI
    setSubcategory: setSubcategoryWithStore,
    setBrandId: setBrandIdWithStore,
    setPriceFromInput: setPriceFromInputWithStore,
    setPriceToInput: setPriceToInputWithStore,
    onCategoryChange,

    // утилиты
    applyNow, // можно дергать на blur, если нужно
    query, // готовый объект для useInfiniteProductsFlat
  };
}
