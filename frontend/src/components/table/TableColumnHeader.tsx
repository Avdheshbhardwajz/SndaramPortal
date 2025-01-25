import React from 'react'
import { ArrowUpDown, Filter } from 'lucide-react'
import { TableFilter } from '../TableFilter'
import type { FilterCondition } from '../TableFilter'
import type { TableColumnHeaderProps } from './TableColumnHeader.types'

interface TableColumnHeaderProps {
  column: string
  sortConfig: {
    column: string | null
    direction: 'asc' | 'desc' | null
  }
  onSort: (column: string) => void
  filterColumn: string | null
  activeFilters: Record<string, FilterCondition>
  onFilterClick: (column: string) => void
  onFilterApply: (column: string, condition: FilterCondition) => void
  columnType: 'text' | 'number' | 'date'
  isEditable: boolean
}

export const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({
  column,
  sortConfig,
  onSort,
  filterColumn,
  activeFilters,
  onFilterClick,
  onFilterApply,
  columnType,
  isEditable
}) => {
  const hasFilter = column in activeFilters

  return (
    <th className={`py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 whitespace-nowrap bg-gray-50 ${!isEditable ? 'text-gray-500' : 'text-gray-900'}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSort(column)}
          className={`flex items-center gap-1 hover:text-blue-600 ${!isEditable ? 'opacity-75' : ''}`}
        >
          {column.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')}
          <ArrowUpDown 
            size={16}
            className={`transition-colors ${
              sortConfig.column === column ? 'text-blue-600' : 'text-gray-400'
            }`}
          />
        </button>

        <div className="relative">
          <button
            onClick={() => onFilterClick(column)}
            className={`p-1 rounded hover:bg-gray-100 ${
              hasFilter ? 'text-blue-600' : 'text-gray-500'
            } ${!isEditable ? 'opacity-75' : ''}`}
            title={hasFilter ? 'Filter active' : 'Add filter'}
          >
            <Filter size={16} />
          </button>

          {filterColumn === column && (
            <TableFilter
              isOpen={true}
              onClose={() => onFilterClick(column)}
              column={column}
              type={columnType}
              onApply={(condition) => onFilterApply(column, condition)}
              initialValue={activeFilters[column]}
            />
          )}
        </div>
      </div>
    </th>
  )
}
