import React from 'react'
import { Search, Plus, Edit } from 'lucide-react'

interface TableHeaderProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddClick: () => void
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddClick
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Add Button */}
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Plus size={20} />
        <span>Add Row</span>
      </button>
    </div>
  )
}
