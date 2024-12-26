import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, LogOut, Plus, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import logo from "../assets/Logo.png"
import { useToast } from "@/hooks/use-toast"
import { fetchChangeTrackerData, approveChange, rejectChange } from '@/services/api'
import { CheckerLog } from '@/components/CheckerLog'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

interface ChangeTrackerData {
  request_id: string
  id?: string
  maker?: string
  created_at: string
  comments?: string
  table_name: string
  status: 'pending' | 'approved' | 'rejected'
  new_data?: Record<string, unknown>
  old_data?: Record<string, unknown>
}

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
}

interface Table {
  name: string
  changes: Change[]
}

interface GroupData {
  group_name: string;
  table_list: string[];
}

interface TableGroups {
  [groupName: string]: Change[];
}

export default function EnhancedCheckerPage() {
  const [selectedChanges, setSelectedChanges] = useState<Record<string, boolean>>({})
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null)
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [pendingChanges, setPendingChanges] = useState<Change[]>([])
  const [tableGroups, setTableGroups] = useState<TableGroups>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadPendingChanges = async () => {
    try {
      setIsLoading(true)
      const [changesResponse, groupsResponse] = await Promise.all([
        fetchChangeTrackerData(),
        fetch('http://localhost:8080/getgrouplist').then(res => res.json())
      ])
      
      if (changesResponse.success && changesResponse.data) {
        const transformedChanges: Change[] = changesResponse.data
          .filter((change: ChangeTrackerData) => change.status === 'pending')
          .map((change: ChangeTrackerData) => {
            const changedColumns: string[] = []
            const newData = change.new_data || {}
            const oldData = change.old_data || {}
            
            Object.keys(newData).forEach(key => {
              if (String(newData[key]) !== String(oldData[key])) {
                changedColumns.push(key)
              }
            })

            return {
              id: change.request_id || change.id || '',
              request_id: change.request_id,
              user: change.maker || 'Unknown User',
              dateTime: new Date(change.created_at).toLocaleString(),
              reason: change.comments || '',
              changes: changedColumns.map(column => ({
                column,
                oldValue: String(oldData[column] || ''),
                newValue: String(newData[column] || '')
              })),
              tableName: change.table_name,
              status: change.status,
              newValues: newData,
              oldValues: oldData,
              rowData: { ...oldData, ...newData },
              changedColumns
            }
          })

        setPendingChanges(transformedChanges)

        // Organize changes by groups
        if (groupsResponse.success && groupsResponse.data) {
          const groups = groupsResponse.data as GroupData[]
          const groupedChanges: TableGroups = {}
          
          // Initialize all groups with empty arrays
          groups.forEach(group => {
            groupedChanges[group.group_name] = []
          })

          // Add ungrouped tables to "Ungrouped" category
          groupedChanges["Ungrouped"] = []

          transformedChanges.forEach(change => {
            let assigned = false
            groups.forEach(group => {
              if (group.table_list?.includes(change.tableName)) {
                groupedChanges[group.group_name].push(change)
                assigned = true
              }
            })
            if (!assigned) {
              groupedChanges["Ungrouped"].push(change)
            }
          })

          setTableGroups(groupedChanges)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pending changes"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPendingChanges()
  }, [])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }))
  }

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges(prev => ({ ...prev, [changeId]: !prev[changeId] }))
  }

  const handleApproveAll = async (tableName: string) => {
    try {
      setIsLoading(true);
      const selectedIds = Object.entries(selectedChanges)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => id);
      
      const itemsToApprove = selectedIds.length > 0 
        ? pendingChanges.filter(change => selectedIds.includes(change.id))
        : pendingChanges.filter(change => change.tableName === tableName);
  
      for (const change of itemsToApprove) {
        const response = await approveChange(change.request_id);
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to approve change: ${response.message}`
          });
        }
      }
  
      toast({
        title: "Success",
        description: "Selected changes approved successfully"
      });
      await loadPendingChanges();
      setSelectedChanges({});
    } catch (error) {
      console.error('Error approving changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve changes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = (tableName: string) => {
    const selectedIds = Object.entries(selectedChanges)
      .filter(([ ,isSelected]) => isSelected)
      .map(([id]) => id);
    
    const itemsToReject = selectedIds.length > 0 
      ? pendingChanges.filter(change => selectedIds.includes(change.id))
      : pendingChanges.filter(change => change.tableName === tableName);
  
    if (itemsToReject.length > 0) {
      setCurrentRejectId('bulk');
      setIsRejectModalOpen(true);
    }
  };

  const handleApprove = async (changeId: string) => {
    try {
      setIsLoading(true)
      const change = pendingChanges.find(c => c.id === changeId)
      if (!change) return

      const response: ApiResponse<unknown> = await approveChange(change.request_id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Change approved successfully"
        })
        await loadPendingChanges()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to approve change"
        })
      }
    } catch (error) {
      console.error('Error approving change:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve change"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = (changeId: string) => {
    setCurrentRejectId(changeId)
    setIsRejectModalOpen(true)
  }

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }
  
    try {
      setIsLoading(true);
      const selectedIds = Object.entries(selectedChanges)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => id);
      
      const itemsToReject = currentRejectId === 'bulk'
        ? (selectedIds.length > 0 
            ? pendingChanges.filter(change => selectedIds.includes(change.id))
            : pendingChanges.filter(change => change.tableName === currentRejectId))
        : pendingChanges.filter(change => change.id === currentRejectId);
  
      for (const change of itemsToReject) {
        const response: ApiResponse<unknown> = await rejectChange(change.request_id, rejectReason);
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to reject change: ${response.message}`
          });
        }
      }
  
      toast({
        title: "Success",
        description: "Changes rejected successfully"
      });
      setIsRejectModalOpen(false);
      setRejectReason("");
      setCurrentRejectId(null);
      setSelectedChanges({});
      await loadPendingChanges();
    } catch (error) {
      console.error('Error rejecting changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject changes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("checkerToken")
    localStorage.removeItem('userData');
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <header className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-12 w-auto mr-4" />
          <h1 className="text-2xl font-semibold text-primary">Admin Portal</h1>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="font-medium">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <div className="p-6">
        <CheckerLog checker={JSON.parse(localStorage.getItem('userData') || '{}').user_id || ''} />
      </div>

      <Card className="mx-6 mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-primary">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            You have <span className="font-semibold text-primary">{pendingChanges.length}</span> pending changes to review
          </p>
        </CardContent>
      </Card>

      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-primary">Pending Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground text-lg">Loading changes...</p>
                </div>
              ) : (
                Object.entries(tableGroups).map(([groupName, changes]) => 
                  changes.length > 0 && (
                    <div key={groupName} className="mb-6">
                      <div
                        className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg cursor-pointer mb-4 hover:bg-secondary/30 transition-colors"
                        onClick={() => toggleGroup(groupName)}
                      >
                        {expandedGroups[groupName] ? <Minus size={20} /> : <Plus size={20} />}
                        <h3 className="text-lg font-semibold text-primary">{groupName}</h3>
                        <Badge variant="secondary" className="font-medium">{changes.length}</Badge>
                      </div>
                      
                      {expandedGroups[groupName] && (
                        <div className="mt-3 space-y-4">
                          {Object.entries(
                            changes.reduce((acc, change) => {
                              if (!acc[change.tableName]) {
                                acc[change.tableName] = [];
                              }
                              acc[change.tableName].push(change);
                              return acc;
                            }, {} as Record<string, Change[]>)
                          ).map(([tableName, tableChanges]) => (
                            <Card key={tableName} className="mb-4 border-secondary/20">
                              <CardHeader 
                                className="cursor-pointer hover:bg-secondary/10 transition-colors" 
                                onClick={() => toggleTable(tableName)}
                              >
                                <CardTitle className="text-lg font-semibold flex items-center justify-between text-primary">
                                  {tableName}
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-medium">
                                      {tableChanges.length} {tableChanges.length === 1 ? 'change' : 'changes'}
                                    </Badge>
                                    {expandedTables[tableName] ? (
                                      <Minus className="h-4 w-4" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </div>
                                </CardTitle>
                              </CardHeader>

                              {expandedTables[tableName] && (
                                <CardContent>
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
                                                  onClick={() => handleApprove(change.id)}
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
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="font-poppins">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">Reject Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">Reason for rejection</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="font-poppins"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
              }}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={submitReject}
              disabled={isLoading || !rejectReason.trim()}
              className="font-medium"
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}