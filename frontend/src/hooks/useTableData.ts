import { useState, useEffect } from "react";
import { fetchTableData } from "../services/tableDataService";

interface UseTableDataProps {
  tableName: string;
  pageSize: number;
}

export interface UseTableDataReturn {
  data: Record<string, unknown>[];
  columns: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  totalPages: number;
  currentPage: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTableData(tableName, {
        page: currentPage,
        pageSize,
      });
      if (response.success) {
        setData(response.data);
        setColumns(response.columns);
        setTotalPages(Math.ceil(response.total / pageSize));
      } else {
        setError(response.message || "Failed to fetch table data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, currentPage, pageSize]);

  return {
    data,
    columns,
    isLoading,
    error,
    refresh: fetchData,
    totalPages,
    currentPage,
    setCurrentPage,
  };
};
