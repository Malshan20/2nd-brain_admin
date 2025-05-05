"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContactMessage } from "@/types"
import { updateMessageStatus } from "@/app/actions"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface DataTableProps {
  data: ContactMessage[]
  count: number
  page: number
  pageSize: number
  searchQuery: string
  statusFilter: string
}

export function DataTable({ data, count, page, pageSize, searchQuery, statusFilter }: DataTableProps) {
  const router = useRouter()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter)
  const totalPages = Math.ceil(count / pageSize)

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("page", "1") // Reset to first page on new search
    if (localSearchQuery) params.set("search", localSearchQuery)
    if (localStatusFilter && localStatusFilter !== "all") params.set("status", localStatusFilter)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("page", newPage.toString())
    if (localSearchQuery) params.set("search", localSearchQuery)
    if (localStatusFilter && localStatusFilter !== "all") params.set("status", localStatusFilter)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMessageStatus(id, status)
      router.refresh()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Resolved</span>
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center gap-1 text-yellow-600">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>{status || "Unknown"}</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by name, email, or subject..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={localStatusFilter}
          onValueChange={(value) => {
            setLocalStatusFilter(value)
            const params = new URLSearchParams()
            params.set("page", "1")
            if (localSearchQuery) params.set("search", localSearchQuery)
            if (value && value !== "all") params.set("status", value)
            router.push(`/dashboard?${params.toString()}`)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              data.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {message.status !== "resolved" && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(message.id, "resolved")}>
                          Mark Resolved
                        </Button>
                      )}
                      {message.status !== "pending" && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(message.id, "pending")}>
                          Mark Pending
                        </Button>
                      )}
                    </div>
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
