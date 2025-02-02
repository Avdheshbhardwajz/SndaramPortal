import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const pageSizeOptions = [10, 25, 50, 100];
  console.log({
    currentPage,
    pageSize,
    totalPages,
    total,
    onPageChange,
    onPageSizeChange,
  });
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3f2fd] bg-white">
      {/* Left side - Page size selector and total */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#1a237e]">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-[#e3f2fd] rounded-lg text-sm text-[#1a237e] focus:outline-none focus:ring-2 focus:ring-[#00bfa5] focus:border-transparent"
            disabled={isLoading}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-[#1a237e]">
          Total: {isLoading ? "..." : total} records
        </span>
      </div>

      {/* Right side - Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-1 rounded-lg hover:bg-[#e3f2fd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5 text-[#1a237e]" />
        </button>

        <span className="text-sm text-[#1a237e]">
          Page {isLoading ? "..." : currentPage} of{" "}
          {isLoading ? "..." : totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-1 rounded-lg hover:bg-[#e3f2fd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5 text-[#1a237e]" />
        </button>
      </div>
    </div>
  );
};
