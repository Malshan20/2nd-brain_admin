"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Mail, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface EmailLogsProps {
  logs: any[]
  count: number
  page: number
}

export function EmailLogs({ logs, count, page }: EmailLogsProps) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const pageSize = 10
  const totalPages = Math.ceil(count / pageSize)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("tab", "logs")
    params.set("page", newPage.toString())
    router.push(`/dashboard/email?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return <Badge className="bg-green-500">Sent</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No email logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{log.recipient_name}</div>
                        <div className="text-xs text-muted-foreground">{log.recipient_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{formatDate(log.sent_at)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDialog === log.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenDialog(log.id)
                        } else {
                          setOpenDialog(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>{log.subject}</DialogTitle>
                          <DialogDescription>
                            Sent to {log.recipient_name} ({log.recipient_email}) on {formatDate(log.sent_at)}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[calc(90vh-120px)]">
                          <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">Status: {getStatusBadge(log.status)}</div>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/30">
                              <div dangerouslySetInnerHTML={{ __html: log.body }} />
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
