import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, RefreshCcw, Eye, CheckSquare, XSquare } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface RowRequest {
  request_id: string;
  table_name: string;
  row_data: string | Record<string, unknown>;
  status: string;
  maker: string;
  created_at: string;
  updated_at: string;
  admin?: string;
  comments?: string;
}

interface DataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, unknown>;
}

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  title: string;
}

const DataDialog: React.FC<DataDialogProps> = ({ isOpen, onClose, data }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white font-poppins">
      <DialogHeader>
        <DialogTitle className="font-poppins text-xl">Row Data Details</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableHead className="w-1/3 font-poppins">Field</TableHead>
              <TableHead className="font-poppins">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {Object.entries(data).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-poppins font-medium">{key}</TableCell>
                <TableCell className="font-poppins">{String(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);

const RejectDialog: React.FC<RejectDialogProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
    if (!comments.trim()) {
      return;
    }
    onConfirm(comments);
    setComments('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white font-poppins">
        <DialogHeader>
          <DialogTitle className="font-poppins text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[100px] font-poppins"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-poppins">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!comments.trim()} className="font-poppins">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RowRequestManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RowRequest[]>([]);
  const [selectedData, setSelectedData] = useState<Record<string, unknown> | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [rejectDialogState, setRejectDialogState] = useState<{
    isOpen: boolean;
    requestId: string;
    isBulk: boolean;
  }>({
    isOpen: false,
    requestId: '',
    isBulk: false
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching requests...');
      
      const response = await fetch('http://localhost:8080/fetchrowrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      console.log('Fetched requests:', data);
      
      if (data.success) {
        setRequests(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch requests',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      console.log('Accepting request:', requestId);
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      if (!userData.user_id) {
        throw new Error('Admin ID not found');
      }

      console.log('Making API call to accept request');
      const response = await fetch('http://localhost:8080/acceptrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          request_id: requestId,
          admin: userData.user_id,
        }),
      });

      console.log('API Response:', response.status);

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: "Request accepted successfully",
        });
        void fetchRequests();
      } else {
        throw new Error(data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error in handleAccept:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to accept request',
      });
    }
  }, [fetchRequests, toast]);

  const handleReject = useCallback(async (requestId: string, comments: string) => {
    try {
      console.log('Rejecting request:', requestId, 'with comments:', comments);
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      if (!userData.user_id) {
        throw new Error('Admin ID not found');
      }

      console.log('Making API call to reject request');
      const response = await fetch('http://localhost:8080/rejectrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          request_id: requestId,
          admin: userData.user_id,
          comments
        }),
      });

      console.log('API Response:', response.status);

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: "Request rejected successfully",
        });
        void fetchRequests();
      } else {
        throw new Error(data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error in handleReject:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reject request',
      });
    }
  }, [fetchRequests, toast]);

  const handleBulkAccept = useCallback(async () => {
    if (selectedRequests.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No requests selected",
      });
      return;
    }

    try {
      console.log('Bulk accepting requests:', selectedRequests);
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      if (!userData.user_id) {
        throw new Error('Admin ID not found');
      }

      console.log('Making API call to accept all requests');
      const response = await fetch('http://localhost:8080/acceptallrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          request_ids: selectedRequests,
          admin: userData.user_id,
        }),
      });

      console.log('API Response:', response.status);

      if (!response.ok) {
        throw new Error('Failed to accept requests');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: "All selected requests accepted successfully",
        });
        setSelectedRequests([]);
        void fetchRequests();
      } else {
        throw new Error(data.message || 'Failed to accept requests');
      }
    } catch (error) {
      console.error('Error in handleBulkAccept:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to accept requests',
      });
    }
  }, [selectedRequests, fetchRequests, toast]);

  const handleBulkReject = useCallback(async (comments: string) => {
    if (selectedRequests.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No requests selected",
      });
      return;
    }

    try {
      console.log('Bulk rejecting requests:', selectedRequests, 'with comments:', comments);
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      if (!userData.user_id) {
        throw new Error('Admin ID not found');
      }

      console.log('Making API call to reject all requests');
      const response = await fetch('http://localhost:8080/rejectallrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          request_ids: selectedRequests,
          admin: userData.user_id,
          comments
        }),
      });

      console.log('API Response:', response.status);

      if (!response.ok) {
        throw new Error('Failed to reject requests');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: "All selected requests rejected successfully",
        });
        setSelectedRequests([]);
        void fetchRequests();
      } else {
        throw new Error(data.message || 'Failed to reject requests');
      }
    } catch (error) {
      console.error('Error in handleBulkReject:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reject requests',
      });
    }
  }, [selectedRequests, fetchRequests, toast]);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedRequests(checked ? requests.map(r => r.request_id) : []);
  }, [requests]);

  const handleSelectRequest = useCallback((requestId: string, checked: boolean) => {
    setSelectedRequests(prev => 
      checked 
        ? [...prev, requestId]
        : prev.filter(id => id !== requestId)
    );
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const parseRowData = useCallback((rowData: RowRequest['row_data']): Record<string, unknown> => {
    try {
      if (typeof rowData === 'string') {
        return JSON.parse(rowData);
      }
      return rowData;
    } catch {
      return { data: String(rowData) };
    }
  }, []);

  const getDataPreview = useCallback((rowData: RowRequest['row_data']): string => {
    const data = parseRowData(rowData);
    const entries = Object.entries(data);
    if (entries.length === 0) return 'No data';
    
    const [key, value] = entries[0];
    return `${key}: ${String(value)}${entries.length > 1 ? ' ...' : ''}`;
  }, [parseRowData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-poppins text-2xl">Row Requests</CardTitle>
          <div className="flex gap-2">
            {selectedRequests.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleBulkAccept()}
                  disabled={loading}
                  className="font-poppins"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Accept Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectDialogState({
                    isOpen: true,
                    requestId: '',
                    isBulk: true
                  })}
                  disabled={loading}
                  className="font-poppins"
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
              className="font-poppins"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="w-[50px] font-poppins">
                  <Checkbox
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="font-poppins">Table</TableHead>
                <TableHead className="font-poppins">Data Preview</TableHead>
                <TableHead className="font-poppins">Maker</TableHead>
                <TableHead className="font-poppins">Created At</TableHead>
                <TableHead className="font-poppins">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 font-poppins">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 font-poppins">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.request_id)}
                        onCheckedChange={(checked) => handleSelectRequest(request.request_id, checked as boolean)}
                        aria-label={`Select request ${request.request_id}`}
                      />
                    </TableCell>
                    <TableCell className="font-poppins font-medium">{request.table_name}</TableCell>
                    <TableCell className="max-w-md font-poppins">
                      <div className="flex items-center gap-2">
                        <span className="truncate">
                          {getDataPreview(request.row_data)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedData(parseRowData(request.row_data))}
                          title="View Full Data"
                          className="font-poppins"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins">{request.maker}</TableCell>
                    <TableCell className="font-poppins">{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('Accept button clicked for request:', request.request_id);
                            void handleAccept(request.request_id);
                          }}
                          title="Accept Request"
                          className="font-poppins"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('Reject button clicked for request:', request.request_id);
                            setRejectDialogState({
                              isOpen: true,
                              requestId: request.request_id,
                              isBulk: false
                            });
                          }}
                          title="Reject Request"
                          className="font-poppins"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <DataDialog
        isOpen={selectedData !== null}
        onClose={() => setSelectedData(null)}
        data={selectedData || {}}
      />

      <RejectDialog
        isOpen={rejectDialogState.isOpen}
        onClose={() => setRejectDialogState({ isOpen: false, requestId: '', isBulk: false })}
        onConfirm={(comments) => {
          console.log('Reject dialog confirmed with comments:', comments);
          if (rejectDialogState.isBulk) {
            void handleBulkReject(comments);
          } else {
            void handleReject(rejectDialogState.requestId, comments);
          }
        }}
        title={rejectDialogState.isBulk ? "Reject Selected Requests" : "Reject Request"}
      />
    </Card>
  );
};
