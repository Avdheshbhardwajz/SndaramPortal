import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Timer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginState {
  email: string;
  otp: string;
  showOtpInput: boolean;
  timer: number;
}

const EditorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<LoginState>({
    email: '',
    otp: '',
    showOtpInput: false,
    timer: 120 // 2 minutes in seconds
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loginData.showOtpInput && loginData.timer > 0) {
      interval = setInterval(() => {
        setLoginData(prev => ({
          ...prev,
          timer: prev.timer - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginData.showOtpInput, loginData.timer]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      email: e.target.value
    }));
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setLoginData(prev => ({
      ...prev,
      otp: value
    }));
    setError('');
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement API call to send OTP
      // const response = await sendOtp(loginData.email);
      
      setLoginData(prev => ({
        ...prev,
        showOtpInput: true,
        timer: 120
      }));
    } catch (err : unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
  setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loginData.timer > 0) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement API call to verify OTP
      // const response = await verifyOtp(loginData.email, loginData.otp);
      
      // Simulate navigation after successful verification
      navigate('/dashboard');
    } catch (err : unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleEmailChange}
                className="pl-9"
                disabled={loginData.showOtpInput}
              />
            </div>
          </div>

          {loginData.showOtpInput && (
            <div className="space-y-2">
              <label htmlFor="otp">Verification Code</label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={loginData.otp}
                onChange={handleOtpChange}
                maxLength={6}
              />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  <span>{formatTime(loginData.timer)}</span>
                </div>
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={loginData.timer > 0}
                  className="p-0 h-auto"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={loginData.showOtpInput ? handleVerifyOtp : handleSendOtp}
            disabled={isLoading || (!loginData.showOtpInput && !loginData.email) || (loginData.showOtpInput && loginData.otp.length !== 6)}
            className="w-full"
          >
            {isLoading
              ? 'Please wait...'
              : loginData.showOtpInput
              ? 'Verify Code'
              : 'Send Code'}
          </Button>

          {loginData.showOtpInput && (
            <Button
              variant="outline"
              onClick={() => setLoginData(prev => ({ ...prev, showOtpInput: false, otp: '' }))}
              className="w-full"
            >
              Change Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditorLogin;