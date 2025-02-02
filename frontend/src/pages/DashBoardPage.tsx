import React from "react";
import { Layout } from "../components/Layout";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const firstName = localStorage.getItem("firstName") || "User";
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">
            Hello, <span className="text-orange-500">{firstName}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Access powerful tools and insights to manage your operations
            efficiently and effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/tables")}
            className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all hover:border-orange-200 cursor-pointer"
          >
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16M4 8h16M4 12h16M4 16h16M4 20h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Management</h3>
            <p className="text-gray-600 mb-4">
              Access and manage fund data with ease
            </p>
            <div className="text-orange-500">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div
            onClick={() => navigate("/users")}
            className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all hover:border-orange-200 cursor-pointer"
          >
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">User Administration</h3>
            <p className="text-gray-600 mb-4">
              Manage user roles and permissions
            </p>
            <div className="text-orange-500">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div
            onClick={() => navigate("/security")}
            className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all hover:border-orange-200 cursor-pointer"
          >
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Operations</h3>
            <p className="text-gray-600 mb-4">
              Enterprise-grade security for all operations
            </p>
            <div className="text-orange-500">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
