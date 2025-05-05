import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ProfilesTable } from "@/components/dashboard/profiles-table"
import type { Profile } from "@/types"

interface UsersPageProps {
  searchParams: {
    page?: string
    search?: string
  }
}

async function getProfiles(page = 1, pageSize = 10, searchQuery = ""): Promise<{ data: Profile[]; count: number }> {
  const supabase = createServerSupabaseClient()

  // Calculate the range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Start building the query
  let query = supabase.from("profiles").select("*", { count: "exact" })

  // Add search functionality
  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,school.ilike.%${searchQuery}%,major.ilike.%${searchQuery}%`,
    )
  }

  // Add pagination and ordering
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

  if (error) {
    console.error("Error fetching profiles:", error)
    throw new Error("Failed to fetch profiles")
  }

  return {
    data: data as Profile[],
    count: count || 0,
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const page = Number(searchParams.page) || 1
  const searchQuery = searchParams.search || ""

  // Fetch profiles with pagination and search
  const { data, count } = await getProfiles(page, 10, searchQuery)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">View and manage user profiles</p>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading profiles...</div>}>
          <ProfilesTable data={data} count={count} page={page} pageSize={10} searchQuery={searchQuery} />
        </Suspense>
      </div>
    </div>
  )
}
