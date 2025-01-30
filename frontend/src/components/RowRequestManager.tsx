import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardContent } from "../components/ui/Card"
import { useToast } from "../hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/Dialog"
import { Button } from "../components/ui/button"
import { Check, X, RefreshCcw, CheckSquare, XSquare, Eye } from "lucide-react"
import { Textarea } from "../components/ui/textarea"
import { Checkbox } from "../components/ui/checkbox"

interface RowRequest {
  request_id: string
  table_name: string
  row_data: string | Record<string, unknown>
  status: string
  maker: string
  created_at: string
  updated_at: string
  admin?: string
  comments?: string
  dim_employee_sk?: number
  name?: string
}

interface DataDialogProps {
  isOpen: boolean
  onClose: () => void
  data: Record<string, unknown>
}

interface RejectDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comments: string) => void
  title: string
}

const DataDialog: React.FC<DataDialogProps> = ({ isOpen, onClose, data }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="w-[50vw] h-[50vh] overflow-y-auto bg-white font-poppins rounded-lg p-6">
      <div className="absolute right-4 top-4">
        <button
          onClick={onClose}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 transition-colors group"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-red-500 group-hover:text-red-600 transition-colors"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">Row Data Details</DialogTitle>
      </DialogHeader>
      <div className="mt-6 px-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 rounded-t-lg">
              <TableHead className="w-1/3 font-poppins font-semibold text-gray-700">Field</TableHead>
              <TableHead className="font-poppins font-semibold text-gray-700">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(data).map(([key, value]) => (
              <TableRow key={key} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-poppins font-medium text-gray-900">{key}</TableCell>
                <TableCell className="font-poppins text-gray-700">{String(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
)

const RejectDialog: React.FC<RejectDialogProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [comments, setComments] = useState("")

  const handleConfirm = () => {
    if (!comments.trim()) {
      return
    }
    onConfirm(comments)
    setComments("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] h-[50vh] bg-white font-poppins rounded-lg p-6">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 transition-colors group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500 group-hover:text-red-600 transition-colors"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-6 flex flex-col h-[calc(100%-160px)]">
          <Textarea
            placeholder="Enter rejection reason..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="flex-1 font-poppins resize-none p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose} className="font-poppins">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="font-poppins bg-red-500 hover:bg-red-600 text-white">
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const RowRequestManager: React.FC = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RowRequest[]>([])
  const [selectedData, setSelectedData] = useState<Record<string, unknown> | null>(null)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [rejectDialogState, setRejectDialogState] = useState<{
    isOpen: boolean
    requestId: string
    isBulk: boolean
  }>({
    isOpen: false,
    requestId: "",
    isBulk: false,
  })

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching requests...")

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:8080/fetchrowrequest", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch requests")
      }

      const data = await response.json()
      console.log("Fetched requests:", data)

      if (data.success) {
        setRequests(data.data || [])
      } else {
        throw new Error(data.message || "Failed to fetch requests")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch requests",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        console.log("Accepting request:", requestId)
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("http://localhost:8080/acceptrow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_id: requestId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to accept request")
        }

        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Request accepted successfully",
            className: "bg-[#003087] text-white border-none",
          })
          void fetchRequests()
        } else {
          throw new Error(data.message || "Failed to accept request")
        }
      } catch (error) {
        console.error("Error accepting request:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to accept request",
        })
      }
    },
    [fetchRequests, toast],
  )

  const handleReject = useCallback(
    async (requestId: string, comments: string) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("http://localhost:8080/rejectrow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_id: requestId,
            comments,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to reject request")
        }

        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Request rejected successfully",
            className: "bg-[#003087] text-white border-none",
          })
          void fetchRequests()
        } else {
          throw new Error(data.message || "Failed to reject request")
        }
      } catch (error) {
        console.error("Error rejecting request:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to reject request",
        })
      }
    },
    [fetchRequests, toast],
  )

  const handleBulkAccept = useCallback(async () => {
    if (selectedRequests.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No requests selected",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:8080/acceptallrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_ids: selectedRequests,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept requests")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Selected requests accepted successfully",
          className: "bg-[#003087] text-white border-none",
        })
        setSelectedRequests([])
        void fetchRequests()
      } else {
        throw new Error(data.message || "Failed to accept requests")
      }
    } catch (error) {
      console.error("Error accepting requests:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept requests",
      })
    }
  }, [selectedRequests, fetchRequests, toast])

  const handleBulkReject = useCallback(
    async (comments: string) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("http://localhost:8080/rejectallrow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_ids: selectedRequests,
            comments,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to reject requests")
        }

        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Selected requests rejected successfully",
            className: "bg-[#003087] text-white border-none",
          })
          setSelectedRequests([])
          void fetchRequests()
        } else {
          throw new Error(data.message || "Failed to reject requests")
        }
      } catch (error) {
        console.error("Error rejecting requests:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to reject requests",
        })
      }
    },
    [selectedRequests, fetchRequests, toast],
  )

  const handleSelectAll = (checked: boolean) => {
    setSelectedRequests(checked ? requests.map((r) => r.request_id) : [])
  }

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    setSelectedRequests((prev) => (checked ? [...prev, requestId] : prev.filter((id) => id !== requestId)))
  }

  const parseRowData = (rowData: string | Record<string, unknown>) => {
    if (typeof rowData === "string") {
      try {
        return JSON.parse(rowData)
      } catch (error) {
        console.error("Error parsing row data:", error)
        return {}
      }
    }
    return rowData
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card className="">
      <CardHeader className="">
        <div className="flex justify-between items-center">
          
          <div className="flex gap-2">
            {selectedRequests.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleBulkAccept()}
                  disabled={loading}
                  className="font-poppins text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Accept Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRejectDialogState({
                      isOpen: true,
                      requestId: "",
                      isBulk: true,
                    })
                  }
                  disabled={loading}
                  className="font-poppins text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XSquare className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchRequests()}
              disabled={loading}
              className="font-poppins text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[50px] font-poppins font-semibold">
                  <Checkbox
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[100px] font-poppins font-semibold">Actions</TableHead>
                <TableHead className="w-[50px] font-poppins font-semibold">No.</TableHead>
                <TableHead className="font-poppins font-semibold">Table Name</TableHead>
                <TableHead className="font-poppins font-semibold">User</TableHead>
                <TableHead className="font-poppins font-semibold">Date & Time</TableHead>
                <TableHead className="font-poppins font-semibold">Data View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-poppins">
                    <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-poppins text-gray-500">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request, index) => {
                  const rowData = parseRowData(request.row_data)
                  return (
                    <TableRow key={request.request_id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedRequests.includes(request.request_id)}
                          onCheckedChange={(checked) => handleSelectRequest(request.request_id, checked as boolean)}
                          aria-label={`Select request ${request.request_id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleAccept(request.request_id)}
                            title="Accept Request"
                            className="font-poppins text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectDialogState({
                                isOpen: true,
                                requestId: request.request_id,
                                isBulk: false,
                              })
                            }}
                            title="Reject Request"
                            className="font-poppins text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-poppins font-medium">{index + 1}</TableCell>
                      <TableCell className="font-poppins">{request.table_name}</TableCell>
                      <TableCell className="font-poppins">{request.maker}</TableCell>
                      <TableCell className="font-poppins text-gray-600">{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedData(rowData)}
                          className="font-poppins text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DataDialog isOpen={selectedData !== null} onClose={() => setSelectedData(null)} data={selectedData || {}} />

      <RejectDialog
        isOpen={rejectDialogState.isOpen}
        onClose={() => setRejectDialogState({ isOpen: false, requestId: "", isBulk: false })}
        onConfirm={(comments) => {
          if (rejectDialogState.isBulk) {
            void handleBulkReject(comments)
          } else {
            void handleReject(rejectDialogState.requestId, comments)
          }
        }}
        title={rejectDialogState.isBulk ? "Reject Selected Requests" : "Reject Request"}
      />
    </Card>
  )
}
