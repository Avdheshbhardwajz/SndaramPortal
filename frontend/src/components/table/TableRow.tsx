import React from 'react'
import { Pencil } from 'lucide-react'

interface TableRowProps {
  row: Record<string, any>
  columns: string[]
  onEdit?: () => void
}

export const TableRow: React.FC<TableRowProps> = ({ row, columns, onEdit }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Action Column - Sticky */}
      {onEdit && (
        <td 
          className="sticky left-0 z-10 py-4 px-6 text-sm border-b border-gray-200 bg-white"
          style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}
        >
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Row"
          >
            <Pencil size={20} />
          </button>
        </td>
      )}
      
      {/* Data Columns */}
      {columns.map((column) => (
        <td
          key={column}
          className="py-4 px-6 text-sm text-gray-900 whitespace-nowrap"
        >
          {row[column] !== null && row[column] !== undefined ? row[column].toString() : '—'}
        </td>
      ))}
    </tr>
  )
}
