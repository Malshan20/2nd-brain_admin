"use server"

import nodemailer from "nodemailer"

// Email configuration
// In production, you would use real SMTP credentials
const emailConfig = {
  // For development/testing, we can use a test account
  // In production, replace with your actual SMTP settings
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "your-email@example.com",
    pass: process.env.SMTP_PASSWORD || "your-password",
  },
}

// Create a transporter
const getTransporter = () => {
  return nodemailer.createTransport(emailConfig)
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  text?: string
  replyTo?: string
}

/**
 * Send an email using Nodemailer
 */
export async function sendMail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, subject, html, from, text, replyTo } = options

    // Default sender email
    const defaultFrom = process.env.DEFAULT_FROM_EMAIL || "noreply@example.com"

    // Get transporter
    const transporter = getTransporter()

    // Send email
    await transporter.sendMail({
      from: from || defaultFrom,
      to: Array.isArray(to) ? to.join(", ") : to,
      replyTo: replyTo || from || defaultFrom,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      html,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * For development/testing only: Create a test account with Ethereal
 * This allows you to see the sent emails in a web interface
 */
export async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount()

    console.log("Test email account created:", testAccount)
    console.log("Email preview URL: https://ethereal.email/login")
    console.log("Username:", testAccount.user)
    console.log("Password:", testAccount.pass)

    return testAccount
  } catch (error) {
    console.error("Failed to create test account:", error)
    return null
  }
}
