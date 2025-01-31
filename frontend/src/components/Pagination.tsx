import React from 'react'
//import { IconButton } from './ui/IconButton'
import { usePagination } from '../hooks/usePagination'
//import { colors } from '../constants/colors'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
//ye hatana hai !!!
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
//ye hatana hai !!!
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null

  const pageNumbers = usePagination({ currentPage, totalPages })

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
        </button>

        <div className="flex items-center gap-2">
          {pageNumbers.map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === '...' ? (
                <span className="text-sm text-gray-600">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(Number(pageNumber))}
                  className={`h-8 min-w-[2rem] px-3 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors
                    ${currentPage === pageNumber 
                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {pageNumber}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}
