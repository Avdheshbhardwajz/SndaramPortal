import type React from "react";
import { LoginForm } from "../components/LoginForm";
import logo from "../assets/images/Login-Image.svg";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#0d47a1] to-[#00bfa5] p-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-[1120px] min-h-[640px] md:h-[640px] backdrop-blur-sm backdrop-filter">
        <div className="w-full md:w-1/2 relative h-48 md:h-auto bg-gradient-to-br from-[#1a237e] to-[#00bfa5]">
          <div className="absolute inset-0 bg-[#1a237e]/10 backdrop-blur-[2px]" />
          <img
            src={logo}
            alt="Financial Growth"
            className="w-full h-full object-cover mix-blend-overlay opacity-90"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white bg-gradient-to-t from-[#1a237e]/80 to-transparent">
            <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-blue-100">
              Access your account securely with our enhanced login system.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
