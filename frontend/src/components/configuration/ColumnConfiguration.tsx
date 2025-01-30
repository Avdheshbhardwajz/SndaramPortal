import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { X } from 'lucide-react';
import { columnConfigService, ColumnStatus, ApiError } from '../../services/columnConfigService';
//import { config } from "../../config/env";
import { Pagination } from '../Pagination';
import selectTable from "../../assets/images/select-table.svg";
import { useAlert } from '../../hooks/useAlert';

export default function ColumnConfigurator() {
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState<ColumnStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { alert, showAlert } = useAlert();

  useEffect(() => {
    void fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      void fetchColumns(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const response = await columnConfigService.fetchTables();
      if (response.success) {
        setTables(response.tables.map(t => t.table_name));
      } else {
        showAlert(response.message || 'Failed to fetch tables', 'error');
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch tables';
      showAlert(message, 'error');
    }
  };

  const fetchColumns = async (tableName: string) => {
    try {
      setLoading(true);
      const columnsResponse = await columnConfigService.fetchColumns(tableName);

      if (!columnsResponse.success || !columnsResponse.columns) {
        showAlert(columnsResponse.message || 'Failed to fetch columns', 'error');
        return;
      }

      const allColumns: ColumnStatus[] = columnsResponse.columns.map((col: string) => ({
        column_name: col,
        column_status: 'non-editable' as 'editable' | 'non-editable',
      }));

      try {
        const statusResponse = await columnConfigService.getColumnStatus(tableName);

        if (statusResponse.success && statusResponse.column_list) {
          const existingStatuses = new Map(
            statusResponse.column_list.map((col) => [
              col.column_name,
              col.column_status,
            ])
          );

          allColumns.forEach((col: ColumnStatus) => {
            const status = existingStatuses.get(col.column_name);
            if (status && (status === 'editable' || status === 'non-editable' || status === 'readonly')) {
              col.column_status = status;
            }
          });
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to fetch column statuses';
        showAlert(message, 'error');
      }

      setColumns(allColumns);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch columns';
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleColumnStatusChange = async (
    columnName: string,
    newStatus: 'editable' | 'non-editable'
  ) => {
    try {
      setLoading(true);

      const updatedColumns = columns.map((col) =>
        col.column_name === columnName
          ? { ...col, column_status: newStatus }
          : col
      );

      const response = await columnConfigService.updateColumnStatus(selectedTable, updatedColumns);

      if (response.success) {
        setColumns(updatedColumns);
        showAlert('Column status updated successfully', 'success');
      } else {
        showAlert(response.message || 'Failed to update column status', 'error');
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update column status';
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter tables based on search query
  const filteredTables = tables.filter(table =>
    table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(columns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentColumns = columns.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Select Table</h2>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="w-full justify-between text-left font-normal h-10 px-3"
          >
            {selectedTable || "Select a table"}
            <span className="opacity-50">⌄</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md p-4">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>Select Table</DialogTitle>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="p-4">
              <Input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              <div className="max-h-[400px] overflow-y-auto">
                {filteredTables.map((table) => (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedTable(table);
                      setIsDialogOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : !selectedTable ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <img 
              src={selectTable} 
              alt="Select Table" 
              className="w-48 h-48 opacity-50"
            />
            <p className="text-gray-500 text-center">
              Select the table to toggle between editable<br />
              and non-editable modes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alert.show && (
              <Alert
                variant={alert.type === "error" ? "destructive" : "default"}
                className="mb-4"
              >
                <AlertTitle>
                  {alert.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentColumns.map((column) => (
                <div
                  key={column.column_name}
                  className="flex items-center justify-between py-6 px-4 bg-white rounded-lg border border-gray-100"
                >
                  <span className="text-gray-700 text-sm truncate">{column.column_name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`text-xs ${column.column_status === "editable" ? "text-green-600" : "text-gray-500"}`}>
                      {column.column_status === "editable" ? "Editable" : "Non-Editable"}
                    </div>
                    <button
                      onClick={() =>
                        handleColumnStatusChange(
                          column.column_name,
                          column.column_status === "editable" ? "non-editable" : "editable"
                        )
                      }
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        column.column_status === "editable"
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          column.column_status === "editable"
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {columns.length > itemsPerPage && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
