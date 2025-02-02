import { API_URL, ENDPOINTS } from "../config/constants";

export interface TableDataResponse {
  success: boolean;
  data: Record<string, unknown>[];
  columns: string[];
  total: number;
  message?: string;
}

interface EditRowRequest {
  table_name: string;
  row_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  table_id: string;
}

interface EditRowResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface FetchTableDataParams {
  page: number;
  pageSize: number;
}

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
      total: 0,
      message: "No authentication token found",
    };
  }

  try {
    console.log("Fetching table data for:", tableName, "with params:", params);

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

    console.log("Response status:", response.status);
    const contentType = response.headers.get("content-type");
    console.log("Content type:", contentType);

    let data;
    const rawResponse = await response.text();
    console.log("Raw response:", rawResponse);

    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return {
        success: false,
        data: [],
        columns: [],
        total: 0,
        message: "Invalid JSON response from server",
      };
    }

    if (!response.ok) {
      console.error("Error response:", data);
      return {
        success: false,
        data: [],
        columns: [],
        total: 0,
        message: data.message || `Failed to fetch data for table ${tableName}`,
      };
    }

    // Transform the response data to match expected format
    const transformedData = {
      success: true,
      data: Array.isArray(data.data) ? data.data : [],
      columns: Array.isArray(data.columns)
        ? data.columns
        : Array.isArray(data.data) && data.data.length > 0
        ? Object.keys(data.data[0])
        : [],
      total:
        typeof data.total === "number"
          ? data.total
          : Array.isArray(data.data)
          ? data.data.length
          : 0,
      message: data.message,
    };

    console.log("Transformed data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error fetching table data:", error);
    return {
      success: false,
      data: [],
      columns: [],
      total: 0,
      message:
        error instanceof Error
          ? error.message
          : `Failed to fetch data for table ${tableName}`,
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
