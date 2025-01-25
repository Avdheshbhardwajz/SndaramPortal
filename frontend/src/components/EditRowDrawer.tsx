import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EditRowDrawerProps {
  isOpen: boolean
  onClose: () => void
  row: Record<string, any> | null
  columns: string[]
  onSave: (updatedRow: Record<string, any>) => void
  mode: 'edit' | 'add'
}

export const EditRowDrawer: React.FC<EditRowDrawerProps> = ({
  isOpen,
  onClose,
  row,
  columns,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (row) {
      // Only include editable columns in form data
      const editableData = columns.reduce((acc, column) => {
        acc[column] = row[column] || ''
        return acc
      }, {} as Record<string, any>)
      setFormData(editableData)
    } else {
      setFormData({})
    }
  }, [row, columns])

  const handleChange = (column: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Preserve non-editable values from original row
    const updatedRow = {
      ...row,
      ...formData
    }
    onSave(updatedRow)
  }

  if (!isOpen) return null

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
                      {mode === 'edit' ? 'Edit Row' : 'Add Row'}
                    </h2>
                  </div>
                  <div className="h-7 flex items-center">
                    <button
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
                  {columns.map(column => (
                    <div key={column}>
                      <label
                        htmlFor={column}
                        className="block text-sm font-medium text-gray-700 capitalize"
                      >
                        {column.split('_').join(' ')}
                      </label>
                      <input
                        type="text"
                        name={column}
                        id={column}
                        value={formData[column] || ''}
                        onChange={e => handleChange(column, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
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
