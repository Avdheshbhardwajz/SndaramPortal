import React from 'react';

interface TableCardProps {
  tableName: string;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ tableName, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#E5E7EB] rounded-lg p-4 hover:border-blue-500 transition-colors duration-200 text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#111827] font-medium text-sm truncate group-hover:text-blue-600">
            {tableName}
          </h3>
          <p className="text-[#6B7280] text-xs mt-1">
            Click to view and manage data
          </p>
        </div>
        <svg
          className="w-5 h-5 text-[#6B7280] group-hover:text-blue-600 flex-shrink-0 ml-4"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7.5 3.75L13.75 10L7.5 16.25"
            stroke="currentColor"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
};
