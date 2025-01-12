'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOtp } from '../hooks/useOTP'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import logo from '../assets/Logo.png'

type User = {
  email: string;
  role: 'admin' | 'maker' | 'checker';
  first_name: string;
  last_name: string;
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { email, otp, isOtpSent, error, setEmail, setOtp, sendOtp, verifyOtp } = useOtp();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (token && userData.role) {
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
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // If email is being edited or OTP is not sent, attempt to send OTP
      if (!isOtpSent || isEditingEmail) {
        const sent = await sendOtp();
        if (sent) {
          toast({
            title: "OTP Sent Successfully",
            description: "Please check your email for the OTP",
            className: "bg-[#003087] text-white border-none",
          });
          setIsEditingEmail(false);
        } else {
          toast({
            title: "OTP Send Failed",
            description: error || "Unable to send OTP. Please try again.",
            className: "bg-[#003087] text-white border-none",
          });
        }
      } else {
        // Only verify OTP if it's already sent and not being edited
        const response = await verifyOtp();
        console.log('OTP Verification Response:', response);

        if (response?.success && response.token && response.data) {
          localStorage.setItem('token', response.token);
          
          const userData: User = {
            email: response.data.email,
            role: response.data.role,
            first_name: response.data.first_name,
            last_name: response.data.last_name
          };
          localStorage.setItem('userData', JSON.stringify(userData));
          
          toast({
            title: "Login Successful",
            description: "Welcome to Sundaram Finance",
            className: "bg-[#003087] text-white border-none",
          })

          if (response.redirectPath) {
            console.log('Redirecting to:', response.redirectPath);
            navigate(response.redirectPath);
          } else {
            console.error('No redirect path provided');
            navigate('/login');
          }
        } else {
          toast({
            title: "Verification Failed",
            description: error || "Invalid OTP. Please try again.",
            className: "bg-[#003087] text-white border-none",
          })
          console.error('Invalid response:', response);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        className: "bg-[#003087] text-white border-none",
      })
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setIsEditingEmail(true);
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
  };

  return (
    <div className="min-h-screen flex items-center font-poppins justify-center ">
      <Card className="w-[400px] shadow-lg border-[#003B95]/10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logo} 
              alt="Sundaram Finance Logo" 
              className="w-50 h-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#003B95]">
            Welcome to Sundaram Finance
          </CardTitle>
          <CardDescription className="text-center text-[#003B95]/70">
            {isOtpSent ? "Enter the OTP sent to your email" : "Secure access to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {!isOtpSent || isEditingEmail ? (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="text-[#003B95]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#003B95]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 border-[#003B95]/20 focus:border-[#003B95] focus:ring-[#003B95]"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp" className="text-[#003B95]">OTP</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-[#003B95] text-sm p-0 h-auto"
                      onClick={handleChangeEmail}
                    >
                      Change Email
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#003B95]" />
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="pl-10 border-[#003B95]/20 focus:border-[#003B95] focus:ring-[#003B95]"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            {isEditingEmail && (
              <div className="flex space-x-2 mt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#003B95] hover:bg-[#0056D6] text-white transition-colors"
                  disabled={isLoading}
                >
                  Send New OTP
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCancelEmailEdit}
                >
                  Cancel
                </Button>
              </div>
            )}
            {!isEditingEmail && (
              <Button 
                type="submit" 
                className="w-full mt-6 bg-[#003B95] hover:bg-[#0056D6] text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isOtpSent ? "Verify OTP" : "Send OTP"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            )}
          </form>
        </CardContent>
        {error && (
          <Alert variant="destructive" className="mt-4 mx-6 mb-6 border-red-500/50 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <CardFooter className="text-center text-sm text-[#003B95]/70">
          Secure login powered by Sundaram Finance
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
