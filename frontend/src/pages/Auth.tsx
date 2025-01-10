import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOtp } from '../hooks/useOTP';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

type User = {
  email: string;
  role: 'admin' | 'maker' | 'checker';
  first_name: string;
  last_name: string;
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { email, otp, isOtpSent, error, setEmail, setOtp, sendOtp, verifyOtp } = useOtp();

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (token && userData.role) {
      // Navigate based on role
      switch (userData.role.toLowerCase()) {
        case 'admin':
          navigate('/admin');
          break;
        case 'maker':
          navigate('/dashboard');
          break;
        case 'checker':
          navigate('/checker');
          break;
        default:
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isOtpSent) {
        const sent = await sendOtp();
        if (!sent) {
          return; // Error is handled by the hook
        }
      } else {
        const response = await verifyOtp();
        console.log('OTP Verification Response:', response); // Debug log

        if (response?.success && response.token && response.data) {
          // Store token
          localStorage.setItem('token', response.token);
          
          // Store user data
          const userData: User = {
            email: response.data.email,
            role: response.data.role,
            first_name: response.data.first_name,
            last_name: response.data.last_name
          };
          localStorage.setItem('userData', JSON.stringify(userData));
          
          console.log('Stored user data:', userData); // Debug log

          // Navigate to the path provided by backend
          if (response.redirectPath) {
            console.log('Redirecting to:', response.redirectPath);
            navigate(response.redirectPath);
          } else {
            console.error('No redirect path provided');
            navigate('/login');
          }
        } else {
          console.error('Invalid response:', response);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            {isOtpSent ? "Enter the OTP sent to your email" : "Enter your email to receive an OTP"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {!isOtpSent && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}
              {isOtpSent && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full mt-4">
              {isOtpSent ? "Verify OTP" : "Send OTP"}
            </Button>
          </form>
        </CardContent>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default Auth;
