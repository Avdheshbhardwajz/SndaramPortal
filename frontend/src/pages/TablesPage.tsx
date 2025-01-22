import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { TableCard } from '../components/TableCard'
import { Pagination } from '../components/Pagination'
import { fetchTables } from '../services/tableService'

interface Table {
  table_name: string
}

export const TablesPage: React.FC = () => {
  // State management
  const [tables, setTables] = useState<Table[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Constants
  const TABLES_PER_PAGE = 6
  const navigate = useNavigate()
  const firstName = localStorage.getItem('firstName') || ''
  const role = localStorage.getItem('userRole') || ''

  // Fetch tables on component mount
  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchTables()
      if (response.success) {
        setTables(response.tables)
      } else {
        setError(response.message || 'Failed to fetch tables')
      }
    } catch (err) {
      console.log(err);
      
      setError('An error occurred while fetching tables')
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers
  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Derived state
  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTables.length / TABLES_PER_PAGE)
  const startIndex = (currentPage - 1) * TABLES_PER_PAGE
  const displayedTables = filteredTables.slice(startIndex, startIndex + TABLES_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header firstName={firstName} role={role} onLogout={handleLogout} />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 space-x-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Home
            </button>
            <span className="text-gray-600">/</span>
            <span className="text-blue-600">Data Management</span>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search table here..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-red-600 text-center py-8">
              {error}
            </div>
          )}

          {/* Tables Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayedTables.map((table, index) => (
                <TableCard
                  key={index}
                  tableName={table.table_name}
                  onClick={() => console.log(`Clicked table: ${table.table_name}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  )
}

export default TablesPage
