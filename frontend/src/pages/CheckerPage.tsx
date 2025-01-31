"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Separator } from "../components/ui/separator";
import logo from "../assets/images/Logo-Full.svg";
import { useToast } from "../hooks/use-toast";
import {
  fetchChangeTrackerData,
  approveChange,
  rejectChange,
  approveAllChanges,
  rejectAllChanges,
} from "../services/api";
import { CheckerLog } from "../components/CheckerLog";
import { TableContent } from "../components/ui/TableContent";
import { CheckerNotificationIcon } from "../components/CheckerNotificationIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/Dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

interface ChangeTrackerData {
  request_id: string;
  id?: string;
  maker?: string;
  created_at: string;
  comments?: string;
  table_name: string;
  status: "pending" | "approved" | "rejected";
  new_data?: Record<string, unknown>;
  old_data?: Record<string, unknown>;
  row_id?: string;
}

interface Change {
  id: string;
  request_id: string;
  row_id: string;
  user: string;
  dateTime: string;
  reason: string;
  tableName: string;
  status: "pending" | "approved" | "rejected";
  newValues: Record<string, unknown>;
  oldValues: Record<string, unknown>;
  rowData: Record<string, unknown>;
  changedColumns: string[];
}

interface GroupData {
  group_name: string;
  table_list: string[];
}

export default function CheckerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );
  const [groupView, setGroupView] = useState<"group" | "ungroup">("ungroup");
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChanges, setSelectedChanges] = useState<
    Record<string, boolean>
  >({});
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") || "User";

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const [changesResponse, groupsResponse] = await Promise.all([
        fetchChangeTrackerData(),
        fetch("http://localhost:8080/getgrouplist", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((res) => res.json()),
      ]);

      if (changesResponse.success && changesResponse.data) {
        // Transform the data to match the Change interface
        const transformedChanges: Change[] = changesResponse.data.map(
          (item: ChangeTrackerData) => ({
            id: item.request_id || item.id || "",
            request_id: item.request_id,
            row_id: item.row_id || "",
            user: item.maker || "Unknown",
            dateTime: new Date(item.created_at).toLocaleString(),
            reason: item.comments || "",
            tableName: item.table_name,
            status: item.status,
            newValues: item.new_data || {},
            oldValues: item.old_data || {},
            rowData: { ...item.old_data, ...item.new_data },
            changedColumns: Object.keys(item.new_data || {}).filter(
              (key) =>
                String(item.new_data?.[key]) !== String(item.old_data?.[key])
            ),
          })
        );
        setPendingChanges(transformedChanges);
      }

      if (groupsResponse.success && groupsResponse.data) {
        setGroups(groupsResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleApproveAll = async () => {
    try {
      const selectedIds = Object.entries(selectedChanges)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => {
          const change = pendingChanges.find((c) => c.id === id);
          return change?.row_id;
        })
        .filter((id): id is string => id !== undefined);

      if (selectedIds.length === 0) {
        toast({
          title: "Warning",
          description: "Please select changes to approve",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const response = await approveAllChanges(selectedIds);

      if (response.success) {
        toast({
          title: "Success",
          description: "Selected changes approved successfully",
          variant: "default",
        });
        await loadData();
        setSelectedChanges({});
      }
    } catch (error) {
      console.error("Error approving changes:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    const selectedIds = Object.entries(selectedChanges)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => {
        const change = pendingChanges.find((c) => c.id === id);
        return change?.row_id;
      })
      .filter((id): id is string => id !== undefined);

    if (selectedIds.length === 0) {
      toast({
        title: "Warning",
        description: "Please select changes to reject",
        variant: "destructive",
      });
      return;
    }

    setCurrentRejectId("bulk");
    setIsRejectModalOpen(true);
  };

  const submitReject = async (reason: string) => {
    try {
      setIsLoading(true);
      if (currentRejectId === "bulk") {
        const selectedIds = Object.entries(selectedChanges)
          .filter(([, isSelected]) => isSelected)
          .map(([id]) => {
            const change = pendingChanges.find((c) => c.id === id);
            return change?.row_id;
          })
          .filter((id): id is string => id !== undefined);

        const response = await rejectAllChanges(selectedIds, reason);
        if (response.success) {
          toast({
            title: "Success",
            description: "Selected changes rejected successfully",
            variant: "default",
          });
          setSelectedChanges({});
        }
      } else if (currentRejectId) {
        const change = pendingChanges.find((c) => c.id === currentRejectId);
        if (change) {
          const response = await rejectChange(change.row_id, reason);
          if (response.success) {
            toast({
              title: "Success",
              description: "Change rejected successfully",
              variant: "default",
            });
          }
        }
      }
      setIsRejectModalOpen(false);
      setCurrentRejectId(null);
      await loadData();
    } catch (error) {
      console.error("Error rejecting changes:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (rowId: string, requestId: string) => {
    try {
      setIsLoading(true);
      const response = await approveChange(rowId, requestId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Change approved successfully",
          variant: "default",
        });
        await loadData();
      }
    } catch (error) {
      console.error("Error approving change:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve change",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = (changeId: string) => {
    setCurrentRejectId(changeId);
    setIsRejectModalOpen(true);
  };

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges((prev) => ({
      ...prev,
      [changeId]: !prev[changeId],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <div className="ml-auto flex items-center space-x-4">
            <CheckerNotificationIcon />
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hello, {firstName}</h1>
            <p className="text-muted-foreground">
              Summary of pending changes across all tables
            </p>
          </div>

          <Tabs
            defaultValue="overview"
            className="w-full"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "overview" | "history")
            }
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="mt-4">
                <div className="p-6">
                  <Tabs
                    defaultValue="ungroup"
                    onValueChange={(value) =>
                      setGroupView(value as "group" | "ungroup")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="ungroup">Ungroup</TabsTrigger>
                      <TabsTrigger value="group">Group</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="mt-6">
                    {isLoading ? (
                      <div>Loading...</div>
                    ) : groupView === "ungroup" ? (
                      <TableContent
                        tableName="Ungrouped"
                        tableChanges={pendingChanges.filter(
                          (change) =>
                            !groups.some((group) =>
                              group.table_list.includes(change.tableName)
                            )
                        )}
                        selectedChanges={selectedChanges}
                        setSelectedChanges={setSelectedChanges}
                        handleApproveAll={handleApproveAll}
                        handleRejectAll={handleRejectAll}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        toggleChangeSelection={toggleChangeSelection}
                      />
                    ) : (
                      groups.map((group) => (
                        <div key={group.group_name} className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">
                            {group.group_name}
                          </h3>
                          <TableContent
                            tableName={group.group_name}
                            tableChanges={pendingChanges.filter((change) =>
                              group.table_list.includes(change.tableName)
                            )}
                            selectedChanges={selectedChanges}
                            setSelectedChanges={setSelectedChanges}
                            handleApproveAll={handleApproveAll}
                            handleRejectAll={handleRejectAll}
                            handleApprove={handleApprove}
                            handleReject={handleReject}
                            toggleChangeSelection={toggleChangeSelection}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="mt-4">
                <div className="p-6">
                  <CheckerLog checker={localStorage.getItem("token") || ""} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Changes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRejectReason(e.target.value)
                }
                value={rejectReason}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setCurrentRejectId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitReject(rejectReason)}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
