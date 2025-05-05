"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Document } from "@/types"

export async function getDocuments(
  page = 1,
  pageSize = 10,
  searchQuery = "",
  typeFilter = "",
  userId = "",
): Promise<{ data: Document[]; count: number }> {
  const supabase = createServerSupabaseClient()

  // Calculate the range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Start building the query
  let query = supabase
    .from("documents")
    .select("*, profiles!documents_user_id_fkey(full_name, username)", { count: "exact" })

  // Add search functionality
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
  }

  // Add type filter
  if (typeFilter && typeFilter !== "all") {
    query = query.eq("type", typeFilter)
  }

  // Add user filter
  if (userId) {
    query = query.eq("user_id", userId)
  }

  // Add pagination and ordering
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

  if (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }

  return {
    data: data.map((doc) => ({
      ...doc,
      user_name: doc.profiles?.full_name || doc.profiles?.username || "Unknown User",
    })) as Document[],
    count: count || 0,
  }
}

export async function getDocumentTypes(): Promise<string[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("documents").select("type").not("type", "is", null).order("type")

  if (error) {
    console.error("Error fetching document types:", error)
    return []
  }

  // Extract unique types
  const types = [...new Set(data.map((item) => item.type).filter(Boolean))]
  return types as string[]
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("documents")
    .select("*, profiles!documents_user_id_fkey(full_name, username)")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching document:", error)
    return null
  }

  return {
    ...data,
    user_name: data.profiles?.full_name || data.profiles?.username || "Unknown User",
  } as Document
}

export async function downloadDocument(id: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the document
    const { data, error } = await supabase
      .from("documents")
      .select("public_url, file_path, title")
      .eq("id", id)
      .single()

    if (error) {
      throw new Error("Document not found")
    }

    // If we have a public URL, return it
    if (data.public_url) {
      return { success: true, url: data.public_url }
    }

    // If we have a file path but no public URL, try to generate a signed URL
    if (data.file_path) {
      // Always use the "study-materials" bucket
      const bucketName = "study-materials"

      // Extract the path - if file_path includes the bucket name, remove it
      let path = data.file_path
      if (path.startsWith(`${bucketName}/`)) {
        path = path.substring(bucketName.length + 1)
      }

      // Generate a signed URL that expires in 60 seconds
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 60)

      if (signedUrlError) {
        console.error("Error generating signed URL:", signedUrlError)
        throw new Error("Failed to generate download link")
      }

      return { success: true, url: signedUrlData.signedUrl }
    }

    throw new Error("No download URL available for this document")
  } catch (error: any) {
    console.error("Error downloading document:", error)
    return { success: false, error: error.message || "Failed to download document" }
  }
}

export async function getRecentDocuments(limit = 5): Promise<Document[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("documents")
    .select("*, profiles!documents_user_id_fkey(full_name, username)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent documents:", error)
    return []
  }

  return data.map((doc) => ({
    ...doc,
    user_name: doc.profiles?.full_name || doc.profiles?.username || "Unknown User",
  })) as Document[]
}
