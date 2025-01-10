import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8080';

interface ErrorResponse {
  success: boolean;
  message: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const sendOTP = async (email: string): Promise<OTPResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || 'Failed to send OTP');
    }
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (email: string, otp: string): Promise<OTPResponse> => {
  try {
    console.log('Verifying OTP for email:', email);
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, OTP: otp });
    console.log('Verify OTP Response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'OTP verification failed');
    }
    
    if (!response.data.token) {
      throw new Error('No token received from server');
    }
    
    if (!response.data.user || !response.data.user.role) {
      throw new Error('Invalid user data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('OTP Verification Error:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || 'Failed to verify OTP');
    }
    throw error;
  }
};
