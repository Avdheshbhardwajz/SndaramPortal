import React, { useState } from 'react'
import { Pagination } from './Pagination'
import { useTableData } from '../hooks/useTableData'
import { useColumnPermissions } from '../hooks/useColumnPermissions'
import { EditRowDrawer } from './EditRowDrawer'
import { TableHeader } from './table/TableHeader'
import { TableColumnHeader } from './table/TableColumnHeader'
import { TableBody } from './table/TableBody'
import type { FilterCondition } from './TableFilter'

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
  }

  const handleRowSave = (updatedRow: Record<string, any>) => {
    if (onRowEdit) {
      onRowEdit(updatedRow)
    }
    handleDrawerClose()
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
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    handleSearch(value)
  }

  if (isDataLoading || isPermissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (dataError || permissionsError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {dataError || permissionsError}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* Table Container */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-50">
              <tr>
                {/* Action Column Header - Sticky */}
                {onRowEdit && (
                  <th 
                    className="sticky left-0 z-30 py-3 px-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
                    style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}
                  >
                    Actions
                  </th>
                )}
                
                {/* Data Columns Headers */}
                {columns.map((column) => {
                  const firstRowValue = processedData[0]?.[column]
                  const columnType = getColumnType(firstRowValue)
                  const isEditable = isColumnEditable(column)
                  
                  return (
                    <TableColumnHeader
                      key={column}
                      column={column}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      filterColumn={filterColumn}
                      activeFilters={activeFilters}
                      onFilterClick={handleFilterClick}
                      onFilterApply={handleFilterApply}
                      columnType={columnType}
                      isEditable={isEditable}
                    />
                  )
                })}
              </tr>
            </thead>
            
            <TableBody
              data={processedData}
              columns={columns}
              onRowEdit={onRowEdit ? handleEditClick : undefined}
              isColumnEditable={isColumnEditable}
            />
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 rounded-b-lg">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Edit/Add Drawer */}
      <EditRowDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        row={selectedRow}
        columns={isAddMode ? columns : getEditableColumns(columns)}
        onSave={handleRowSave}
        mode={isAddMode ? 'add' : 'edit'}
      />
    </div>
  )
}
