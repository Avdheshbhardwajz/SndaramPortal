import React from 'react'
import { Pencil } from 'lucide-react'

interface TableBodyProps {
  data: Record<string, any>[]
  columns: string[]
  onRowEdit?: (row: Record<string, any>) => void
  isColumnEditable: (column: string) => boolean
}

export const TableBody: React.FC<TableBodyProps> = ({
  data,
  columns,
  onRowEdit,
  isColumnEditable
}) => {
  return (
    <tbody>
      {data.map((row, rowIndex) => (
        <tr
          key={rowIndex}
          className="hover:bg-gray-50 bg-white"
        >
          {/* Action Column - Sticky */}
          {onRowEdit && (
            <td
              className="sticky left-0 z-10 py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap bg-inherit"
              style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}
            >
              <button
                onClick={() => onRowEdit(row)}
                className="text-blue-600 hover:text-blue-900"
                title="Edit row"
              >
                <Pencil size={16} />
              </button>
            </td>
          )}

          {/* Data Columns */}
          {columns.map((column) => {
            const editable = isColumnEditable(column);
            return (
              <td
                key={column}
                className={`py-4 px-6 text-sm whitespace-nowrap border-b border-gray-100 ${
                  editable 
                    ? 'text-gray-900 bg-white' 
                    : 'text-gray-500 bg-gray-50/80'
                }`}
              >
                {row[column]?.toString() || ''}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  )
}
