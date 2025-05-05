"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { ContactMessage, DashboardStats } from "@/types"

export async function getContactMessages(
  page = 1,
  pageSize = 10,
  searchQuery = "",
  statusFilter = "",
): Promise<{ data: ContactMessage[]; count: number }> {
  const supabase = createServerSupabaseClient()

  // Calculate the range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Start building the query
  let query = supabase.from("contact_messages").select("*", { count: "exact" })

  // Add search functionality
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
  }

  // Add status filter (only if it's not "all" or empty)
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  // Add pagination and ordering
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

  if (error) {
    console.error("Error fetching contact messages:", error)
    throw new Error("Failed to fetch contact messages")
  }

  return {
    data: data as ContactMessage[],
    count: count || 0,
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient()

  // Get total count
  const { count: totalMessages } = await supabase.from("contact_messages").select("*", { count: "exact", head: true })

  // Get new messages (created in the last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { count: newMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo.toISOString())

  // Get resolved messages
  const { count: resolvedMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "resolved")

  // Get pending messages
  const { count: pendingMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return {
    totalMessages: totalMessages || 0,
    newMessages: newMessages || 0,
    resolvedMessages: resolvedMessages || 0,
    pendingMessages: pendingMessages || 0,
  }
}

export async function updateMessageStatus(id: string, status: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("contact_messages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating message status:", error)
    throw new Error("Failed to update message status")
  }
}
