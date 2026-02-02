import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterState {
  category: string;
  subcategory: string;
  brandId: string;
  priceFrom: string;
  priceTo: string;
  searchQuery: string;
}

interface FilterActions {
  setCategory: (category: string) => void;
  setSubcategory: (subcategory: string) => void;
  setBrandId: (brandId: string) => void;
  setPriceFrom: (priceFrom: string) => void;
  setPriceTo: (priceTo: string) => void;
  setSearchQuery: (searchQuery: string) => void;
  clearFilters: () => void;
  updateFilters: (filters: Partial<FilterState>) => void;
}

const initialState: FilterState = {
  category: '',
  subcategory: '',
  brandId: '',
  priceFrom: '',
  priceTo: '',
  searchQuery: '',
};

export const useFiltersStore = create<FilterState & FilterActions>()(
  persist(
    set => ({
      ...initialState,

      setCategory: (category: string) => {
        set({ category, subcategory: '' });
      },

      setSubcategory: (subcategory: string) => {
        set({ subcategory });
      },

      setBrandId: (brandId: string) => {
        set({ brandId });
      },

      setPriceFrom: (priceFrom: string) => {
        set({ priceFrom });
      },

      setPriceTo: (priceTo: string) => {
        set({ priceTo });
      },

      setSearchQuery: (searchQuery: string) => {
        set({ searchQuery });
      },

      clearFilters: () => {
        set(initialState);
      },

      updateFilters: (filters: Partial<FilterState>) => {
        set(state => ({ ...state, ...filters }));
      },
    }),
    {
      name: 'catalog-filters',
      partialize: state => ({}),
    },
  ),
);
