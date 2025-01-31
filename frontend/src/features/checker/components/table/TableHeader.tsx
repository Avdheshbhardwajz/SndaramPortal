import React from "react";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Label } from "../../../../components/ui/label";
import { Check, X } from "lucide-react";
import { Change } from "../../types";

interface TableHeaderProps {
  tableName: string;
  selectedChanges: Record<string, boolean>;
  setSelectedChanges: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  tableChanges: Change[];
  handleApproveAll: () => void;
  handleRejectAll: () => void;
}

export function TableHeader({
  tableName,
  selectedChanges,
  setSelectedChanges,
  tableChanges,
  handleApproveAll,
  handleRejectAll,
}: TableHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`selectAll-${tableName}`}
          onCheckedChange={(checked: boolean | "indeterminate") => {
            const newSelected = { ...selectedChanges };
            tableChanges.forEach((change) => {
              newSelected[change.id] = checked === true;
            });
            setSelectedChanges(newSelected);
          }}
        />
        <Label
          htmlFor={`selectAll-${tableName}`}
          className="text-sm font-medium"
        >
          Select All
        </Label>
      </div>
      <Button size="sm" className="font-medium" onClick={handleApproveAll}>
        <Check className="h-4 w-4 mr-2" /> Approve All
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="font-medium"
        onClick={handleRejectAll}
      >
        <X className="h-4 w-4 mr-2" /> Reject All
      </Button>
    </div>
  );
}
