import React from "react";
import {
  TableCell,
  TableRow as UITableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Check, X } from "lucide-react";
import { Change } from "../../types";

interface TableRowProps {
  change: Change;
  index: number;
  selectedChanges: Record<string, boolean>;
  handleApprove: (rowId: string, requestId: string) => void;
  handleReject: (changeId: string) => void;
  toggleChangeSelection: (changeId: string) => void;
}

export function TableRow({
  change,
  index,
  selectedChanges,
  handleApprove,
  handleReject,
  toggleChangeSelection,
}: TableRowProps) {
  return (
    <UITableRow key={change.id} className="hover:bg-secondary/5">
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApprove(change.row_id, change.request_id)}
            className="hover:bg-green-50 hover:text-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReject(change.id)}
            className="hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={selectedChanges[change.id]}
          onCheckedChange={() => toggleChangeSelection(change.id)}
        />
      </TableCell>
      <TableCell>
        <div className="whitespace-nowrap font-medium">{change.user}</div>
      </TableCell>
      <TableCell>
        <div className="whitespace-nowrap text-muted-foreground">
          {change.dateTime}
        </div>
      </TableCell>
      {change.rowData &&
        Object.keys(change.rowData).map((columnName, colIndex) => {
          const isChanged =
            change.changedColumns?.includes(columnName) || false;

          return (
            <TableCell
              key={`${change.request_id}-${columnName}-${colIndex}`}
              className={isChanged ? "bg-yellow-50/50" : ""}
            >
              {isChanged ? (
                <div className="flex flex-col gap-1">
                  <span className="line-through text-red-500/80 text-sm">
                    {String(change.oldValues[columnName] ?? "-")}
                  </span>
                  <span className="text-green-600 font-medium">
                    {String(change.newValues[columnName] ?? "-")}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  {String(change.rowData[columnName] ?? "-")}
                </span>
              )}
            </TableCell>
          );
        })}
    </UITableRow>
  );
}
