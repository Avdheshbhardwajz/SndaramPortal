import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTableData } from "../hooks/useTableData";
import { useColumnPermissions } from "../hooks/useColumnPermissions";
import { EditRowDrawer } from "./EditRowDrawer";
import {
  requestRowEdit,
  fetchDropdownOptions,
  DropdownConfig,
} from "../services/tableDataService";
import { Pagination } from "./Pagination";
import { useToast } from "@/hooks/use-toast";

interface ColumnStatus {
  column_name: string;
  column_status: "editable" | "non-editable";
}

interface DynamicTableProps {
  tableName: string;
  pageSize: number;
  onPageSizeChange: (newPageSize: number) => void;
  userRole: "maker" | "checker";
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  tableName,
  pageSize,
  onPageSizeChange,
}) => {
  const {
    data: processedData,
    columns,
    isLoading: isDataLoading,
    error: dataError,
    refresh: refreshData,
    pagination,
    setCurrentPage,
  } = useTableData({ tableName, pageSize });

  const {
    isColumnEditable,
    columnStatuses,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useColumnPermissions(tableName);

  const [selectedRow, setSelectedRow] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [dropdownColumns, setDropdownColumns] = useState<DropdownConfig[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const { toast } = useToast();

  // Fetch dropdown columns when table name changes
  useEffect(() => {
    fetchDropdownData();
  }, [tableName]);

  const fetchDropdownData = async () => {
    try {
      setIsLoadingDropdowns(true);
      const dropdowns = await fetchDropdownOptions(tableName);
      setDropdownColumns(dropdowns.filter((item) => item.options.length > 0));
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast({
        title: "Error",
        description: "Failed to load dropdown options",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  const handleEditClick = (row: Record<string, unknown>) => {
    setSelectedRow(row);
    setIsAddMode(false);
    setIsDrawerOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRow({});
    setIsAddMode(true);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedRow(null);
    setIsAddMode(false);
    setIsDrawerOpen(false);
    setError(null);
  };

  const handleRowSave = async (updatedRow: Record<string, unknown>) => {
    try {
      setError(null);

      if (!selectedRow) {
        throw new Error("No row selected for editing");
      }

      const editData = {
        table_name: tableName,
        row_id: String(
          selectedRow.id ||
            selectedRow[`${tableName}_sk`] ||
            selectedRow[`${tableName}_id`]
        ),
        old_values: selectedRow,
        new_values: updatedRow,
        table_id: tableName,
      };

      const response = await requestRowEdit(editData);

      if (response.success) {
        handleDrawerClose();
        refreshData();
        toast({
          title: "Success",
          description: isAddMode
            ? "Row added successfully"
            : "Changes requested successfully",
        });
      } else {
        setError(response.message || "Failed to submit edit request");
      }
    } catch (err) {
      console.error("Error saving row:", err);
      setError(err instanceof Error ? err.message : "Failed to save changes");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes",
      });
    }
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
  };

  // Function to determine column background color
  const getColumnStyle = (column: string) => {
    if (
      !columnStatuses.some(
        (status: ColumnStatus) => status.column_name === column
      )
    ) {
      return "bg-[#e3f2fd]"; // Light blue for columns not in API response
    }
    if (!isColumnEditable(column)) {
      return "bg-[#e8eaf6]"; // Indigo 50 for non-editable columns
    }
    return "bg-white"; // Default background for editable columns
  };

  // Function to determine cell background color
  const getCellStyle = (column: string) => {
    if (
      !columnStatuses.some(
        (status: ColumnStatus) => status.column_name === column
      )
    ) {
      return "bg-[#e3f2fd]/50"; // Lighter blue for cells not in API response
    }
    if (!isColumnEditable(column)) {
      return "bg-[#e8eaf6]/50"; // Lighter indigo for non-editable cells
    }
    return ""; // Default background for editable cells
  };

  if (isDataLoading || isPermissionsLoading || isLoadingDropdowns) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bfa5]"></div>
      </div>
    );
  }

  if (dataError || permissionsError) {
    return (
      <div className="text-red-600 p-4 text-center bg-red-50 rounded-lg">
        {dataError || permissionsError}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {error && (
        <div className="m-4 p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <div className="flex flex-col flex-1 bg-white rounded-lg border border-[#e3f2fd] overflow-hidden">
        {/* Table Content */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[#e3f2fd] scrollbar-track-transparent">
          <table className="w-full border-collapse min-w-max">
            {/* Fixed header */}
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#f8fafc] border-b border-[#e3f2fd]">
                <th className="sticky left-0 z-20 bg-[#f8fafc] px-4 py-3 text-left text-sm font-medium text-[#1a237e] w-[80px]">
                  Action
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`px-6 py-3 text-left text-sm font-medium text-[#1a237e] ${getColumnStyle(
                      column
                    )}`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer group whitespace-nowrap"
                      onClick={() => handleSort(column)}
                    >
                      {column}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronUp
                          className={`h-3 w-3 -mb-1 ${
                            sortColumn === column && sortDirection === "asc"
                              ? "text-[#00bfa5]"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 ${
                            sortColumn === column && sortDirection === "desc"
                              ? "text-[#00bfa5]"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-[#e3f2fd]">
              {processedData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#f8fafc] transition-colors even:bg-gray-50"
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-3 w-[80px]">
                    <button
                      className="p-1.5 hover:bg-[#e3f2fd] rounded-lg transition-colors"
                      onClick={() => handleEditClick(row)}
                    >
                      <svg
                        className="w-5 h-5 text-[#00bfa5]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column}
                      className={`px-6 py-3 text-sm text-[#1a237e] whitespace-nowrap ${getCellStyle(
                        column
                      )}`}
                    >
                      {String(row[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination and Page Size Selector - Bottom */}
        {pagination.totalPages > 0 && (
          <div className="border-t border-[#e3f2fd] bg-white py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#1a237e] font-medium">
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-[#e3f2fd] text-sm text-[#1a237e] focus:outline-none focus:border-[#00bfa5]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Row Button */}
      {
        <button
          onClick={handleAddClick}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#00bfa5] text-white rounded-full shadow-lg hover:bg-[#00bfa5]/90 transition-colors flex items-center justify-center z-30"
          aria-label="Add new row"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      }

      {/* Edit Drawer */}
      <EditRowDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        row={selectedRow}
        columns={columns}
        onSave={handleRowSave}
        mode={isAddMode ? "add" : "edit"}
        isColumnEditable={isColumnEditable}
        tableName={tableName}
        dropdownColumns={dropdownColumns}
      />
    </div>
  );
};
