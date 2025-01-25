import React from 'react'
import { Pencil } from 'lucide-react'

interface TableBodyProps {
  data: Record<string, any>[]
  columns: string[]
  onEditClick?: (row: Record<string, any>) => void
  isEditable: (column: string) => boolean
}

export const TableBody: React.FC<TableBodyProps> = ({
  data,
  columns,
  onEditClick,
  isEditable
}) => {
  if (!data || data.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (onEditClick ? 1 : 0)}
            className="py-4 px-6 text-sm text-gray-500 text-center"
          >
            No data available
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((row, rowIndex) => (
        <tr
          key={row.id || row[`${columns[0]}_sk`] || row[`${columns[0]}_id`] || rowIndex}
          className="hover:bg-gray-50"
        >
          {/* Action Column - Sticky */}
          {onEditClick && (
            <td
              className="sticky left-0 z-10 py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap bg-white"
              style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}
            >
              <button
                onClick={() => onEditClick && onEditClick(row)}
                className="text-blue-600 hover:text-blue-900"
                title="Edit row"
              >
                <Pencil size={16} />
              </button>
            </td>
          )}

          {/* Data Columns */}
          {columns.map((column) => {
            const value = row[column];
            return (
              <td
                key={column}
                className={`py-4 px-6 text-sm whitespace-nowrap ${
                  isEditable(column) ? 'text-gray-900' : 'text-gray-500 bg-gray-50'
                }`}
              >
                {value !== null && value !== undefined ? String(value) : '-'}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  )
}
