import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { UserManagement, RowRequestManager } from "@/components/admin";

import Configuration from "@/components/admin/Configuration";

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "rowRequests" | "configuration" | "userManagement"
  >("rowRequests");
  const firstName = localStorage.getItem("firstName") || "Admin";

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl">
            Hello, <span className="text-orange-500">{firstName}</span>
          </h1>
          <p className="text-gray-600 mt-1">Admin dashboard</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("rowRequests")}
              className={`py-2 px-1 inline-flex items-center border-b-2 ${
                activeTab === "rowRequests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Row Requests
            </button>
            <button
              onClick={() => setActiveTab("configuration")}
              className={`py-2 px-1 inline-flex items-center border-b-2 ${
                activeTab === "configuration"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab("userManagement")}
              className={`py-2 px-1 inline-flex items-center border-b-2 ${
                activeTab === "userManagement"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === "rowRequests" && <RowRequestManager />}
          {activeTab === "configuration" && <Configuration />}
          {activeTab === "userManagement" && <UserManagement />}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
