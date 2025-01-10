'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectedTableState } from '@/types/tables'
import { useTables } from '@/hooks/useTables'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { GridTable } from '@/components/grid/GridTable'
import MainContent from '@/components/MainContent'
import { useToast } from '@/hooks/use-toast'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { tables, isLoading: isTablesLoading, error: tablesError } = useTables()
  
  const [selectedTable, setSelectedTable] = useState<SelectedTableState>({
    name: null,
    filename: null
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Handle table errors
  useEffect(() => {
    if (tablesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: tablesError
      })
    }
  }, [tablesError, toast])

  const handleLogout = () => {
    localStorage.removeItem('makerToken')
    localStorage.removeItem('userData');
    navigate('/login')
  }

  // Show loading state
  if (isTablesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Header 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleLogout={handleLogout}
          />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          isLoading={isTablesLoading}
          error={tablesError}
          tables={tables}
          setSelectedTable={setSelectedTable}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {selectedTable.name && selectedTable.filename ? (
            <GridTable tableName={selectedTable.filename} />
          ) : (
            <MainContent />
          )}
        </main>
      </div>
    </div>
  )
}