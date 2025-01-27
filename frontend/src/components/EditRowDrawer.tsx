import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'

interface EditRowDrawerProps {
  isOpen: boolean
  onClose: () => void
  row: Record<string, any> | null
  columns: string[]
  onSave: (updatedRow: Record<string, any>) => Promise<void>
  mode: 'edit' | 'add'
  isColumnEditable: (column: string) => boolean
}

// System columns that should not be shown in add mode
const SYSTEM_COLUMNS = [
  'id',
  'status',
  'created_at',
  'updated_at',
  'maker',
  'admin',
  'comments',
  'request_id'
]

export const EditRowDrawer: React.FC<EditRowDrawerProps> = ({
  isOpen,
  onClose,
  row,
  columns,
  onSave,
  mode,
  isColumnEditable
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && row) {
      // For edit mode, only include editable columns
      const editableData = columns.reduce((acc, column) => {
        if (isColumnEditable(column)) {
          acc[column] = row[column] || ''
        }
        return acc
      }, {} as Record<string, any>)
      setFormData(editableData)
    } else {
      // For add mode, include all columns except system columns
      const newRowData = columns.reduce((acc, column) => {
        if (!column.startsWith('_') && 
            !SYSTEM_COLUMNS.includes(column.toLowerCase()) &&
            !column.endsWith('_sk') && 
            !column.endsWith('_id')) {
          acc[column] = ''
        }
        return acc
      }, {} as Record<string, any>)
      setFormData(newRowData)
    }
  }, [row, columns, isColumnEditable, mode])

  const handleChange = (column: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const emptyFields = Object.entries(formData)
      .filter(([_, value]) => value === '')
      .map(([key]) => key)

    if (emptyFields.length > 0) {
      toast.error(`Please fill in the following fields: ${emptyFields.join(', ')}`)
      return
    }

    try {
      setIsSubmitting(true)
      
      // For edit mode, preserve non-editable values from original row
      const finalData = mode === 'edit' && row 
        ? { ...row, ...formData }
        : formData

      await onSave(finalData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Get columns to display based on mode
  const displayColumns = mode === 'edit' 
    ? columns.filter(column => isColumnEditable(column))
    : columns.filter(column => 
        !column.startsWith('_') && 
        !SYSTEM_COLUMNS.includes(column.toLowerCase()) &&
        !column.endsWith('_sk') && 
        !column.endsWith('_id')
      )

  // Function to determine input type based on column name
  const getInputType = (column: string): string => {
    const columnLower = column.toLowerCase()
    if (columnLower.includes('date') || columnLower.endsWith('_at')) {
      return 'date'
    }
    if (columnLower.includes('email')) {
      return 'email'
    }
    if (columnLower.includes('phone') || columnLower.includes('mobile')) {
      return 'tel'
    }
    if (columnLower.includes('amount') || 
        columnLower.includes('price') || 
        columnLower.includes('quantity') ||
        columnLower.includes('number')) {
      return 'number'
    }
    return 'text'
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-96">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between space-x-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium text-gray-900">
                      {mode === 'edit' ? 'Edit Row' : 'Add New Row'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {mode === 'edit' 
                        ? 'Only editable fields are shown'
                        : 'Fill in all required fields'}
                    </p>
                  </div>
                  <div className="h-7 flex items-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 space-y-6 sm:px-6">
                  {displayColumns.map(column => (
                    <div key={column}>
                      <label
                        htmlFor={column}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {column.split('_').join(' ')}
                      </label>
                      <input
                        type={getInputType(column)}
                        name={column}
                        id={column}
                        value={formData[column] || ''}
                        onChange={(e) => handleChange(column, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-4 flex justify-end border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
