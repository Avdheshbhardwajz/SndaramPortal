import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../components/Header"
import { TableCard } from "../components/TableCard"
import { Pagination } from "../components/Pagination"
import { DynamicTable } from "../components/DynamicTable"
import { PageSizeSelector } from "../components/PageSizeSelector"
import { fetchTables } from "../services/tableService"

interface Table {
  table_name: string;
}

export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)
  const [tableKey, setTableKey] = useState(0)
  const [tablesPerPage, setTablesPerPage] = useState(12) // Default to 12 tables
  const gridRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()
  const firstName = localStorage.getItem("firstName") || ""
  const role = localStorage.getItem("userRole") || ""

  useEffect(() => {
    loadTables()
  }, [])

  // Calculate tables per page based on viewport height
  useEffect(() => {
    const calculateTablesPerPage = () => {
      if (gridRef.current) {
        const gridRect = gridRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const availableHeight = viewportHeight - gridRect.top - 20 // Reduced margin
        const cardHeight = 90 // Reduced card height
        const cardGap = 16 // Gap between cards
        const rows = Math.floor((availableHeight + cardGap) / (cardHeight + cardGap))
        const cols = window.innerWidth >= 1536 ? 4 : window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1
        const calculatedTablesPerPage = rows * cols
        setTablesPerPage(Math.max(calculatedTablesPerPage, 8)) // Minimum 8 tables
        setCurrentPage(1)
      }
    }

    calculateTablesPerPage()
    window.addEventListener('resize', calculateTablesPerPage)
    return () => window.removeEventListener('resize', calculateTablesPerPage)
  }, [])

  const loadTables = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchTables()
      if (response.success) {
        setTables(response.tables)
      } else {
        setError(response.message || "Failed to fetch tables")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching tables")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setTableKey(prev => prev + 1)
  }

  const handleRowEdit = async (updatedRow: Record<string, any>) => {
    try {
      // TODO: Implement API call to update the row
      console.log('Updated row:', updatedRow)
      
      // Optionally refresh the table data after successful update
      // You can implement this using your data fetching logic
    } catch (error) {
      console.error('Error updating row:', error)
    }
  }

  const filteredTables = tables.filter((table) => 
    table.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTables.length / tablesPerPage)
  const startIndex = (currentPage - 1) * tablesPerPage
  const displayedTables = filteredTables.slice(startIndex, startIndex + tablesPerPage)

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex flex-col">
        <Header firstName={firstName} role={role} onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <Header firstName={firstName} role={role} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-4 flex-shrink-0">
          {/* Top Bar with Breadcrumb and Search */}
          <div className="max-w-[1400px] mx-auto flex items-center justify-between ">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedTable) {
                    setSelectedTable(null)
                  } else {
                    navigate("/dashboard")
                  }
                }}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 19L8 12L15 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {selectedTable ? 'Back to Tables' : 'Home'}
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600 font-medium">
                {selectedTable ? selectedTable : 'Data Management'}
              </span>
            </div>

            {/* Search Bar - Only show when no table is selected */}
            {!selectedTable && (
              <div className="relative w-[300px]">
                <input
                  type="text"
                  placeholder="Search table here..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="max-w-[1400px] mx-auto">
              <div className="text-red-600 p-4 text-center bg-red-50 rounded-lg mb-6">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="max-w-[1600px] mx-auto h-full">
            {selectedTable ? (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <PageSizeSelector
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
                <div className="flex-1 min-h-0 ">
                  <DynamicTable
                    key={tableKey}
                    tableName={selectedTable}
                    pageSize={pageSize}
                    onRowEdit={handleRowEdit}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  {/* Grid of Table Cards */}
                  <div 
                    ref={gridRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-max"
                  >
                    {displayedTables.map((table) => (
                      <TableCard
                        key={table.table_name}
                        tableName={table.table_name}
                        onClick={() => setSelectedTable(table.table_name)}
                      />
                    ))}
                  </div>
                </div>

                {/* Only show pagination if there are more tables than can fit */}
                {totalPages > 1 && filteredTables.length > tablesPerPage && (
                  <div className="flex-shrink-0 pt-3 border-t mt-3">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TablesPage
