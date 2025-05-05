"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendMail, createTestAccount } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"
import type { EmailTemplate } from "@/lib/email-templates"
import type { Profile } from "@/types"

// Function to get users for recipient selection
export async function getEmailRecipients(searchQuery = ""): Promise<Profile[]> {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("profiles").select("id, full_name, username, email")

  // Add search if provided
  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query.order("full_name").limit(100)

  if (error) {
    console.error("Error fetching email recipients:", error)
    return []
  }

  return data as Profile[]
}

// Function to get email templates
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  // In a real app, you might fetch these from a database
  // For now, we'll just return the predefined templates
  return emailTemplates
}

// Function to send an email
export async function sendEmail(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // Extract form data
    const emailAddresses = formData.getAll("recipients") as string[]
    const subject = formData.get("subject") as string
    const body = formData.get("body") as string
    const saveAsTemplate = formData.get("saveAsTemplate") === "on"
    const templateName = formData.get("templateName") as string

    // Validate required fields
    if (!emailAddresses.length || !subject || !body) {
      return {
        success: false,
        message: "Recipients, subject, and body are required",
      }
    }

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Validate all email addresses
    const invalidEmails = emailAddresses.filter((email) => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return {
        success: false,
        message: `Invalid email address${invalidEmails.length > 1 ? "es" : ""}: ${invalidEmails.join(", ")}`,
      }
    }

    // For development/testing, create a test account if needed
    // This allows you to see the sent emails in Ethereal's web interface
    // In production, you would use your actual SMTP settings
    if (process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST) {
      await createTestAccount()
    }

    // Send the email
    const emailResult = await sendMail({
      to: emailAddresses,
      subject,
      html: body,
    })

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send email")
    }

    // Save as template if requested
    if (saveAsTemplate && templateName) {
      // In a real app, you would save this to a database
      console.log("Saving template:", templateName)
    }

    // Log the email sending activity
    const supabase = createServerSupabaseClient()

    for (const email of emailAddresses) {
      // Try to find if this email belongs to a user in our system
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("email", email)
        .maybeSingle()

      await supabase.from("email_logs").insert({
        recipient_id: userData?.id || null,
        recipient_email: email,
        recipient_name: userData?.full_name || userData?.username || email.split("@")[0],
        subject,
        body,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
    }

    // Revalidate the email page
    revalidatePath("/dashboard/email")

    return {
      success: true,
      message: `Email sent successfully to ${emailAddresses.length} recipient(s)`,
    }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return {
      success: false,
      message: error.message || "Failed to send email",
    }
  }
}

// Function to get email logs
export async function getEmailLogs(page = 1, pageSize = 10): Promise<{ data: any[]; count: number }> {
  const supabase = createServerSupabaseClient()

  // Calculate the range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("email_logs")
    .select("*", { count: "exact" })
    .order("sent_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching email logs:", error)
    return { data: [], count: 0 }
  }

  return {
    data: data.map((log) => ({
      ...log,
      recipient_name: log.recipient_name || log.recipient_email.split("@")[0] || "Unknown",
    })),
    count: count || 0,
  }
}
