import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';

interface CheckerActivity {
  request_id: string;
  table_name: string;
  status: 'approved' | 'rejected';
  updated_at: string;
  comments?: string;
  old_data: Record<string, any>;
  new_data: Record<string, any>;
}

interface CheckerLogProps {
  checker: string;
}

export function CheckerLog({ checker }: CheckerLogProps) {
  const [activities, setActivities] = useState<CheckerActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckerActivities = async () => {
      try {
        const response = await axios.post('http://localhost:8080/getallcheckerrequest', { checker });
        if (response.data.success) {
          setActivities(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching checker activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (checker) {
      fetchCheckerActivities();
    }
  }, [checker]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Loading activity history...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activity history found</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.request_id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(activity.updated_at)}
                    </TableCell>
                    <TableCell>{activity.table_name}</TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {Object.keys(activity.new_data || {}).map((key) => {
                          const oldValue = activity.old_data?.[key];
                          const newValue = activity.new_data?.[key];
                          if (oldValue !== newValue) {
                            return (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span>
                                <div className="flex flex-col gap-1 ml-2">
                                  <span className="line-through text-red-500/80">
                                    {String(oldValue ?? '-')}
                                  </span>
                                  <span className="text-green-600">
                                    {String(newValue ?? '-')}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.status === 'rejected' && activity.comments ? (
                        <span className="text-red-600">{activity.comments}</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
