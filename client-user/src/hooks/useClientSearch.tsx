'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import deburr from 'lodash/deburr';

export type SearchOptions<T> = {
  /** По каким полям искать (по умолчанию: name, description) */
  keys?: (keyof T & string)[];
  /** Свой предикат вместо keys */
  predicate?: (
    item: T,
    normalizedQuery: string,
    normalize: (s: string) => string,
  ) => boolean;
  /** Дебаунс в мс (по умолчанию 300) */
  delay?: number;
  /** Минимальная длина запроса для старта фильтрации (по умолчанию 1) */
  minQueryLength?: number;
  /** Стартовое значение инпута */
  initial?: string;
  /** Своя нормализация (по умолчанию: deburr + toLowerCase + trim) */
  normalize?: (s: string) => string;
};

export function useClientSearch<T>(items: T[], opts?: SearchOptions<T>) {
  const [input, setInput] = useState(opts?.initial ?? '');
  const [query, setQuery] = useState(opts?.initial ?? '');

  const delay = opts?.delay ?? 300;
  const minLen = opts?.minQueryLength ?? 1;

  const debouncedSetQuery = useMemo(
    () => debounce((v: string) => setQuery(v), delay),
    [delay],
  );

  useEffect(() => {
    debouncedSetQuery(input);
    return () => debouncedSetQuery.cancel();
  }, [input, debouncedSetQuery]);

  const normalize = useCallback(
    (s: string) =>
      opts?.normalize ? opts.normalize(s) : deburr(s).toLowerCase().trim(),
    [opts],
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q || q.length < minLen) return items;

    if (opts?.predicate) {
      return items.filter(it => opts.predicate!(it, q, normalize));
    }

    const keys = opts?.keys?.length
      ? opts.keys
      : (['name', 'description'] as (keyof T & string)[]);
    return items.filter((it: any) =>
      keys.some(k => normalize(String(it?.[k] ?? '')).includes(q)),
    );
  }, [items, query, normalize, minLen, opts?.keys, opts?.predicate]);

  return {
    /** Текущее значение инпута (без дебаунса) */
    input,
    /** Устанавливает значение инпута */
    setInput,
    /** Дебаунс-значение, по которому реально фильтруем */
    query,
    /** Сбросить поиск */
    reset: () => setInput(''),
    /** Признак активного поиска */
    isActive: !!normalize(query),
    /** Отфильтрованные элементы */
    filtered,
  };
}
