import { API_URL, ENDPOINTS } from "../config/constants";

// API Response Types
export interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TableDataResponse {
  success: boolean;
  data: Record<string, unknown>[];
  columns: string[];
  message?: string;
  pagination: PaginationData;
}

export interface EditRowRequest {
  table_name: string;
  row_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  table_id: string;
}

export interface EditRowResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface FetchTableDataParams {
  page: number;
  pageSize: number;
}

const DEFAULT_PAGINATION: PaginationData = {
  total: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
};

export const fetchTableData = async (
  tableName: string,
  params: FetchTableDataParams
): Promise<TableDataResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      success: false,
      data: [],
      columns: [],
      message: "No authentication token found",
      pagination: DEFAULT_PAGINATION,
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/tableData/${tableName}?page=${params.page}&pageSize=${params.pageSize}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: [],
        columns: [],
        message: data.message || `Failed to fetch data for table ${tableName}`,
        pagination: DEFAULT_PAGINATION,
      };
    }

    // Transform and validate the response data
    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : [],
      columns: Array.isArray(data.columns)
        ? data.columns
        : Array.isArray(data.data) && data.data.length > 0
        ? Object.keys(data.data[0])
        : [],
      message: data.message,
      pagination: {
        total: data.pagination?.total ?? 0,
        totalPages:
          data.pagination?.totalPages ??
          Math.ceil((data.pagination?.total ?? 0) / params.pageSize),
        currentPage: data.pagination?.currentPage ?? params.page,
        pageSize: data.pagination?.pageSize ?? params.pageSize,
      },
    };
  } catch (error) {
    console.error("Error fetching table data:", error);
    return {
      success: false,
      data: [],
      columns: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch table data",
      pagination: DEFAULT_PAGINATION,
    };
  }
};

export const requestRowEdit = async (
  editData: EditRowRequest
): Promise<EditRowResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.TABLE.REQUEST_DATA}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit edit request");
    }

    return data;
  } catch (error) {
    console.error("Error submitting edit request:", error);
    throw error;
  }
};
