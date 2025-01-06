import axios, { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

const API_BASE_URL = "";

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
    const response = await axios.post(`${API_BASE_URL}/api/signup`, {
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
    const response = await axios.get(`${API_BASE_URL}/api/users`);
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
    const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, {
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

export const disableUser = async (userId: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/disableUser/${userId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to disable user"
    );
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete user"
    );
  }
};
