import Link from "next/link"
import { getRecentDocuments } from "@/app/actions/documents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, FileImage, FileIcon, FileCode } from "lucide-react"

export async function RecentDocuments() {
  const documents = await getRecentDocuments(5)

  const getDocumentIcon = (type: string | null) => {
    if (!type) return <FileText className="h-4 w-4" />

    switch (type.toLowerCase()) {
      case "pdf":
        return <FileIcon className="h-4 w-4 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImage className="h-4 w-4 text-green-500" />
      case "txt":
        return <FileCode className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>Recently uploaded documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No documents found</div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getDocumentIcon(doc.type)}
                  <div>
                    <Link href={`/dashboard/documents?document=${doc.id}`} className="font-medium hover:underline">
                      {doc.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Uploaded by {doc.user_name} on {formatDate(doc.created_at)}
                    </div>
                  </div>
                </div>
                <div>{getDocumentTypeBadge(doc.type)}</div>
              </div>
            ))
          )}

          <div className="pt-2">
            <Link href="/dashboard/documents" className="text-sm text-primary hover:underline">
              View all documents
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
