import { useState } from 'react';
import axios from 'axios';

interface OtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    user_id: string;
    email: string;
    role: 'admin' | 'maker' | 'checker';
    first_name: string;
    last_name: string;
  };
}

interface OtpHookReturn {
  email: string;
  otp: string;
  isOtpSent: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  sendOtp: () => Promise<boolean>;
  verifyOtp: () => Promise<OtpResponse | null>;
}

export const useOtp = (): OtpHookReturn => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await axios.post<OtpResponse>('http://localhost:8080/send-otp', { email });
      
      if (response.data.success) {
        setIsOtpSent(true);
        return true;
      } else {
        setError(response.data.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
      return false;
    }
  };

  const verifyOtp = async (): Promise<OtpResponse | null> => {
    try {
      setError(null);
      const response = await axios.post<OtpResponse>('http://localhost:8080/verify-otp', {
        email,
        OTP: otp // Note: Backend expects 'OTP' not 'otp'
      });

      if (response.data.success) {
        return response.data;
      } else {
        setError(response.data.message);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
      return null;
    }
  };

  return {
    email,
    otp,
    isOtpSent,
    error,
    setEmail,
    setOtp,
    sendOtp,
    verifyOtp
  };
};
