import { useMemo } from 'react'

interface UsePaginationProps {
  currentPage: number
  totalPages: number
  siblingCount?: number
}

export const usePagination = ({ 
  currentPage, 
  totalPages, 
  siblingCount = 1 
}: UsePaginationProps) => {
  return useMemo(() => {
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always include last page
    if (totalPages !== 1) {
      range.push(totalPages);
    }

    // Add the page numbers to final array with dots
    let l;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [currentPage, totalPages, siblingCount]);
}
