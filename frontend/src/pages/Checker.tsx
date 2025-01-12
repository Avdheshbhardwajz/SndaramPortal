import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, History, Home} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import logo from "../assets/Logo.png"
import { useToast } from "@/hooks/use-toast"
import { fetchChangeTrackerData, approveChange, rejectChange, approveAllChanges, rejectAllChanges } from '@/services/api'
import { CheckerLog } from '@/components/CheckerLog'
import { TableContent } from '@/components/ui/TableContent'
import { CheckerNotificationIcon } from '@/components/checker/CheckerNotificationIcon'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar'

// interface ApiResponse<T> {
//   success: boolean
//   message?: string
//   data?: T
// }

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
  row_id?: string
}

interface ColumnChange {
  column: string
  oldValue: string
  newValue: string
}

interface Change {
  id: string
  request_id: string
  row_id: string
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
  const [pendingChanges, setPendingChanges] = useState<Change[]>([])
  const [tableGroups, setTableGroups] = useState<TableGroups>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'history' | 'table'>('overview')
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleApproveAllRequests = async () => {
    try {
      setIsLoading(true);
      const requestIds = pendingChanges.map(change => change.row_id);
      
      const response = await approveAllChanges(requestIds);
      if (response.success) {
        toast({
          title: "Success",
          description: "All changes have been approved successfully",
          className: "bg-[#003B95] text-white border-none",
        });
        await loadPendingChanges();
        setSelectedChanges({});
      }
    } catch (error) {
      console.error('Error approving all changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve all changes",
        className: "bg-[#003B95] text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingChanges = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const [changesResponse, groupsResponse] = await Promise.all([
        fetchChangeTrackerData(),
        fetch('http://localhost:8080/getgrouplist', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
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
              request_id: change.request_id || '',
              row_id: change.row_id || '', // Use the actual row_id from the database
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

        if (groupsResponse.success && groupsResponse.data) {
          const groups = groupsResponse.data as GroupData[]
          const groupedChanges: TableGroups = {}
          
          groups.forEach(group => {
            groupedChanges[group.group_name] = []
          })

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
        description: "Failed to load pending changes",
        className: "bg-[#003B95] text-white border-none",
      });
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPendingChanges()
  }, [])

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges(prev => ({ ...prev, [changeId]: !prev[changeId] }))
  }

  const handleApprove = async (row_id: string, request_id: string) => {
    try {
      setIsLoading(true);
      const response = await approveChange(row_id, request_id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Change request approved successfully",
          variant: "default",
        });
        await loadPendingChanges();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve change",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving change:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve change",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      setIsLoading(true);
      const selectedChangesList = Object.entries(selectedChanges)
        .filter(([ , isSelected]) => isSelected)
        .map(([id]) => {
          const change = pendingChanges.find(c => c.id === id);
          return change ? { row_id: change.row_id } : null;
        })
        .filter(Boolean) as { row_id: string }[];

      if (selectedChangesList.length === 0) {
        toast({
          title: "Warning",
          description: "Please select changes to approve",
          variant: "destructive",
        });
        return;
      }

      const rowIds = selectedChangesList.map(change => change.row_id);

      await approveAllChanges(rowIds);
      toast({
        title: "Success",
        description: "Selected changes approved successfully",
        variant: "default",
      });
      loadPendingChanges();
      setSelectedChanges({});
    } catch (error) {
      console.error('Error approving changes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve changes",
        variant: "destructive",
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

  const handleReject = async (changeId: string) => {
    setCurrentRejectId(changeId)
    setIsRejectModalOpen(true)
  }

  const submitReject = async () => {
    try {
      setIsLoading(true);
      if (!rejectReason || rejectReason.trim().length === 0) {
        throw new Error('Please provide a reason for rejection');
      }

      if (rejectReason.length > 100) {
        throw new Error('Rejection reason must not exceed 100 characters');
      }

      // Handle single rejection
      if (currentRejectId && currentRejectId !== 'bulk') {
        const change = pendingChanges.find(c => c.id === currentRejectId);
        if (!change) {
          throw new Error('Selected change not found');
        }

        const response = await rejectChange(change.row_id, rejectReason.trim());
        if (response.success) {
          toast({
            title: "Success",
            description: "Change rejected successfully",
            className: "bg-[#003B95] text-white border-none",
          });
          setIsRejectModalOpen(false);
          setRejectReason("");
          setCurrentRejectId(null);
          await loadPendingChanges();
          return;
        }
      }

      // Handle bulk rejection
      const changesToReject = currentRejectId === 'bulk' 
        ? Object.entries(selectedChanges)
            .filter(([, isSelected]) => isSelected)
            .map(([id]) => pendingChanges.find(change => change.id === id))
            .filter((change): change is Change => change !== undefined)
        : [];

      if (changesToReject.length === 0) {
        throw new Error('No changes selected for rejection');
      }

      const requestIds = changesToReject.map(change => change.row_id);
      const response = await rejectAllChanges(requestIds, rejectReason.trim());

      if (response.success) {
        toast({
          title: "Success",
          description: "Changes rejected successfully",
          className: "bg-[#003B95] text-white border-none",
        });
        setIsRejectModalOpen(false);
        setRejectReason("");
        setCurrentRejectId(null);
        setSelectedChanges({});
        await loadPendingChanges();
      }
    } catch (error) {
      console.error('Error rejecting changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject changes",
        className: "bg-[#003B95] text-white border-none",
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
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 font-poppins">
        <Sidebar className="border-r bg-white shadow-sm w-72">
          <SidebarHeader>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Company Logo" className="h-8 w-auto" />
              </div>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent className="px-4 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2 space-y-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView('overview')}
                      className={`w-full justify-start px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeView === 'overview' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Overview
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView('history')}
                      className={`w-full justify-start px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeView === 'history' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    >
                      <History className="mr-3 h-4 w-4" />
                      History
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-2">
                Table Groups
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                {Object.entries(tableGroups).map(([groupName, changes]) => (
                  <SidebarGroup key={groupName} className="mb-2">
                    <SidebarGroupLabel 
                      onClick={() => setSelectedGroup(groupName === selectedGroup ? null : groupName)}
                      className="cursor-pointer flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium">{groupName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium text-xs">
                          {changes.length}
                        </Badge>
                        <ChevronRight 
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200
                            ${selectedGroup === groupName ? 'rotate-90' : ''}`} 
                        />
                      </div>
                    </SidebarGroupLabel>
                    {selectedGroup === groupName && (
                      <SidebarGroupContent className="ml-4 mt-1 space-y-1">
                        <SidebarMenu>
                          {Object.entries(
                            changes.reduce((acc, change) => {
                              if (!acc[change.tableName]) {
                                acc[change.tableName] = [];
                              }
                              acc[change.tableName].push(change);
                              return acc;
                            }, {} as Record<string, Change[]>)
                          ).map(([tableName, tableChanges]) => (
                            <SidebarMenuItem key={tableName}>
                              <SidebarMenuButton 
                                onClick={() => {
                                  setSelectedTable(tableName)
                                  setActiveView('table')
                                }}
                                className={`w-full justify-start px-2 py-1.5 text-sm rounded-md transition-colors
                                  ${activeView === 'table' && selectedTable === tableName 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'hover:bg-muted'}`}
                              >
                                <span className="truncate">{tableName}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {tableChanges.length}
                                </Badge>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    )}
                  </SidebarGroup>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
            <div>
              <h2 className="text-2xl font-semibold text-primary">
                {activeView === 'overview' ? 'Overview' : 
                 activeView === 'history' ? 'History' : 
                 selectedTable || 'Table View'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeView === 'overview' ? 'Monitor and manage pending changes' :
                 activeView === 'history' ? 'View past activities and actions' :
                 'Review and approve table modifications'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CheckerNotificationIcon />
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" onClick={handleLogout} className="font-medium gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-8">
            {activeView === 'overview' && (
              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold">Overview</CardTitle>
                    <CardDescription>Summary of pending changes across all tables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-primary">
                          {pendingChanges.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pending changes to review
                        </p>
                      </div>
                      {pendingChanges.length > 0 && (
                        <Button 
                          onClick={handleApproveAllRequests}
                          disabled={isLoading}
                          className="font-medium"
                          size="lg"
                        >
                          {isLoading ? "Approving..." : "Approve All Requests"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {Object.entries(tableGroups).map(([groupName, changes]) => 
                  changes.length > 0 && (
                    <Card key={groupName} className="border-none shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{groupName}</CardTitle>
                        <CardDescription>
                          {changes.length} pending changes in this group
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(
                            changes.reduce((acc, change) => {
                              if (!acc[change.tableName]) {
                                acc[change.tableName] = [];
                              }
                              acc[change.tableName].push(change);
                              return acc;
                            }, {} as Record<string, Change[]>)
                          ).map(([tableName, tableChanges]) => (
                            <div key={tableName} className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">{tableName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {tableChanges.length} changes pending
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedTable(tableName)
                                  setActiveView('table')
                                }}
                              >
                                Review Changes
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}

            {activeView === 'history' && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">Checker Log</CardTitle>
                  <CardDescription>Review past approvals and rejections</CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckerLog checker={localStorage.getItem('token') || ''} />
                </CardContent>
              </Card>
            )}

            {activeView === 'table' && selectedTable && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">
                    {selectedTable}
                  </CardTitle>
                  <CardDescription>
                    Review and manage pending changes for this table
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TableContent 
                    tableName={selectedTable}
                    tableChanges={pendingChanges.filter(change => change.tableName === selectedTable)}
                    selectedChanges={selectedChanges}
                    setSelectedChanges={setSelectedChanges}
                    handleApproveAll={handleApproveAll}
                    handleRejectAll={handleRejectAll}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                    toggleChangeSelection={toggleChangeSelection}
                  />
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md bg-white font-poppins">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Reject Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for rejection
              </Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 100 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectModalOpen(false)
                setRejectReason("")
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={submitReject}
              disabled={isLoading || !rejectReason.trim()}
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}