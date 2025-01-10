import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosError, CanceledError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { RowData, ColumnConfig, EditType } from "@/types/grid";

interface UseGridDataProps {
  tableName: string;
  initialPageSize?: number;
}

interface ApiResponse {
  success: boolean;
  data: RowData[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface ErrorResponse {
  success: boolean;
  error: string;
  details?: string;
}

interface ColumnPermission {
  column_name: string;
  column_status: "editable" | "non-editable";
}

interface ColumnPermissionResponse {
  success: boolean;
  column_list: ColumnPermission[];
}

export const useGridData = ({
  tableName,
  initialPageSize = 20,
}: UseGridDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnConfigs, setColumnConfigs] = useState<Record<string, ColumnConfig>>({});
  const [columnPermissions, setColumnPermissions] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: initialPageSize,
  });

  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('data');
    window.location.href = '/auth';
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const getColumnEditType = useCallback(
    (header: string): EditType | undefined => {
      if (!columnPermissions[header]) {
        return EditType.TEXT;
      }

      if (header.includes("date") || header.includes("_on")) {
        return EditType.DATE;
      }
      if (header.includes("email")) {
        return EditType.TEXT;
      }
      if (
        header.includes("phone") ||
        header.includes("telephone") ||
        header.includes("fax")
      ) {
        return EditType.TEXT;
      }
      if (header.includes("pin") || header.includes("number")) {
        return EditType.NUMBER;
      }
      if (
        header.includes("state") ||
        header.includes("zone") ||
        header.includes("category")
      ) {
        return EditType.SELECT;
      }
      return EditType.TEXT;
    },
    [columnPermissions]
  );

  const formatHeaderName = useCallback((header: string): string => {
    return header
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const createColumnConfigs = useCallback(
    (data: RowData) => {
      const configs: Record<string, ColumnConfig> = {};
      Object.keys(data).forEach((header) => {
        const formattedHeader = formatHeaderName(header);
        configs[header] = {
          field: header,
          headerName: formattedHeader,
          displayName: formattedHeader,
          isEditable: false,
          editType: getColumnEditType(header),
        };
      });
      return configs;
    },
    [formatHeaderName, getColumnEditType]
  );

  const fetchColumnPermissions = useCallback(async () => {
    if (!tableName) {
      console.error("Table name is required for fetching column permissions");
      return;
    }

    try {
      const response = await axios.post<ColumnPermissionResponse>(
        "http://localhost:8080/columnPermission",
        {
          table_name: tableName,
          action: "get",
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        const permissions: Record<string, boolean> = {};
        if (rowData.length > 0) {
          Object.keys(rowData[0]).forEach((col) => {
            permissions[col] = false;
          });
        }
        response.data.column_list.forEach((col) => {
          permissions[col.column_name] = col.column_status === "editable";
        });
        setColumnPermissions(permissions);

        setColumnConfigs((prev) => {
          const newConfigs = { ...prev };
          Object.keys(newConfigs).forEach((key) => {
            newConfigs[key] = {
              ...newConfigs[key],
              isEditable: permissions[key] || false,
            };
          });
          return newConfigs;
        });
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 401) {
        handleAuthError();
        return;
      }
      
      const errorMessage = err.response?.data?.error || 'Failed to fetch column permissions';
      console.error("Error fetching column permissions:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [tableName, toast, rowData, getAuthHeaders, handleAuthError]);

  const fetchData = useCallback(
    async (page: number, pageSize: number) => {
      if (!tableName) {
        console.error("Table name is required");
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.get<ApiResponse>(
          `http://localhost:8080/tableData/${tableName}`,
          {
            params: {
              page,
              pageSize,
            },
            headers: getAuthHeaders(),
            signal: abortControllerRef.current.signal,
          }
        );

        if (response.data.success) {
          setRowData(response.data.data);
          setPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));

          if (response.data.data.length > 0) {
            setHeaders(Object.keys(response.data.data[0]));
            setColumnConfigs(createColumnConfigs(response.data.data[0]));
            await fetchColumnPermissions();
          }
          setError(null);
        } else {
          throw new Error('Failed to fetch table data');
        }
      } catch (error) {
        if (error instanceof CanceledError) {
          return;
        }

        const err = error as AxiosError<ErrorResponse>;
        if (err.response?.status === 401) {
          handleAuthError();
          return;
        }

        const errorMessage = err.response?.data?.error || 'Failed to fetch table data';
        console.error("Error fetching table data:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, createColumnConfigs, fetchColumnPermissions, toast, getAuthHeaders, handleAuthError]
  );

  const handlePageSizeChange = useCallback(async (newPageSize: number) => {
    setIsLoading(true);
    
    try {
      setPagination((prev) => ({
        ...prev,
        pageSize: newPageSize,
        currentPage: 1,
      }));

      const response = await axios.get<ApiResponse>(
        `http://localhost:8080/tableData/${tableName}`,
        {
          params: {
            page: 1,
            pageSize: newPageSize,
          },
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setRowData(response.data.data);
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
          pageSize: newPageSize,
          currentPage: 1,
        }));
        setError(null);
      } else {
        throw new Error('Failed to fetch table data');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 401) {
        handleAuthError();
        return;
      }

      const errorMessage = err.response?.data?.error || 'Failed to fetch table data';
      console.error("Error fetching table data:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tableName, toast, getAuthHeaders, handleAuthError]);

  useEffect(() => {
    if (!tableName) return;

    const controller = new AbortController();

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        total: 0,
        totalPages: 0,
      }));

      try {
        await fetchColumnPermissions();
        await fetchData(1, pagination.pageSize);
      } catch (error) {
        console.error("Error loading initial data:", error);
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.error || error.message
            : "Failed to load data";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    return () => {
      controller.abort();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [tableName]);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchData(page, pagination.pageSize);
  }, [pagination.pageSize, fetchData]);

  const refreshData = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  return {
    isLoading,
    error,
    rowData,
    headers,
    columnConfigs,
    columnPermissions,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refreshData,
  };
};
