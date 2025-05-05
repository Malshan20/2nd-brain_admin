"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { downloadDocument } from "@/app/actions/documents"
import { useToast } from "@/components/ui/use-toast"
import type { Document } from "@/types"

interface DocumentViewerProps {
  document: Document
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Reset states when document changes
    setIsLoading(true)
    setError(null)

    // Simulate loading time for document preview
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [document.id])

  const handleDownload = async () => {
    try {
      setDownloadLoading(true)
      const result = await downloadDocument(document.id)

      if (result.success && result.url) {
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a")
        link.href = result.url
        link.download = document.title || `document-${document.id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Download started",
          description: "Your document is being downloaded",
        })
      } else {
        throw new Error(result.error || "Failed to download document")
      }
    } catch (err: any) {
      console.error("Download error:", err)
      toast({
        title: "Download failed",
        description: err.message || "There was a problem downloading this document",
        variant: "destructive",
      })
      setError("Failed to download document. Please try again later.")
    } finally {
      setDownloadLoading(false)
    }
  }

  const renderDocumentPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading document preview...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    // Handle different document types
    const type = document.type?.toLowerCase()

    // For images
    if (type === "image" || type === "png" || type === "jpg" || type === "jpeg" || type === "gif") {
      if (document.public_url) {
        return (
          <div className="flex justify-center bg-muted/30 rounded-md p-4">
            <img
              src={document.public_url || "/placeholder.svg"}
              alt={document.title || "Document preview"}
              className="max-h-[500px] object-contain"
              onError={() => setError("Failed to load image")}
            />
          </div>
        )
      }
    }

    // For PDFs
    if (type === "pdf" && document.public_url) {
      return (
        <div className="h-[500px] bg-muted/30 rounded-md">
          <iframe
            src={`${document.public_url}#toolbar=0&navpanes=0`}
            className="w-full h-full rounded-md"
            title={document.title || "PDF Document"}
          />
        </div>
      )
    }

    // For text content
    if (document.content) {
      return (
        <div className="bg-muted/30 rounded-md p-4 max-h-[500px] overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">{document.content}</pre>
        </div>
      )
    }

    // Default case - no preview available
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-md">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No preview available for this document</p>
        {document.public_url && (
          <Button variant="outline" className="mt-4" onClick={handleDownload}>
            Download to view
          </Button>
        )}
      </div>
    )
  }

  // Add this function after the useEffect hook
  const isDocumentDownloadable = () => {
    // Check if the document has a public_url or file_path
    return Boolean(document.public_url || document.file_path)
  }

  return (
    <div className="space-y-4">
      {renderDocumentPreview()}

      {isDocumentDownloadable() && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleDownload} disabled={downloadLoading} className="flex items-center gap-2">
            {downloadLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
