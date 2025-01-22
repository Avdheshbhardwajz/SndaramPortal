import type React from 'react'

interface TableCardProps {
  tableName: string
  onClick?: () => void
}

export const TableCard: React.FC<TableCardProps> = ({ tableName, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
    >
      <span className="text-gray-900 font-medium">{tableName}</span>
      <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  )
}
