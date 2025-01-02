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

export const AddDialog = ({
  isOpen,
  onClose,
  columnConfigs,
  tableName,
  onSuccess,
}: AddDialogProps) => {
  const [newData, setNewData] = useState<
    Record<string, string | number | boolean | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (
    field: string,
    value: string | number | boolean | null
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
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      
      const response = await fetch('http://localhost:8080/addrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('makerToken')}`
        },
        body: JSON.stringify({
          table_name: tableName,
          row_data: JSON.stringify(newData),
          maker: userData.email
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add record');
      }

      toast({
        title: "Success",
        description: "Record added successfully",
      });
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add record";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
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
            .filter(([field]) => field !== "id" && field !== "dim_branch_sk")
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
