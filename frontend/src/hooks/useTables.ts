import { useState, useEffect, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import { TableInfo, TablesResponse } from '@/types/tables'
import { useToast } from './use-toast'

// List of tables to hide
const HIDDEN_TABLES = [
  'otp_tracker',
  'add_row_table',
  'change_tracker',
  'column_permission',
  'dynamic_dropdowns',
  'group_table',
  'users'
].map(name => name.toLowerCase());

interface ErrorResponse {
  message: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await axios.get<TablesResponse>('http://localhost:8080/table', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.data?.success || !Array.isArray(response.data?.tables)) {
        throw new Error('Invalid response format')
      }

      const fetchedTables: TableInfo[] = response.data.tables
      .filter((row) => {
        const tableName = row.table_name.toLowerCase();
        return !HIDDEN_TABLES.includes(tableName);
      })
      .map((row) => {
        if (!row?.table_name) {
          throw new Error('Invalid table data format')
        }
        return {
          name: row.table_name.replace(/_/g, ' ').toLowerCase(),
          filename: row.table_name.toLowerCase()
        }
      })
      
      setTables(fetchedTables)
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      console.error('Error fetching tables:', error)
      
      const errorMessage = error.response?.data?.message 
        ? error.response.data.message 
        : (error.message || 'Failed to load tables')
      
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })

      // If token is invalid or expired, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('data')
        window.location.href = '/auth'
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const refreshTables = () => {
    fetchTables()
  }

  return {
    tables,
    isLoading,
    error,
    refreshTables
  }
}
