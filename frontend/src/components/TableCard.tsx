import React from "react";
import { ArrowRight } from "lucide-react";

interface TableCardProps {
  tableName: string;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ tableName, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all text-left"
    >
      <span className="text-gray-900 font-medium">{tableName}</span>
      <ArrowRight className="h-4 w-4 text-blue-600" />
    </button>
  );
};
