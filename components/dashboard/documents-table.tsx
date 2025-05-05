"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, FileText, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentViewer } from "./document-viewer"
import type { Document } from "@/types"

// Add a utility function to format file paths

// Add this function before the DocumentsTable component
const formatFilePath = (filePath: string | null) => {
  if (!filePath) return "N/A"

  // If the path is too long, truncate it
  if (filePath.length > 30) {
    return `...${filePath.substring(filePath.length - 30)}`
  }

  return filePath
}

interface DocumentsTableProps {
  data: Document[]
  count: number
  page: number
  pageSize: number
  searchQuery: string
  typeFilter: string
  documentTypes: string[]
}

export function DocumentsTable({
  data,
  count,
  page,
  pageSize,
  searchQuery,
  typeFilter,
  documentTypes,
}: DocumentsTableProps) {
  const router = useRouter()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [localTypeFilter, setLocalTypeFilter] = useState(typeFilter)
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const totalPages = Math.ceil(count / pageSize)

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("page", "1") // Reset to first page on new search
    if (localSearchQuery) params.set("search", localSearchQuery)
    if (localTypeFilter && localTypeFilter !== "all") params.set("type", localTypeFilter)
    router.push(`/dashboard/documents?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("page", newPage.toString())
    if (localSearchQuery) params.set("search", localSearchQuery)
    if (localTypeFilter && localTypeFilter !== "all") params.set("type", localTypeFilter)
    router.push(`/dashboard/documents?${params.toString()}`)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getDocumentTypeBadge = (type: string | null) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>

    switch (type.toLowerCase()) {
      case "pdf":
        return <Badge className="bg-red-500">PDF</Badge>
      case "doc":
      case "docx":
        return <Badge className="bg-blue-500">Word</Badge>
      case "txt":
        return <Badge className="bg-gray-500">Text</Badge>
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <Badge className="bg-green-500">Image</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by title or summary..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={localTypeFilter}
          onValueChange={(value) => {
            setLocalTypeFilter(value)
            const params = new URLSearchParams()
            params.set("page", "1")
            if (localSearchQuery) params.set("search", localSearchQuery)
            if (value && value !== "all") params.set("type", value)
            router.push(`/dashboard/documents?${params.toString()}`)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              data.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{document.title}</div>
                        {document.summary && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{document.summary}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getDocumentTypeBadge(document.type)}</TableCell>
                  <TableCell>{document.user_name || "Unknown"}</TableCell>
                  <TableCell>{formatDate(document.created_at)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDialog === document.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenDialog(document.id)
                        } else {
                          setOpenDialog(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>{document.title}</DialogTitle>
                          <DialogDescription>
                            Uploaded by {document.user_name} on {formatDate(document.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[calc(90vh-120px)]">
                          <div className="p-4 space-y-6">
                            <Tabs defaultValue="preview">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="content">Content</TabsTrigger>
                              </TabsList>

                              <TabsContent value="preview" className="space-y-4 pt-4">
                                <DocumentViewer document={document} />
                              </TabsContent>

                              <TabsContent value="details" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Document Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">ID</span>
                                        <span className="text-sm truncate max-w-[180px]">{document.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">Type</span>
                                        <span className="text-sm">{getDocumentTypeBadge(document.type)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">Created</span>
                                        <span className="text-sm">{formatDate(document.created_at)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">Updated</span>
                                        <span className="text-sm">{formatDate(document.updated_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">File Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">File Path</span>
                                        <span className="text-sm truncate max-w-[180px]">
                                          {formatFilePath(document.file_path)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">User ID</span>
                                        <span className="text-sm truncate max-w-[180px]">
                                          {document.user_id || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">Subject ID</span>
                                        <span className="text-sm truncate max-w-[180px]">
                                          {document.subject_id || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {document.summary && (
                                  <div className="space-y-2 border-t pt-4">
                                    <h4 className="text-sm font-medium">Summary</h4>
                                    <p className="text-sm whitespace-pre-wrap">{document.summary}</p>
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="content" className="space-y-4 pt-4">
                                {document.content ? (
                                  <div className="border rounded-md p-4 bg-muted/30">
                                    <pre className="text-sm whitespace-pre-wrap">{document.content}</pre>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No content available for this document
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
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
