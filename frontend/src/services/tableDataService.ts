import { config } from '../config/env';

export interface TableDataResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  error?: string;
}

export const fetchTableData = async (
  tableName: string,
  page: number = 1,
  pageSize: number = 10
): Promise<TableDataResponse> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
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
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch table data');
    }

    const data: TableDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data for table ${tableName}:`, error);
    throw error;
  }
};
