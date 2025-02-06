import React from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import { TableFilter } from "../TableFilter";
import type { FilterCondition } from "../TableFilter";

interface TableColumnHeaderProps {
  column: string;
  sortConfig: {
    column: string | null;
    direction: "asc" | "desc" | null;
  };
  onSort: (column: string) => void;
  onFilterClick: (column: string) => void;
  isFilterActive: boolean;
  isFilterOpen: boolean;
  onFilterApply: (column: string, condition: FilterCondition) => void;
  type: "text" | "number" | "date";
  isEditable: boolean;
}

export const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({
  column,
  sortConfig,
  onSort,
  onFilterClick,
  isFilterActive,
  isFilterOpen,
  onFilterApply,
  type,
  isEditable,
}) => {
  return (
    <th
      className={`py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 whitespace-nowrap bg-gray-50 ${
        !isEditable ? "text-gray-500" : "text-gray-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSort(column)}
          className={`flex items-center gap-1 hover:text-blue-600 ${
            !isEditable ? "opacity-75" : ""
          }`}
        >
          {column
            .split("_")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}
          <ArrowUpDown
            size={16}
            className={`transition-colors ${
              sortConfig.column === column ? "text-blue-600" : "text-gray-400"
            }`}
          />
        </button>

        <button
          onClick={() => onFilterClick(column)}
          className={`p-1 rounded hover:bg-gray-100 ${
            isFilterActive ? "text-blue-600" : "text-gray-500"
          } ${!isEditable ? "opacity-75" : ""}`}
          title={isFilterActive ? "Filter active" : "Add filter"}
        >
          <Filter size={16} />
        </button>
      </div>

      {isFilterOpen && (
        <div className="absolute mt-2 z-50">
          <TableFilter
            column={column}
            type={type}
            onApply={(condition) => onFilterApply(column, condition)}
            isOpen={isFilterOpen}
            onClose={() => onFilterClick(column)}
          />
        </div>
      )}
    </th>
  );
};
