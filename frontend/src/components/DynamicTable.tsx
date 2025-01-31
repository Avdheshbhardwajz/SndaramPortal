import React, { useState } from 'react'
import { Pagination } from './Pagination'
import { useTableData } from '../hooks/useTableData'
import { useColumnPermissions } from '../hooks/useColumnPermissions'
import { EditRowDrawer } from './EditRowDrawer'
import { TableHeader } from './table/TableHeader'
import { TableColumnHeader } from './table/TableColumnHeader'
import { TableBody } from './table/TableBody'
import type { FilterCondition } from './TableFilter'
import { requestRowEdit } from '../services/tableDataService'

interface DynamicTableProps {
  tableName: string
  pageSize?: number
  onRowEdit?: (updatedRow: Record<string, any>) => void
}

// Helper function to determine column type
const getColumnType = (value: any): 'text' | 'number' | 'date' => {
  if (typeof value === 'number') return 'number'
  if (value instanceof Date) return 'date'
  return 'text'
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  tableName,
  pageSize,
  onRowEdit
}) => {
  const {
    processedData,
    columns,
    currentPage,
    totalPages,
    isLoading: isDataLoading,
    error: dataError,
    sortConfig,
    handleSort,
    handleSearch,
    handlePageChange,
    handleFilter,
    refresh: refreshData,
  } = useTableData({ tableName, pageSize })

  const {
    isColumnEditable,
    getEditableColumns,
    isLoading: isPermissionsLoading,
    error: permissionsError
  } = useColumnPermissions(tableName)

  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterCondition>>({})
  const [filterColumn, setFilterColumn] = useState<string | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEditClick = (row: Record<string, any>) => {
    setSelectedRow(row)
    setIsAddMode(false)
    setIsDrawerOpen(true)
  }

  const handleAddClick = () => {
    setSelectedRow({})
    setIsAddMode(true)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setSelectedRow(null)
    setIsAddMode(false)
    setIsDrawerOpen(false)
    setError(null)
  }

  const handleRowSave = async (updatedRow: Record<string, any>) => {
    try {
      setError(null)
      
      if (!selectedRow) {
        throw new Error('No row selected for editing')
      }

      const editData = {
        table_name: tableName,
        row_id: String(selectedRow.id || selectedRow[`${tableName}_sk`] || selectedRow[`${tableName}_id`]),
        old_values: selectedRow,
        new_values: updatedRow,
        table_id: tableName
      }

      const response = await requestRowEdit(editData)

      if (response.success) {
        if (onRowEdit) {
          onRowEdit(updatedRow)
        }
        handleDrawerClose()
        // Refresh the table data to show the pending status
        refreshData()
      } else {
        setError(response.message || 'Failed to submit edit request')
      }
    } catch (err) {
      console.error('Error saving row:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    }
  }

  const handleFilterClick = (column: string) => {
    setFilterColumn(filterColumn === column ? null : column)
  }

  const handleFilterApply = (column: string, condition: FilterCondition) => {
    const newFilters = { ...activeFilters }
    if (condition.value === null) {
      delete newFilters[column]
    } else {
      newFilters[column] = condition
    }
    setActiveFilters(newFilters)
    handleFilter(newFilters)
    setFilterColumn(null)
  }

  if (isDataLoading || isPermissionsLoading) {
    return <div>Loading...</div>
  }

  if (dataError || permissionsError) {
    return <div>Error loading table data</div>
  }

  // Use all columns for display
  const displayColumns = columns

  return (
    <div className="bg-white rounded-lg shadow">
      <TableHeader
        onSearch={handleSearch}
        onAddClick={handleAddClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {/* Action Column Header */}
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10">
                Action
              </th>
              {displayColumns.map((column) => (
                <TableColumnHeader
                  key={column}
                  column={column}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onFilterClick={handleFilterClick}
                  isFilterActive={!!activeFilters[column]}
                  isFilterOpen={filterColumn === column}
                  onFilterApply={handleFilterApply}
                  type={getColumnType(processedData[0]?.[column])}
                  className={!isColumnEditable(column) ? 'bg-gray-50' : ''}
                />
              ))}
            </tr>
          </thead>
          <TableBody
            data={processedData}
            columns={displayColumns}
            onEditClick={handleEditClick}
            isEditable={isColumnEditable}
          />
        </table>
      </div>

      <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {processedData.length} results
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <EditRowDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        row={selectedRow}
        columns={displayColumns}
        onSave={handleRowSave}
        mode={isAddMode ? 'add' : 'edit'}
        isColumnEditable={isColumnEditable}
      />
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
