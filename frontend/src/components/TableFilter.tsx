import React, { useState, useEffect } from 'react'

type FilterType = 'text' | 'number' | 'date'
type TextOperator = 'equals' | 'notEqual' | 'contains' | 'notContains' | 'startsWith' | 'endsWith'
type NumberOperator = 'equals' | 'notEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual'
type DateOperator = 'equals' | 'notEqual' | 'greaterThan' | 'lessThan' | 'inRange'

export interface FilterCondition {
  type: FilterType
  operator: TextOperator | NumberOperator | DateOperator
  value: string | number | Date | null
  valueTo?: string | number | Date | null // For date range
}

interface TableFilterProps {
  isOpen: boolean
  onClose: () => void
  column: string
  type: FilterType
  onApply: (condition: FilterCondition) => void
  initialValue?: FilterCondition
}

const operatorLabels: Record<string, string> = {
  equals: 'Equals',
  notEqual: 'Not equal',
  contains: 'Contains',
  notContains: 'Not contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  greaterThan: 'Greater than',
  greaterThanOrEqual: 'Greater than or equal',
  lessThan: 'Less than',
  lessThanOrEqual: 'Less than or equal',
  inRange: 'In range'
}

const getOperatorsForType = (type: FilterType) => {
  switch (type) {
    case 'text':
      return ['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith']
    case 'number':
      return ['equals', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual']
    case 'date':
      return ['equals', 'notEqual', 'greaterThan', 'lessThan', 'inRange']
    default:
      return []
  }
}

export const TableFilter: React.FC<TableFilterProps> = ({
  isOpen,
  onClose,
  column,
  type,
  onApply,
  initialValue
}) => {
  const [operator, setOperator] = useState<FilterCondition['operator']>(
    initialValue?.operator || (type === 'text' ? 'contains' : 'equals')
  )
  const [value, setValue] = useState<string>(initialValue?.value?.toString() || '')
  const [valueTo, setValueTo] = useState<string>(initialValue?.valueTo?.toString() || '')

  useEffect(() => {
    if (!isOpen) {
      setOperator(initialValue?.operator || (type === 'text' ? 'contains' : 'equals'))
      setValue(initialValue?.value?.toString() || '')
      setValueTo(initialValue?.valueTo?.toString() || '')
    }
  }, [isOpen])

  const handleApply = () => {
    const condition: FilterCondition = {
      type,
      operator,
      value: type === 'number' ? Number(value) : value,
      ...(operator === 'inRange' && { valueTo: type === 'number' ? Number(valueTo) : valueTo })
    }
    onApply(condition)
    onClose()
  }

  const handleClear = () => {
    setOperator(type === 'text' ? 'contains' : 'equals')
    setValue('')
    setValueTo('')
    onApply({
      type,
      operator: type === 'text' ? 'contains' : 'equals',
      value: null
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
      <div className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">
              Filter: {column}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Operator Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as FilterCondition['operator'])}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {getOperatorsForType(type).map((op) => (
                <option key={op} value={op}>
                  {operatorLabels[op]}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {operator === 'inRange' ? 'From' : 'Value'}
            </label>
            <input
              type={type === 'text' ? 'text' : type === 'number' ? 'number' : 'date'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={`Enter ${type === 'text' ? 'text' : type === 'number' ? 'number' : 'date'}...`}
            />
          </div>

          {/* Second Value Input (for range) */}
          {operator === 'inRange' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type={type === 'number' ? 'number' : 'date'}
                value={valueTo}
                onChange={(e) => setValueTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Enter ${type === 'number' ? 'number' : 'date'}...`}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
