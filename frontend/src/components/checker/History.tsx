import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  FileWarning,
  ArrowUpDown,
  Eye,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL, ENDPOINTS } from "@/config/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Pagination } from "@/components/Pagination";

interface HistoryRequest {
  request_id: string;
  table_name: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  maker: string;
  checker: string;
  status: string;
  created_at: string;
  updated_at: string;
  comments?: string;
}

interface HistoryResponse {
  success: boolean;
  data: HistoryRequest[];
}

// Add this type for filter status
type FilterStatus = "all" | "approved" | "rejected";

export const History = () => {
  const [requests, setRequests] = useState<HistoryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<HistoryRequest | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const itemsPerPage = 10; // Number of items per page
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}${ENDPOINTS.CHECKER.GET_ALL_REQUESTS}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data: HistoryResponse = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        throw new Error("Failed to fetch history");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter requests based on status
  const filteredRequests = requests.filter((request) => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  // Update pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const renderChanges = (
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ) => {
    const changes: string[] = [];
    Object.keys(newData).forEach((key) => {
      if (oldData[key] !== newData[key]) {
        // Format: "name: abhijith varaa → abhijith varaai"
        changes.push(
          `${key}: ${oldData[key] || "null"} → ${newData[key] || "null"}`
        );
      }
    });
    return changes;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-full h-16 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileWarning className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No history found
        </h3>
        <p className="text-gray-500">You haven't reviewed any changes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "all"
              ? "bg-[#1A237E] text-white"
              : "border border-gray-200 hover:border-[#1A237E] text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus("approved")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "approved"
              ? "bg-green-600 text-white"
              : "border border-gray-200 hover:border-green-600 text-gray-700"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilterStatus("rejected")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === "rejected"
              ? "bg-red-600 text-white"
              : "border border-gray-200 hover:border-red-600 text-gray-700"
          }`}
        >
          Rejected
        </button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Maker</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((request) => (
              <TableRow
                key={request.request_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium capitalize">
                  {request.table_name.toLowerCase().replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {request.status === "approved" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        request.status === "approved"
                          ? "text-green-700 capitalize"
                          : "text-red-700 capitalize"
                      }
                    >
                      {request.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{request.maker}</TableCell>
                <TableCell>
                  {format(new Date(request.updated_at), "dd MMM yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {request.comments ? (
                    <div className="max-w-[200px] truncate text-sm text-gray-600">
                      {request.comments}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-[#1A237E] hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRequests.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="max-w-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-2xl font-semibold">
              Change Details
            </DialogTitle>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-12">
                <div>
                  <h4 className="text-gray-500 font-medium mb-2">Table</h4>
                  <p className="text-lg capitalize text-gray-900">
                    {selectedRequest.table_name
                      .toLowerCase()
                      .replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-500 font-medium mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    {selectedRequest.status === "approved" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-[#00bfa5]" />
                        <span className="text-lg text-[#00bfa5]">approved</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-[#FF5722]" />
                        <span className="text-lg text-[#FF5722]">rejected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-500 font-medium mb-3">Changes</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {renderChanges(
                    selectedRequest.old_data,
                    selectedRequest.new_data
                  ).map((change, i) => (
                    <div key={i} className="text-gray-700">
                      {change.split("→").map((part, index) => (
                        <span
                          key={index}
                          className={
                            index === 0
                              ? "text-gray-600"
                              : "text-[#1A237E] font-medium"
                          }
                        >
                          {part}
                          {index === 0 && (
                            <span className="text-gray-400 mx-2">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
