import React from 'react';

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (newSize: number) => void;
  options?: number[];
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100]
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="pageSize" className="text-sm text-[#6B7280]">
        Rows per page:
      </label>
      <select
        id="pageSize"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="text-sm border border-[#E5E7EB] rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};
