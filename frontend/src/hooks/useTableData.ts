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
  setPageSize: (size: number) => void;
  totalRecords: number;
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
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadTableData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTableData(tableName, page, currentPageSize);
      setData(result.data);
      setCurrentPage(result.pagination.currentPage);
      setTotalPages(result.pagination.totalPages);
      setTotalRecords(result.pagination.total);
      
      if (result.data.length > 0) {
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
      console.error('Error loading table data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load table data');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload data when tableName or pageSize changes
  useEffect(() => {
    loadTableData(1); // Reset to first page when these dependencies change
  }, [tableName, currentPageSize]);

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.column === column) {
        if (prevConfig.direction === 'asc') {
          return { column, direction: 'desc' };
        }
        return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    loadTableData(1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await loadTableData(page);
  };

  const handleFilter = (newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    loadTableData(1);
  };

  const setPageSize = (size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const refresh = () => loadTableData(currentPage);

  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (sortConfig.column && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.column!];
        const bValue = b[sortConfig.column!];
        if (aValue === bValue) return 0;
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, sortConfig]);

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
    setPageSize,
    totalRecords,
  };
};
