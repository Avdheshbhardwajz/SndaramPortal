import axios, { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

export type UserRole = "maker" | "checker" | "admin";

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  isDisabled?: boolean;
}

export interface UserApiResponse {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "http://localhost:8080";

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

export const createUser = async (userData: User) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
    }, {
      headers: getAuthHeaders()
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
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      const transformedData = response.data.data.map((user: any) => ({
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        isDisabled: !user.active
      }));
      return {
        success: true,
        data: transformedData,
        message: response.data.message
      };
    }
    
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
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to update user"
    );
  }
};

export const toggleUserActive = async (email: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/isactive`,
      { email },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to toggle user status"
    );
  }
};
