import { useMemo, useState, useCallback, memo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { EditDialog } from "./EditDialog";
import { AddDialog } from "./AddDialog";
import { ColDef, ICellRendererParams, CellStyle, CellClassParams } from "ag-grid-community";
import { Pencil, Plus } from "lucide-react";
import { useGridData } from "@/hooks/useGridData";
import { submitRequestData } from "@/services/api";
import { RequestDataPayload } from "@/types/requestData";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { RowData } from "@/types/grid";
import { ColumnConfig } from "@/types/grid";
import { getHighlightedCells } from "@/services/userApi";


interface DropdownOption {
  columnName: string;
  options: string[];
}

interface DropdownResponse {
  success: boolean;
  data: DropdownOption[];
}

interface GridTableProps {
  tableName: string;
  initialPageSize?: number;
}

export const GridTable = memo(
  ({ tableName, initialPageSize = 20 }: GridTableProps) => {
    const {
      isLoading,
      error,
      rowData,
      columnConfigs,
      columnPermissions,
      pagination,
      handlePageChange,
      handlePageSizeChange,
      refreshData,
    } = useGridData({ tableName, initialPageSize });

    const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
    const [editedData, setEditedData] = useState<RowData | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
    const [highlightedCells, setHighlightedCells] = useState<Record<string, string[]>>({});

    useEffect(() => {
      const fetchDropdownOptions = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No auth token found');
            return;
          }

          const response = await axios.post<DropdownResponse>(
            "http://localhost:8080/fetchDropdownOptions",
            { table_name: tableName },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (response.data.success && response.data.data) {
            setDropdownOptions(response.data.data);
          }
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            window.location.href = '/auth';
            return;
          }
          console.error("Error fetching dropdown options:", axiosError.message);
          toast({
            title: "Error",
            description: "Failed to fetch dropdown options",
            variant: "destructive",
          });
        }
      };

      if (tableName) {
        fetchDropdownOptions();
      }
    }, [tableName, toast]);

    const fetchHighlightedCells = useCallback(async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("userData") || "{}").user_id;
        if (!userId) return;
        
        const response = await getHighlightedCells(userId, tableName);
        if (response.success) {
          // Create a map of row_id to changed_fields
          const highlightedCellsMap: Record<string, string[]> = {};
          response.data.forEach((item) => {
            highlightedCellsMap[item.row_id] = item.changed_fields;
          });
          setHighlightedCells(highlightedCellsMap);
        }
      } catch (error) {
        console.error("Error fetching highlighted cells:", error);
      }
    }, [tableName]);

    useEffect(() => {
      if (tableName) {
        fetchHighlightedCells();
      }
    }, [tableName, fetchHighlightedCells]);

    const handleEditClick = useCallback(
      (row: RowData) => {
        const hasEditableColumns = Object.values(columnPermissions).some(
          (isEditable) => isEditable
        );

        if (!hasEditableColumns) {
          toast({
            title: "Cannot Edit",
            description: "None of the columns are editable for this table",
            variant: "destructive",
          });
          return;
        }

        setSelectedRow(row);
        setEditedData({ ...row });
        setValidationErrors({});
        setIsEditDialogOpen(true);
      },
      [columnPermissions]
    );

    const handleCloseEdit = useCallback(() => {
      setIsEditDialogOpen(false);
      setSelectedRow(null);
      setEditedData(null);
      setValidationErrors({});
      setSaveError(null);
    }, []);

    const handleInputChange = useCallback(
      (field: string, value: string | number | boolean | null) => {
        if (!columnPermissions[field]) return;

        setEditedData((prev) =>
          prev
            ? {
                ...prev,
                [field]: value,
              }
            : null
        );

        setValidationErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      },
      [columnPermissions]
    );

    const handleEditSave = useCallback(async () => {
      try {
        if (!selectedRow || !editedData) return;

        setIsSaving(true);
        setSaveError(null);

        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        
        const rowId = selectedRow['row_id'] != null ? String(selectedRow['row_id']) : undefined;

        if (!tableName) {
          throw new Error('Table name is required');
        }

        const payload: RequestDataPayload = {
          table_name: tableName,
          old_values: Object.fromEntries(
            Object.entries(selectedRow || {}).map(([k, v]) => [k, v ?? null])
          ),
          new_values: Object.fromEntries(
            Object.entries(editedData || {}).map(([k, v]) => [k, v ?? null])
          ),
          maker_id: userData.user_id || "",
          comments: "",
          row_id: rowId,
          table_id: tableName
        };

        const response = await submitRequestData(payload);

        if (response.success) {
          toast({
            title: "Success",
            description: "Changes saved successfully",
          });

          // Refresh the data and highlights
          refreshData();
          handleCloseEdit();
          fetchHighlightedCells();
        }
      } catch (error) {
        const err = error as Error;
        console.error("Error saving changes:", err.message);
        setSaveError("Failed to save changes. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }, [refreshData, selectedRow, editedData, tableName, handleCloseEdit, fetchHighlightedCells]);

    const handleAddSuccess = useCallback(() => {
      refreshData();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "New record added successfully",
      });
    }, [refreshData]);

    const columnDefs = useMemo<ColDef<RowData>[]>(() => {
      return [
        {
          headerName: "Actions",
          field: "actions",
          width: 100,
          cellRenderer: (params: ICellRendererParams<RowData>) => {
            const hasEditableColumns = Object.values(columnPermissions).some(
              (isEditable) => isEditable
            );

            return (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => params.data && handleEditClick(params.data)}
                  disabled={!hasEditableColumns}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        },
        ...Object.entries(columnConfigs)
          .filter(([field]) => field !== 'row_id')
          .map(([field, config]) => ({
            field,
            headerName: config.displayName || config.headerName,
            sortable: true,
            filter: true,
            editable: false,
            cellStyle: (params: CellClassParams): CellStyle => {
              const rowId = params.data?.row_id;
              const rowIdString = rowId != null ? String(rowId) : undefined;
              
              if (rowIdString && highlightedCells[rowIdString]?.includes(field)) {
                return { backgroundColor: "orange" };
              }
              return {
                backgroundColor: !columnPermissions[field] ? "#f5f5f5" : "white",
                cursor: columnPermissions[field] ? "pointer" : "not-allowed",
              };
            },
          })),
      ];
    }, [columnConfigs, handleEditClick, columnPermissions, highlightedCells]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-600">Loading data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold capitalize">
            {tableName.replace(/_/g, " ")}
          </h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="ag-theme-alpine w-full h-[calc(100vh-16rem)] font-poppins">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              suppressPaginationPanel={true}
              suppressScrollOnNewData={true}
              enableCellTextSelection={true}
              animateRows={true}
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <EditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEdit}
          selectedRowData={selectedRow}
          editedData={editedData}
          columnConfigs={columnConfigs as { [key: string]: ColumnConfig }}
          validationErrors={validationErrors}
          onSave={handleEditSave}
          onInputChange={handleInputChange}
          isSaving={isSaving}
          error={saveError}
          dropdownOptions={dropdownOptions}
        />

        <AddDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          columnConfigs={columnConfigs}
          tableName={tableName}
          onSuccess={handleAddSuccess}
        />
      </div>
    );
  }
);

GridTable.displayName = "GridTable";
