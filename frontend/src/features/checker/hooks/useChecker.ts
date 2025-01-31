import { useState, useEffect } from "react";
import { useToast } from "../../../hooks/use-toast";
import {
  fetchChangeTrackerData,
  approveChange,
  rejectChange,
  approveAllChanges,
  rejectAllChanges,
} from "../../../services/api";
import { Change, ChangeTrackerData, GroupData } from "../types";

export function useChecker() {
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

  useEffect(() => {
    loadData();
  }, []);

  return {
    pendingChanges,
    groups,
    isLoading,
    selectedChanges,
    setSelectedChanges,
    isRejectModalOpen,
    setIsRejectModalOpen,
    currentRejectId,
    setCurrentRejectId,
    rejectReason,
    setRejectReason,
    handleApproveAll,
    handleRejectAll,
    handleApprove,
    handleReject,
    toggleChangeSelection,
    submitReject,
  };
}
