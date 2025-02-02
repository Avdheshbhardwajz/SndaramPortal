"use client";

import React, { useEffect, useState } from "react";
import { Card } from "./ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { fetchCheckerActivities } from "../services/api";
import { useToast } from "../hooks/use-toast";
import { Pagination } from "./Pagination";

interface CheckerActivity {
  id: string;
  request_id: string;
  table_name: string;
  status: "approved" | "rejected" | "pending";
  updated_at: string;
  reason?: string;
  comments?: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
}

interface CheckerLogProps {
  checker: string;
}

type FilterType = "all" | "approved" | "rejected";

const ITEMS_PER_PAGE = 8;

export function CheckerLog({ checker }: CheckerLogProps) {
  const [activities, setActivities] = useState<CheckerActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const loadCheckerActivities = async () => {
    try {
      if (!checker) {
        console.error("Checker ID is missing");
        return;
      }

      setIsLoading(true);
      const result = await fetchCheckerActivities();

      if (result.success) {
        setActivities(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching checker activities:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checker) {
      loadCheckerActivities();
    }
  }, [checker]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [filter]);

  const getChanges = (
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ) => {
    const changes: string[] = [];
    Object.keys(newData).forEach((key) => {
      if (key === "request_id" || key === "row_id") return;

      const oldValue = String(oldData[key] ?? "");
      const newValue = String(newData[key] ?? "");

      if (oldValue !== newValue) {
        changes.push(`${oldValue} - ${newValue}`);
      }
    });
    return changes;
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.status === filter;
  });

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${day} ${month} '${year} ${time}`;
  };

  if (!checker) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-muted-foreground">
          No checker ID provided
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === "approved"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === "rejected"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-center text-muted-foreground">
                No activities found
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">No</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead className="w-[180px]">Date & Time</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[200px]">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.map((activity, index) => (
                    <TableRow key={activity.request_id}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{activity.table_name}</TableCell>
                      <TableCell>{formatDate(activity.updated_at)}</TableCell>
                      <TableCell>
                        {getChanges(activity.old_data, activity.new_data).map(
                          (change, i) => (
                            <div key={i} className="text-sm">
                              <span className="line-through text-red-500">
                                {change.split(" - ")[0]}
                              </span>
                              <span className="mx-2">-</span>
                              <span className="text-blue-600">
                                {change.split(" - ")[1]}
                              </span>
                            </div>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            activity.status === "approved"
                              ? "bg-green-100 text-green-600"
                              : activity.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {activity.status.charAt(0).toUpperCase() +
                            activity.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {activity.status === "rejected"
                          ? activity.reason ||
                            activity.comments ||
                            "Data Not Matched"
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
