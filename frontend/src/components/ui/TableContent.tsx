import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Check, X } from 'lucide-react'

interface ColumnChange {
  column: string
  oldValue: string
  newValue: string
}

interface Change {
  id: string
  request_id: string
  user: string
  dateTime: string
  reason: string
  changes: ColumnChange[]
  tableName: string
  status: 'pending' | 'approved' | 'rejected'
  newValues: Record<string, unknown>
  oldValues: Record<string, unknown>
  rowData: Record<string, unknown>
  changedColumns: string[]
  row_id: string
}

interface TableContentProps {
  tableName: string
  tableChanges: Change[]
  selectedChanges: Record<string, boolean>
  setSelectedChanges: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  handleApproveAll: (tableName: string) => void
  handleRejectAll: (tableName: string) => void
  handleApprove: (rowId: string, requestId: string) => void
  handleReject: (changeId: string) => void
  toggleChangeSelection: (changeId: string) => void
}

export function TableContent({
  tableName,
  tableChanges,
  selectedChanges,
  setSelectedChanges,
  handleApproveAll,
  handleRejectAll,
  handleApprove,
  handleReject,
  toggleChangeSelection
}: TableContentProps) {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`selectAll-${tableName}`}
            onCheckedChange={(checked) => {
              const newSelected = { ...selectedChanges };
              tableChanges.forEach((change) => {
                newSelected[change.id] = checked as boolean;
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
        <Button
          size="sm"
          className="font-medium"
          onClick={() => handleApproveAll(tableName)}
        >
          <Check className="h-4 w-4 mr-2" /> Approve All
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="font-medium"
          onClick={() => handleRejectAll(tableName)}
        >
          <X className="h-4 w-4 mr-2" /> Reject All
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/5">
              <TableHead className="w-[50px] font-semibold">No.</TableHead>
              <TableHead className="w-[120px] font-semibold">Actions</TableHead>
              <TableHead className="w-[50px] font-semibold">Select</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Date & Time</TableHead>
              {tableChanges[0]?.rowData &&
                Object.keys(tableChanges[0].rowData).map(
                  (columnName, colIndex) => (
                    <TableHead
                      key={`${tableName}-${columnName}-${colIndex}`}
                      className="font-semibold"
                    >
                      {columnName}
                    </TableHead>
                  )
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableChanges.map((change, index) => (
              <TableRow key={change.id} className="hover:bg-secondary/5">
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
                    onCheckedChange={() =>
                      toggleChangeSelection(change.id)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap font-medium">
                    {change.user}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap text-muted-foreground">
                    {change.dateTime}
                  </div>
                </TableCell>
                {change.rowData &&
                  Object.keys(change.rowData).map(
                    (columnName, colIndex) => {
                      const isChanged =
                        change.changedColumns?.includes(
                          columnName
                        ) || false;

                      return (
                        <TableCell
                          key={`${change.request_id}-${columnName}-${colIndex}`}
                          className={isChanged ? "bg-yellow-50/50" : ""}
                        >
                          {isChanged ? (
                            <div className="flex flex-col gap-1">
                              <span className="line-through text-red-500/80 text-sm">
                                {String(
                                  change.oldValues[
                                    columnName
                                  ] ?? "-"
                                )}
                              </span>
                              <span className="text-green-600 font-medium">
                                {String(
                                  change.newValues[
                                    columnName
                                  ] ?? "-"
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {String(
                                change.rowData[columnName] ??
                                  "-"
                              )}
                            </span>
                          )}
                        </TableCell>
                      );
                    }
                  )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
