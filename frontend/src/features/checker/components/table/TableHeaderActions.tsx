import React from "react";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Check, X } from "lucide-react";

interface TableHeaderActionsProps {
  selectedCount: number;
  totalCount: number;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
}

export function TableHeaderActions({
  selectedCount,
  totalCount,
  onToggleAll,
  onBulkApprove,
  onBulkReject,
}: TableHeaderActionsProps) {
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
  const isChecked = selectedCount === totalCount;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={isChecked}
        onCheckedChange={onToggleAll}
        className={isIndeterminate ? "indeterminate" : ""}
      />
      {selectedCount > 0 && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkApprove}
            className="hover:bg-green-50 hover:text-green-600"
          >
            <Check className="h-4 w-4 mr-1" />
            Approve Selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onBulkReject}
            className="hover:bg-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Reject Selected
          </Button>
        </>
      )}
    </div>
  );
}
