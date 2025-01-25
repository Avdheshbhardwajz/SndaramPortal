import { useState, useEffect, useMemo } from 'react';
import { fetchTableData, TableDataResponse } from '../services/tableDataService';

interface TableData {
  [key: string]: any;
}

interface UseTableDataProps {
  tableName: string;
  pageSize?: number;
}

interface SortConfig {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

interface FilterConfig {
  [key: string]: {
    operator: string;
    value: any;
    valueTo?: any;
  };
}

interface UseTableDataReturn {
  data: TableData[];
  processedData: TableData[];
  columns: string[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  sortConfig: SortConfig;
  filters: FilterConfig;
  handleSort: (column: string) => void;
  handleSearch: (query: string) => void;
  handlePageChange: (page: number) => void;
  handleFilter: (filters: FilterConfig) => void;
  refresh: () => Promise<void>;
}

export const useTableData = ({ tableName, pageSize = 10 }: UseTableDataProps): UseTableDataReturn => {
  const [data, setData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // In the future, this will be replaced with API calls
  const sortData = (data: TableData[], config: SortConfig): TableData[] => {
    if (!config.column || !config.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[config.column!];
      const bValue = b[config.column!];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return config.direction === 'asc' ? comparison : -comparison;
    });
  };

  // In the future, this will be replaced with API calls
  const filterData = (data: TableData[], query: string): TableData[] => {
    if (!query) return data;

    const searchLower = query.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    );
  };

  const loadTableData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTableData(tableName, page, pageSize);
      setData(result.data);
      setCurrentPage(result.pagination.currentPage);
      setTotalPages(result.pagination.totalPages);
      
      if (result.data.length > 0) {
        // Get all columns from the first row, excluding internal fields
        const allColumns = Object.keys(result.data[0]);
        setColumns(allColumns.filter(col => 
          !col.startsWith('_') && 
          col !== 'actions' && 
          col !== 'id' && 
          !col.endsWith('_sk') && 
          !col.endsWith('_id')
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching table data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTableData(currentPage);
  }, [tableName, currentPage]);

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => ({
      column,
      direction:
        prevConfig.column === column
          ? prevConfig.direction === 'asc'
            ? 'desc'
            : prevConfig.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // In the future, this will trigger an API call with the search query
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In the future, this will be handled by the API with proper pagination
  };

  const handleFilter = (filters: FilterConfig) => {
    setFilters(filters);
    setCurrentPage(1);
  };

  const processedData = useMemo(() => {
    let result = data;
    
    // Apply search filter
    result = filterData(result, searchQuery);
    
    // Apply column filters
    result = result.filter(row => {
      return Object.entries(filters).every(([column, condition]) => {
        const value = row[column];
        const filterValue = condition.value;

        switch (condition.operator) {
          case 'equals':
            return value === filterValue;
          case 'notEqual':
            return value !== filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'notContains':
            return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'greaterThan':
            return value > filterValue;
          case 'greaterThanOrEqual':
            return value >= filterValue;
          case 'lessThan':
            return value < filterValue;
          case 'lessThanOrEqual':
            return value <= filterValue;
          case 'inRange':
            return value >= filterValue && value <= condition.valueTo;
          default:
            return true;
        }
      });
    });
    
    // Apply sorting
    result = sortData(result, sortConfig);
    
    return result;
  }, [data, searchQuery, sortConfig, filters]);

  const refresh = async () => {
    await loadTableData(currentPage);
  };

  return {
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
    refresh,
  };
};
