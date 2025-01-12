import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditField } from "./EditField";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ColumnConfig } from "@/types/grid";

interface AddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnConfigs: Record<string, ColumnConfig>;
  tableName: string;
  onSuccess: () => void;
}

type RowDataValue = string | number | boolean | null;

export const AddDialog = ({
  isOpen,
  onClose,
  columnConfigs,
  tableName,
  onSuccess,
}: AddDialogProps) => {
  const [newData, setNewData] = useState<Record<string, RowDataValue>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (
    field: string,
    value: RowDataValue
  ) => {
    setNewData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setNewData({});
    onClose();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Create the payload as expected by the backend
      const payload = {
        table_name: tableName,
        row_data: newData
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:8080/addrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add record');
      }

      toast({
        title: "Success",
        description: "Record added successfully",
        className: "bg-[#003087] text-white border-none",
      });
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add record";
      console.error('Error adding record:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white font-poppins">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4 font-poppins">
            Add New Record
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 font-poppins">
          {Object.entries(columnConfigs)
            .filter(([field]) => 
              field !== "id" && 
              field !== "created_on" && 
              field !== "modified_on"
            )
            .map(([field, config]) => (
              <EditField
                key={field}
                field={field}
                config={config}
                value={newData[field]}
                onChange={handleFieldChange}
              />
            ))}
        </div>
        <div className="flex justify-end gap-2 mt-4 font-poppins">
          <Button
            variant="outline"
            onClick={handleClose}
            className="font-poppins"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="font-poppins"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
