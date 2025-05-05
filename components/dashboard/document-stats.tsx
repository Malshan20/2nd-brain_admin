import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { FileText, FileImage, FileIcon as FilePdf, FileCode } from "lucide-react"

export async function DocumentStats() {
  const supabase = createServerSupabaseClient()

  // Get total count
  const { count: totalDocuments } = await supabase.from("documents").select("*", { count: "exact", head: true })

  // Get document counts by type
  const getTypeCount = async (type: string) => {
    const { count } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", type)
    return count || 0
  }

  const pdfCount = await getTypeCount("pdf")
  const imageCount = await getTypeCount("image")
  const textCount = await getTypeCount("txt")

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDocuments || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PDF Documents</CardTitle>
          <FilePdf className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pdfCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Image Documents</CardTitle>
          <FileImage className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{imageCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Text Documents</CardTitle>
          <FileCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{textCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
