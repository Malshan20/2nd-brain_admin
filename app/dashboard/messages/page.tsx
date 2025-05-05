import { Suspense } from "react"
import { getContactMessages } from "../../actions"
import { DataTable } from "@/components/dashboard/data-table"

interface MessagesPageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
  }
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const page = Number(searchParams.page) || 1
  const searchQuery = searchParams.search || ""
  const statusFilter = searchParams.status || ""

  // Fetch data
  const { data, count } = await getContactMessages(page, 10, searchQuery, statusFilter)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">View and manage all contact messages</p>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading...</div>}>
          <DataTable
            data={data}
            count={count}
            page={page}
            pageSize={10}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        </Suspense>
      </div>
    </div>
  )
}
