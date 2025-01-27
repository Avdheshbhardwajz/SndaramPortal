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
import { addRow } from '../services/tableDataService'
import { toast } from 'react-toastify'

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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export const DynamicTable: React.FC<DynamicTableProps> = ({
  tableName,
  pageSize: initialPageSize = 10,
  onRowEdit
}) => {
  const [editMode, setEditMode] = useState<'edit' | 'add'>('edit')
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterColumn, setFilterColumn] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [localPageSize, setLocalPageSize] = useState(initialPageSize)

  const {
    data,
    processedData,
    columns,
    isLoading,
    error,
    currentPage,
    totalPages,
    sortConfig,
    filters,
    handleSort,
    handleSearch,
    handlePageChange,
    handleFilter,
    refresh: refreshData,
    setPageSize,
    totalRecords
  } = useTableData({ tableName, pageSize: localPageSize })

  const {
    isColumnEditable,
    getEditableColumns,
    error: permissionsError,
  } = useColumnPermissions(tableName)

  const handleAddClick = () => {
    setEditMode('add')
    setSelectedRow(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (row: Record<string, any>) => {
    setEditMode('edit')
    setSelectedRow(row)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedRow(null)
  }

  const handleSave = async (updatedRow: Record<string, any>) => {
    try {
      if (editMode === 'edit' && selectedRow) {
        await requestRowEdit({
          table_name: tableName,
          row_id: selectedRow.id,
          old_values: selectedRow,
          new_values: updatedRow,
          table_id: tableName
        })
      } else if (editMode === 'add') {
        await addRow({
          table_name: tableName,
          row_data: updatedRow
        })
      }
      
      // Show success message
      toast.success(editMode === 'edit' ? 'Row edit request submitted successfully' : 'Row add request submitted successfully')
      
      // Refresh the table data
      await refreshData()
      
      // Close the drawer
      handleDrawerClose()
    } catch (error) {
      console.error('Error saving row:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save row')
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || permissionsError) {
    return <div>Error loading table data</div>
  }

  const editableColumns = getEditableColumns()

  // Use all columns for display instead of just editable ones
  const displayColumns = columns

  return (
    <div className="bg-white rounded-lg shadow flex flex-col">
      <TableHeader
        onSearch={handleSearch}
        onAddClick={handleAddClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Action Column Header */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-20 bg-gray-50">
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

      <div className="mt-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Showing {Math.min((currentPage - 1) * localPageSize + 1, processedData.length)} - {Math.min(currentPage * localPageSize, processedData.length)} of {totalRecords} results
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-500 whitespace-nowrap">
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={localPageSize}
              onChange={(e) => {
                const newPageSize = Number(e.target.value)
                setLocalPageSize(newPageSize)
                setPageSize(newPageSize)
              }}
              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end w-full sm:w-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <EditRowDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        row={selectedRow}
        columns={displayColumns}
        onSave={handleSave}
        mode={editMode}
        isColumnEditable={isColumnEditable}
      />
    </div>
  )
}
