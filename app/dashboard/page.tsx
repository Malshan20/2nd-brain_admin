import { Suspense } from "react"
import { getContactMessages, getDashboardStats } from "../actions"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DataTable } from "@/components/dashboard/data-table"
import { DocumentStats } from "@/components/dashboard/document-stats"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { MessageSquare, CheckCircle, Clock } from "lucide-react"

interface DashboardPageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const page = Number(searchParams.page) || 1
  const searchQuery = searchParams.search || ""
  const statusFilter = searchParams.status || ""

  // Fetch data
  const { data, count } = await getContactMessages(page, 10, searchQuery, statusFilter)
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage user contact messages and inquiries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Messages" value={stats.totalMessages} icon={<MessageSquare />} />
        <StatsCard
          title="New Messages"
          value={stats.newMessages}
          icon={<MessageSquare />}
          description="In the last 24 hours"
        />
        <StatsCard title="Resolved" value={stats.resolvedMessages} icon={<CheckCircle />} />
        <StatsCard title="Pending" value={stats.pendingMessages} icon={<Clock />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">Document Statistics</h2>
          <Suspense fallback={<div>Loading document statistics...</div>}>
            <DocumentStats />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div>Loading recent documents...</div>}>
            <RecentDocuments />
          </Suspense>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Messages</h2>
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
