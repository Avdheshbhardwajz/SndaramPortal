import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { AxiosError } from "axios";
import {
  dropdownConfigService,
  DropdownOption,
  ColumnDropdownOption,
  ErrorResponse,
} from "../../services/dropdownConfigService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import axios from "axios";
import { getAuthHeaders } from "../../utils/authHeaders";

interface DropdownManagerProps {
  tables: string[];
}

export default function DropdownManager({ tables: initialTables = [] }: DropdownManagerProps) {
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState<string[]>(initialTables);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "info" as "info" | "error" | "success",
  });

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; tables: { table_name: string }[] }>(
        "http://localhost:8080/table",
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setTables(response.data.tables.map(t => t.table_name));
      } else {
        showAlert("Failed to fetch tables", "error");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      showAlert("Error fetching tables", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tables when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchTables();
    }
  }, [dialogOpen]);

  // Fetch columns when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedTable);
      setSelectedColumn(""); // Reset column selection when table changes
      setOptions([]); // Clear options when table changes
    }
  }, [selectedTable]);

  // Fetch existing options when column is selected
  useEffect(() => {
    if (selectedTable && selectedColumn) {
      fetchExistingOptions();
    }
  }, [selectedTable, selectedColumn]);

  const fetchColumns = async (tableName: string) => {
    try {
      setLoading(true);
      const response = await axios.post<{
        success: boolean;
        columns: string[];
        message?: string;
      }>(
        `http://localhost:8080/fetchcolumn`,
        { table_name: tableName },
        { headers: getAuthHeaders() }
      );

      console.log("Fetch columns response:", response.data); // Debug log

      if (response.data.success && Array.isArray(response.data.columns)) {
        setColumns(response.data.columns);
        if (response.data.columns.length === 0) {
          showAlert("No columns found for this table", "info");
        }
      } else {
        showAlert(response.data.message || "Failed to fetch columns", "error");
        setColumns([]);
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
      showAlert("Error fetching columns", "error");
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingOptions = async () => {
    try {
      setLoading(true);
      const response = await dropdownConfigService.fetchColumnDropdownOptions(
        selectedTable,
        selectedColumn
      );

      if (response.success && response.data) {
        const existingOptions = response.data.map((opt: string) => ({
          value: opt,
        }));
        setOptions(existingOptions);
        if (existingOptions.length > 0) {
          showAlert(
            `Loaded ${existingOptions.length} existing options`,
            "success"
          );
        }
      } else {
        setOptions([]);
        if (response.message) {
          showAlert(response.message, "info");
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error fetching options:", axiosError);
      showAlert(
        axiosError.response?.data?.message || "Error fetching existing options",
        "error"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (!newOption.trim()) {
      showAlert("Option cannot be empty", "error");
      return;
    }

    if (
      options.some((opt) => opt.value.toLowerCase() === newOption.toLowerCase())
    ) {
      showAlert("Option already exists", "error");
      return;
    }

    setOptions([...options, { value: newOption.trim() }]);
    setNewOption("");
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setOptions(options.filter((opt) => opt.value !== optionToRemove));
  };

  const handleSaveOptions = async () => {
    try {
      setLoading(true);
      const response = await dropdownConfigService.fetchColumnDropdownOptions(
        selectedTable,
        selectedColumn
      );

      let existingTableOptions: ColumnDropdownOption[] = [];

      if (response.success && response.dropdown_options) {
        existingTableOptions = response.dropdown_options;
      }

      existingTableOptions = existingTableOptions.filter(
        (option) => option.columnName !== selectedColumn
      );

      const newColumnOption: ColumnDropdownOption = {
        columnName: selectedColumn,
        options: options.map((opt) => opt.value),
      };

      const allOptions = [...existingTableOptions, newColumnOption];

      const saveResponse = await dropdownConfigService.updateColumnDropdownOptions(
        selectedTable,
        allOptions
      );

      if (saveResponse.success) {
        showAlert("Options saved successfully", "success");
        fetchExistingOptions();
      } else {
        showAlert(saveResponse.message || "Failed to save options", "error");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error saving options:", axiosError);
      showAlert(
        axiosError.response?.data?.message || "Error saving options",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table: string) => {
    setSelectedTable(table);
    setSelectedColumn(""); // Reset column selection
    setOptions([]); // Reset options
    setDialogOpen(false);
  };

  const showAlert = (message: string, type: "error" | "success" | "info") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "info" }),
      3000
    );
  };

  return (
    <Card className="mt-6 font-poppins">
      <CardHeader>
        <CardTitle>Dropdown Options Manager</CardTitle>
      </CardHeader>
      <CardContent>
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

        <div className="space-y-6">
          {/* Table Selection Dialog */}
          <div className="space-y-2 font-poppins">
            <Label>Selected Table: {selectedTable || "None"}</Label>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setDialogOpen(true)}
            >
              {selectedTable || "Select a table"}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="min-w-[40vw] p-4">
                <DialogHeader className="flex flex-row items-center justify-between">
                  <DialogTitle>Select Table</DialogTitle>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setDialogOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      Loading tables...
                    </div>
                  ) : (
                    <Table>
                      <TableBody>
                        {tables.map((table) => (
                          <TableRow
                            key={table}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleTableSelect(table)}
                          >
                            <TableCell>{table}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* Column Selection */}
          {selectedTable && (
            <div className="space-y-2">
              <Label>Select Column</Label>
              <Select
                value={selectedColumn}
                onValueChange={(value) => {
                  console.log("Selected column:", value);
                  setSelectedColumn(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent
                  className="bg-white font-poppins max-h-[200px] overflow-y-auto"
                  position="popper"
                >
                  {columns.length > 0 ? (
                    columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      No columns available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {columns.length === 0 && !loading && (
                <p className="text-sm text-gray-500">No columns found for this table</p>
              )}
            </div>
          )}

          {/* Options Management */}
          {selectedColumn && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  onClick={handleAddOption}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Options List with count */}
              {options.length > 0 && (
                <div className="text-sm text-gray-500 mb-2">
                  {options.length} option{options.length !== 1 ? "s" : ""}{" "}
                  available
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <span>{option.value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(option.value)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveOptions}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Options"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
