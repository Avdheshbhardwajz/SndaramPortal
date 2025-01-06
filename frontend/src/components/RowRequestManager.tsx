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
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, RefreshCcw, Eye } from 'lucide-react';

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

export const RowRequestManager: React.FC = () => {
  const [requests, setRequests] = useState<RowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fetchrowrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch requests',
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchRequests();
    const interval = setInterval(() => {
      void fetchRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleAccept = useCallback(async (request: RowRequest) => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      if (!userData.id) {
        throw new Error('Admin ID not found');
      }

      const response = await fetch('/api/approverowrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          request_id: request.request_id,
          admin_id: userData.id,
          admin_email: userData.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await response.json();
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to accept request',
      });
    }
  }, [fetchRequests, toast]);

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
    
    const preview = entries
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');
      
    return entries.length > 2 ? `${preview}, ...` : preview;
  }, [parseRowData]);

  const handleShowComments = useCallback((comments: string) => {
    toast({
      title: "Comments",
      description: comments,
    });
  }, [toast]);

  return (
    <Card className="col-span-full font-poppins bg-white">
      <CardHeader className="bg-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold font-poppins">Pending Row Requests</CardTitle>
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
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
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
                  <TableCell colSpan={5} className="text-center py-4 font-poppins">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 font-poppins">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.request_id}>
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
                          onClick={() => void handleAccept(request)}
                          title="Accept Request"
                          className="font-poppins"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        {request.comments && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowComments(request.comments!)}
                            title="View Comments"
                            className="font-poppins"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        )}
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
        isOpen={!!selectedData}
        onClose={() => setSelectedData(null)}
        data={selectedData || {}}
      />
    </Card>
  );
};
