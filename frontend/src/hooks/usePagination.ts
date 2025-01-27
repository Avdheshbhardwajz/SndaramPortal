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
    const range = []
    
    // Calculate the range of pages to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
    
    // Should we show dots on left side?
    const shouldShowLeftDots = leftSiblingIndex > 2
    // Should we show dots on right side?
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1
    
    // Always show first page
    range.push(1)
    
    // Add left dots if needed
    if (shouldShowLeftDots) {
      range.push('...')
    } else if (leftSiblingIndex > 1) {
      // If we're not showing dots but there are pages between 1 and leftSiblingIndex
      for (let i = 2; i < leftSiblingIndex; i++) {
        range.push(i)
      }
    }
    
    // Add the sibling pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i)
      }
    }
    
    // Add right dots if needed
    if (shouldShowRightDots) {
      range.push('...')
    } else if (rightSiblingIndex < totalPages) {
      // If we're not showing dots but there are pages between rightSiblingIndex and totalPages
      for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
        range.push(i)
      }
    }
    
    // Always show last page if it's not already included
    if (totalPages > 1) {
      range.push(totalPages)
    }
    
    return range
  }, [currentPage, totalPages, siblingCount])
}
