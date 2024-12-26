import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CheckerActivity {
  id: string
  request_id: string
  table_name: string
  status: 'approved' | 'rejected'
  updated_at: string
  reason?: string
  old_data: Record<string, unknown>
  new_data: Record<string, unknown>
}

interface CheckerLogProps {
  checker: string
}

export function CheckerLog({ checker }: CheckerLogProps) {
  const [activities, setActivities] = useState<CheckerActivity[]>([])

  const fetchCheckerActivities = async () => {
    try {
      if (!checker) {
        console.error('Checker ID is missing');
        return;
      }

      const response = await fetch('http://localhost:8080/getallcheckerrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checker: checker }),
      })

      const result = await response.json()
      if (result.success) {
        setActivities(result.data)
      } else {
        console.error('Failed to fetch activities:', result.message)
      }
    } catch (error) {
      console.error('Error fetching checker activities:', error)
    }
  }

  useEffect(() => {
    if (checker) {
      fetchCheckerActivities()
    }
  }, [checker])

  const getChanges = (oldData: Record<string, unknown>, newData: Record<string, unknown>) => {
    const changes: string[] = []
    Object.keys(newData).forEach(key => {
      if (String(oldData[key]) !== String(newData[key])) {
        changes.push(`${key}: ${String(oldData[key])} → ${String(newData[key])}`)
      }
    })
    return changes
  }

  if (!checker) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.request_id}>
                  <TableCell className="font-medium">
                    {new Date(activity.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{activity.table_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={activity.status === 'approved' ? 'default' : 'destructive'}
                    >
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
                      <span className="text-sm text-muted-foreground">
                        {activity.reason}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
