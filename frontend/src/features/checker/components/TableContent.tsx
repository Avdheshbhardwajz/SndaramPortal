import React, { useState } from "react";
import { Change } from "../types";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, X, ArrowLeft } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableContentProps {
  tableName: string;
  pendingChanges: Change[];
  selectedChanges: Record<string, boolean>;
  setSelectedChanges: (changes: Record<string, boolean>) => void;
  handleApprove: (rowId: string, requestId: string) => void;
  handleReject: (id: string) => void;
  handleApproveAll: () => void;
  handleRejectAll: () => void;
  onBack?: () => void;
}

export function TableContent({
  tableName,
  pendingChanges,
  selectedChanges,
  setSelectedChanges,
  handleApprove,
  handleReject,
  handleApproveAll,
  handleRejectAll,
  onBack,
}: TableContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tableChanges = pendingChanges.filter(
    (change) => change.tableName === tableName
  );

  const totalPages = Math.ceil(tableChanges.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedChanges = tableChanges.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-lg font-medium">{tableName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={
              Object.keys(selectedChanges).length > 0 &&
              Object.values(selectedChanges).every(Boolean)
            }
            onCheckedChange={(checked) => {
              const newSelectedChanges: Record<string, boolean> = {};
              tableChanges.forEach((change) => {
                newSelectedChanges[change.id] = checked === true;
              });
              setSelectedChanges(newSelectedChanges);
            }}
          />
          <Label htmlFor="select-all">Select All</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApproveAll}
            disabled={Object.keys(selectedChanges).length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRejectAll}
            disabled={Object.keys(selectedChanges).length === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Reject Selected
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/5">
                <TableHead className="w-[50px] font-semibold">No.</TableHead>
                <TableHead className="w-[120px] font-semibold">
                  Actions
                </TableHead>
                <TableHead className="w-[50px] font-semibold">Select</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Date & Time</TableHead>
                {tableChanges.slice(0, 1).map(
                  (change) =>
                    change.rowData &&
                    Object.keys(change.rowData).map((columnName, colIndex) => (
                      <TableHead
                        key={`${tableName}-${columnName}-${colIndex}`}
                        className="font-semibold"
                      >
                        {columnName}
                      </TableHead>
                    ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedChanges.map((change, index) => (
                <TableRow key={change.id} className="hover:bg-secondary/5">
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleApprove(change.row_id, change.request_id)
                        }
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
                      checked={selectedChanges[change.id] || false}
                      onCheckedChange={() => {
                        setSelectedChanges({
                          ...selectedChanges,
                          [change.id]: !selectedChanges[change.id],
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {change.user}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {change.dateTime}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {tableChanges.length > 0 && (
          <div className="border-t p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
