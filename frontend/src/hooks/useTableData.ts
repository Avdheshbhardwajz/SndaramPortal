import { useState, useEffect, useCallback } from "react";
import { fetchTableData, PaginationData } from "../services/tableDataService";

interface UseTableDataProps {
  tableName: string;
  pageSize: number;
}

export interface UseTableDataReturn {
  data: Record<string, unknown>[];
  columns: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pagination: PaginationData;
  setCurrentPage: (page: number) => void;
}

export const useTableData = ({
  tableName,
  pageSize,
}: UseTableDataProps): UseTableDataReturn => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize,
  });

  const fetchDataFromApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchTableData(tableName, {
        page: pagination.currentPage,
        pageSize,
      });

      if (response.success) {
        setData(response.data);
        setColumns(response.columns);
        setPagination(response.pagination);
      } else {
        setError(response.message || "Failed to fetch table data");
        // Reset data but keep current pagination settings
        setData([]);
        setColumns([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      // Reset data but keep current pagination settings
      setData([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  }, [tableName, pagination.currentPage, pageSize]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchDataFromApi();
  }, [fetchDataFromApi]);

  // Handle page changes
  const setCurrentPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  // Reset to first page when table name or page size changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      pageSize,
    }));
  }, [tableName, pageSize]);

  return {
    data,
    columns,
    isLoading,
    error,
    refresh: fetchDataFromApi,
    pagination,
    setCurrentPage,
  };
};
