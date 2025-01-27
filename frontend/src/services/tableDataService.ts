import { config } from '../config/env'
import { API_URL, ENDPOINTS } from '../config/constants'

export interface TableDataResponse {
  success: boolean
  data: any[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  error?: string
}

interface EditRowRequest {
  table_name: string
  row_id: string
  old_values: Record<string, any>
  new_values: Record<string, any>
  table_id: string
}

interface EditRowResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export interface AddRowRequest {
  table_name: string;
  row_data: Record<string, any>;
}

export interface AddRowResponse {
  success: boolean;
  message: string;
  request_id?: string;
}

export const fetchTableData = async (
  tableName: string,
  page: number = 1,
  pageSize: number = 10
): Promise<TableDataResponse> => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/tableData/${tableName}?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch table data')
    }

    const data: TableDataResponse = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching data for table ${tableName}:`, error)
    throw error
  }
}

export const requestRowEdit = async (editData: EditRowRequest): Promise<EditRowResponse> => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.TABLE.REQUEST_DATA}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit edit request')
    }

    return data
  } catch (error) {
    console.error('Error submitting edit request:', error)
    throw error
  }
}

export const addRow = async (request: AddRowRequest): Promise<AddRowResponse> => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.TABLE.ADD_ROW}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add row')
    }

    return data
  } catch (error) {
    console.error('Error adding row:', error)
    throw error
  }
}
