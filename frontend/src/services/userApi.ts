import axios, { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

interface UserActiveResponse {
  user_id: string;
  active: boolean;
  updated_at: string;
}

interface CellHighlight {
  table_id: string;
  row_id: string;
  changed_fields: string[];
}

const API_BASE_URL = "http://localhost:8080";

export type UserRole = "maker" | "checker";

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  isDisabled?: boolean;
}

export const createUser = async (userData: User) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to create user"
    );
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch users"
    );
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
      email: userData.email,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
      password: userData.password,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to update user"
    );
  }
};

export const toggleUserActive = async (userId: string): Promise<{ success: boolean; message: string; data?: UserActiveResponse }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/isactive`, {
      user_id: userId
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      }
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || 'Failed to update user status');
  }
};

export const getHighlightedCells = async (userId: string): Promise<{ success: boolean; data: CellHighlight[] }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/highlight-cells`, {
      userId
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      }
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch highlighted cells');
  }
};
