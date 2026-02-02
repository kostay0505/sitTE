import { useState, useMemo } from 'react';
import { PaginationData } from '@/types/common';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  paginationData: PaginationData;
  currentItems: T[];
  goToPage: (page: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
}

export const usePagination = <T>(
  items: T[],
  { totalItems, itemsPerPage, initialPage = 1 }: UsePaginationProps
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationData = useMemo((): PaginationData => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return {
    paginationData,
    currentItems,
    goToPage,
    goToPrevPage,
    goToNextPage,
  };
}; 