'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableCities } from '@/api/cities/methods';
import type { City } from '@/api/cities/types';

export const QK = {
  cities: ['cities', 'available'] as const,
};

export function useAvailableCities() {
  return useQuery({
    queryKey: QK.cities,
    queryFn: getAvailableCities,
  });
}

// удобные helper’ы для опций
export function useCityCountryOptions(cities: City[] | undefined) {
  const byId = useMemo(() => {
    const m = new Map<string, City>();
    (cities ?? []).forEach(c => m.set(c.id, c));
    return m;
  }, [cities]);

  const countries = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    (cities ?? []).forEach(c => map.set(c.country.id, c.country));
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [cities]);

  const countryOptions = useMemo(
    () => countries.map(c => ({ label: c.name, value: c.id })),
    [countries],
  );

  const cityOptionsAll = useMemo(
    () =>
      (cities ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => ({ label: c.name, value: c.id })),
    [cities],
  );

  const cityOptionsByCountry = (countryId?: string) =>
    !countryId
      ? cityOptionsAll
      : cityOptionsAll.filter(o => byId.get(o.value)?.country.id === countryId);

  return { byId, countryOptions, cityOptionsAll, cityOptionsByCountry };
}
