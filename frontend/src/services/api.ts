import axios from "axios";
import { RequestDataPayload, RequestDataResponse } from "../types/requestData";
import { ChangeTrackerResponse } from "../types/checkerData";

interface ChangeTrackerData {
  table_name: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  maker: string;
  checker: string | null;
  created_at: string;
  updated_at: string;
  comments: string | null;
  request_id: string;
  table_id: string | null;
  row_id: string;
}

interface ApproveRejectResponse {
  success: boolean;
  message: string;
  data?: ChangeTrackerData;
}

interface AdminNotificationData {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface Notification {
  type: "change" | "add_row";
  table_name: string;
  status: string;
  approver: string;
  updated_at: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  comments: string | null;
  request_id: string;
  maker?: string;
  pending_count?: number;
  isAdminNotification?: boolean;
}

interface NotificationResponse {
  success: boolean;
  notifications?: Notification[];
  data?: AdminNotificationData[];
  message?: string;
}

const API_BASE_URL = "http://localhost:8080";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const submitRequestData = async (
  payload: RequestDataPayload
): Promise<RequestDataResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requestdata`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchChangeTrackerData =
  async (): Promise<ChangeTrackerResponse> => {
    try {
      const response = await axios.get<ChangeTrackerResponse>(
        `${API_BASE_URL}/fetchchangetrackerdata`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

export const approveChange = async (
  row_id: string,
  request_id: string,
  comments?: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(
      `${API_BASE_URL}/approve`,
      {
        row_id,
        request_id,
        comments,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const rejectChange = async (
  row_id: string,
  comments: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(
      `${API_BASE_URL}/reject`,
      {
        row_id,
        comments: comments,
      },
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to reject change");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const approveAllChanges = async (
  rowIds: string[],
  comments?: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(
      `${API_BASE_URL}/allApprove`,
      {
        row_ids: rowIds,
        comments,
      },
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to approve changes");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const rejectAllChanges = async (
  rowIds: string[],
  comments: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await axios.post<ApproveRejectResponse>(
      `${API_BASE_URL}/allReject`,
      {
        row_ids: rowIds,
        comments: comments,
      },
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to reject changes");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const fetchCheckerActivities = async (): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    request_id: string;
    table_name: string;
    status: "approved" | "rejected";
    updated_at: string;
    reason?: string;
    comments?: string;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
  }>;
}> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/getallcheckerrequest`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch checker activities"
      );
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchGroupList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getgrouplist`, {
      headers: getAuthHeaders(),
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch group list");
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchCheckerNotifications = async (
  role: "checker" | "maker" | "admin"
): Promise<NotificationResponse> => {
  try {
    let endpoint;
    switch (role) {
      case "admin":
        endpoint = "/admin-notification";
        break;
      case "maker":
        endpoint = "/maker-notification";
        break;
      case "checker":
        endpoint = "/checker-notification";
        break;
      default:
        throw new Error("Invalid role");
    }

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...getAuthHeaders(),
        "X-User-Role": role,
      },
    });

    if (response.data.success) {
      if (role === "admin" && response.data.data) {
        const transformedNotifications = response.data.data.map(
          (item: AdminNotificationData) => ({
            type: "change" as const,
            table_name: item.table_name,
            status: "pending",
            approver: "",
            updated_at: item.created_at,
            comments: `${item.pending_count} pending changes`,
            request_id: `${item.table_name}-${item.maker}`,
            maker: item.maker,
            pending_count: item.pending_count,
            isAdminNotification: true,
          })
        );
        return {
          success: true,
          notifications: transformedNotifications,
        };
      }
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch notifications");
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error;
};
