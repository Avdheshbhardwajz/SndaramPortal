'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { fetchCheckerActivities } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface CheckerActivity {
  id: string
  request_id: string
  table_name: string
  status: 'approved' | 'rejected'
  updated_at: string
  reason?: string
  comments?: string
  old_data: Record<string, unknown>
  new_data: Record<string, unknown>
}

interface CheckerLogProps {
  checker: string
}

export function CheckerLog({ checker }: CheckerLogProps) {
  const [activities, setActivities] = useState<CheckerActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadCheckerActivities = async () => {
    try {
      if (!checker) {
        console.error('Checker ID is missing')
        return
      }

      setIsLoading(true)
      const result = await fetchCheckerActivities();
      
      if (result.success) {
        setActivities(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching checker activities:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (checker) {
      loadCheckerActivities()
    }
  }, [checker]) 

  const getChanges = (oldData: Record<string, unknown>, newData: Record<string, unknown>) => {
    const changes: string[] = []
    Object.keys(newData).forEach(key => {
      if (key === 'request_id' || key === 'row_id') return;
      
      if (String(oldData[key]) !== String(newData[key])) {
        changes.push(`${key}: ${String(oldData[key] ?? 'null')} → ${String(newData[key] ?? 'null')}`)
      }
    })
    return changes
  }

  if (!checker) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-muted-foreground">No checker ID provided</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full rounded-md border">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-center text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[300px]">Changes</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.request_id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {new Date(activity.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{activity.table_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={activity.status === 'approved' ? 'default' : 'destructive'}
                        className="flex w-24 items-center justify-center gap-1"
                      >
                        {activity.status === 'approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getChanges(activity.old_data, activity.new_data).map((change, index) => (
                          <div key={`${activity.request_id}-${index}`} className="text-sm text-muted-foreground">
                            {change}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.status === 'rejected' && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          <span>{activity.comments || activity.reason || 'No reason provided'}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
