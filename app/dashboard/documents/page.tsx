import { Suspense } from "react"
import { getDocuments, getDocumentTypes, getDocumentById } from "@/app/actions/documents"
import { DocumentsTable } from "@/components/dashboard/documents-table"
import { DocumentViewer } from "@/components/dashboard/document-viewer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DocumentsPageProps {
  searchParams: {
    page?: string
    search?: string
    type?: string
    user?: string
    document?: string
  }
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const page = Number(searchParams.page) || 1
  const searchQuery = searchParams.search || ""
  const typeFilter = searchParams.type || ""
  const userFilter = searchParams.user || ""
  const documentId = searchParams.document || ""

  // If a specific document ID is provided, show that document
  if (documentId) {
    const document = await getDocumentById(documentId)

    if (!document) {
      return (
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/documents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Documents
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Document Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested document could not be found.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/documents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Documents
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            Uploaded by {document.user_name} on {new Date(document.created_at).toLocaleDateString()}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentViewer document={document} />
          </CardContent>
        </Card>

        {document.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Fetch documents with pagination and filters
  const { data, count } = await getDocuments(page, 10, searchQuery, typeFilter, userFilter)

  // Fetch document types for the filter dropdown
  const documentTypes = await getDocumentTypes()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">View and manage user uploaded documents</p>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading documents...</div>}>
          <DocumentsTable
            data={data}
            count={count}
            page={page}
            pageSize={10}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            documentTypes={documentTypes}
          />
        </Suspense>
      </div>
    </div>
  )
}
