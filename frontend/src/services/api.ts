import axios from 'axios';
import { RequestDataPayload, RequestDataResponse } from '../types/requestData';
import { ChangeTrackerResponse } from '../types/checkerData';

interface ChangeTrackerData {
  table_name: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
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

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const submitRequestData = async (payload: RequestDataPayload): Promise<RequestDataResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requestdata`, payload, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchChangeTrackerData = async (): Promise<ChangeTrackerResponse> => {
  try {
    const response = await axios.get<ChangeTrackerResponse>(`${API_BASE_URL}/fetchchangetrackerdata`, {
      headers: getAuthHeaders()
    });
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
        comments
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
        comments: comments
      },
      { headers: getAuthHeaders() }
    );
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to reject change');
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
      `${API_BASE_URL}/approveall`,
      {
        row_ids: rowIds,
        comments
      },
      { headers: getAuthHeaders() }
    );
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to approve changes');
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
      `${API_BASE_URL}/rejectall`,
      {
        row_ids: rowIds,
        comments: comments
      },
      { headers: getAuthHeaders() }
    );
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to reject changes');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error;
};