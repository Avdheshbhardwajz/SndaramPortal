import React, { useState, useEffect } from "react";
import { NotificationDrawer } from "./NotificationDrawer";
import { ChevronDown } from "lucide-react";
import logo from "../assets/images/Logo-Full.svg";

export const Header: React.FC = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
  });

  useEffect(() => {
    // Get user data from localStorage
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    const role = localStorage.getItem("userRole") || "";
    const email = localStorage.getItem("userEmail") || "";
    setUserData({ firstName, lastName, role, email });
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Redirect to login
    window.location.href = "/login";
  };

  // Get first letter of first name for avatar
  const userInitial = userData.firstName.charAt(0).toUpperCase();

  // Get background color based on first letter
  const getAvatarColor = (letter: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="Sundaram Mutual" className="h-8" />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <NotificationDrawer role={userData.role as "maker" | "checker"} />

            {/* User Profile */}
            <div className="flex items-center">
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full ${getAvatarColor(
                  userInitial
                )} flex items-center justify-center text-white font-medium`}
              >
                {userInitial}
              </div>

              {/* User Info */}
              <div className="ml-3 flex items-center">
                <div className="text-sm">
                  <span className="text-blue-600 font-medium capitalize">
                    {userData.role}
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-700">{userData.firstName}</span>
                </div>

                {/* Logout Button */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        showLogout ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Logout Dropdown */}
                  {showLogout && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="mr-2"
                        >
                          <path
                            d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
