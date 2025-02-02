import React from "react";
import { Layout } from "../components/Layout";

export const CheckerPage: React.FC = () => {
  const firstName = localStorage.getItem("firstName") || "Checker";

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Hello, <span className="text-orange-500">{firstName}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Review and verify operations with enhanced security measures
          </p>
        </div>

        {/* Checker-specific content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add checker-specific cards/components here */}
        </div>
      </div>
    </Layout>
  );
};
