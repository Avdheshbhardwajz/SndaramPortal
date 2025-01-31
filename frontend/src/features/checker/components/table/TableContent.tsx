import React from "react";
import {
  Table,
  TableBody,
  TableHeader as UITableHeader,
  TableHead,
  TableRow,
} from "../../../../components/ui/table";
import { Change } from "../../types";
import { TableHeader as TableHeaderComponent } from "./TableHeader";
import { TableRow as CustomTableRow } from "./TableRow";

interface TableContentProps {
  changes: Change[];
  selectedChanges: Record<string, boolean>;
  handleApprove: (rowId: string, requestId: string) => void;
  handleReject: (changeId: string) => void;
  toggleChangeSelection: (changeId: string) => void;
  toggleAllChanges: (checked: boolean | "indeterminate") => void;
  handleBulkApprove: () => void;
  handleBulkReject: () => void;
}

export function TableContent({
  changes,
  selectedChanges,
  handleApprove,
  handleReject,
  toggleChangeSelection,
  toggleAllChanges,
  handleBulkApprove,
  handleBulkReject,
}: TableContentProps) {
  const columnNames = changes[0]?.rowData
    ? Object.keys(changes[0].rowData)
    : [];
  const tableName = changes[0]?.tableName || "";

  const handleSetSelectedChanges: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  > = (newSelected) => {
    if (typeof newSelected === "function") {
      const result = newSelected(selectedChanges);
      const checked = Object.values(result).every(Boolean);
      toggleAllChanges(checked);
    } else {
      const checked = Object.values(newSelected).every(Boolean);
      toggleAllChanges(checked);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHead>
          <TableRow>
            <UITableHeader>No.</UITableHeader>
            <UITableHeader>Actions</UITableHeader>
            <UITableHeader>
              <TableHeaderComponent
                tableName={tableName}
                selectedChanges={selectedChanges}
                setSelectedChanges={handleSetSelectedChanges}
                tableChanges={changes}
                handleApproveAll={handleBulkApprove}
                handleRejectAll={handleBulkReject}
              />
            </UITableHeader>
            <UITableHeader>User</UITableHeader>
            <UITableHeader>Date</UITableHeader>
            {columnNames.map((columnName) => (
              <UITableHeader key={columnName}>{columnName}</UITableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {changes.map((change, index) => (
            <CustomTableRow
              key={change.id}
              change={change}
              index={index}
              selectedChanges={selectedChanges}
              handleApprove={handleApprove}
              handleReject={handleReject}
              toggleChangeSelection={toggleChangeSelection}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
