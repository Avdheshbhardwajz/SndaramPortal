import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOtp } from '../hooks/useOTP';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

// interface User {
//   user_id: string;
//   email: string;
//   role: 'admin' | 'maker' | 'checker';
//   first_name: string;
//   last_name: string;
// }

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { email, otp, isOtpSent, error, setEmail, setOtp, sendOtp, verifyOtp } = useOtp();

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
        if (response?.success && response.token && response.user) {
          // Store token and user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate based on role
          switch (response.user.role) {
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
              navigate('/login');
          }
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
