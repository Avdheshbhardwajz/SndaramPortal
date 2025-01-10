import { useState } from 'react';
import axios from 'axios';

interface OtpResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    email: string;
    role: 'admin' | 'maker' | 'checker';
    first_name: string;
    last_name: string;
  };
  redirectPath: string;
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
        setError(response.data.message || 'Failed to send OTP');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      console.error('Send OTP Error:', err);
      setError(errorMessage);
      return false;
    }
  };

  const verifyOtp = async (): Promise<OtpResponse | null> => {
    try {
      setError(null);
      console.log('Verifying OTP:', { email, otp }); // Debug log

      const response = await axios.post<OtpResponse>('http://localhost:8080/verify-otp', {
        email,
        OTP: otp
      });

      console.log('Verify OTP Response:', response.data); // Debug log

      if (response.data.success) {
        return response.data;
      } else {
        const errorMsg = response.data.message || 'Invalid OTP';
        console.error('Verification failed:', errorMsg);
        setError(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      console.error('Verify OTP Error:', err);
      setError(errorMessage);
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
