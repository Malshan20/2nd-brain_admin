"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type SubscriptionUpdateData = {
  subscription_status?: string
  subscription_tier?: string
  subscription_start_date?: string | null
  subscription_end_date?: string | null
  paddle_customer_id?: string
  paddle_subscription_id?: string
}

export async function updateUserSubscription(userId: string, data: SubscriptionUpdateData) {
  try {
    const supabase = createServerSupabaseClient()

    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) {
      throw new Error(error.message)
    }

    // Revalidate the users page to reflect changes
    revalidatePath("/dashboard/users")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating subscription:", error)
    return {
      success: false,
      error: error.message || "Failed to update subscription",
    }
  }
}
