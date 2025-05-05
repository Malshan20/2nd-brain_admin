"use server"

import nodemailer from "nodemailer"

// Email configuration
const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "your-email@example.com",
    pass: process.env.SMTP_PASSWORD || "your-password",
  },
})

/**
 * Test the email configuration
 */
export async function testEmailConfig(): Promise<{ success: boolean; message?: string }> {
  try {
    const config = getEmailConfig()
    const transporter = nodemailer.createTransport(config)

    // Verify the connection
    await transporter.verify()

    return { success: true }
  } catch (error: any) {
    console.error("Email configuration error:", error)
    return {
      success: false,
      message: error.message || "Failed to connect to email server",
    }
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!email) {
      return { success: false, message: "Email address is required" }
    }

    const config = getEmailConfig()
    const transporter = nodemailer.createTransport(config)

    // Send test email
    await transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL || "noreply@example.com",
      to: email,
      subject: "Test Email from User Dashboard",
      text: "This is a test email from your User Dashboard application.",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your User Dashboard application.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
      `,
    })

    return {
      success: true,
      message: `Test email sent successfully to ${email}`,
    }
  } catch (error: any) {
    console.error("Error sending test email:", error)
    return {
      success: false,
      message: error.message || "Failed to send test email",
    }
  }
}

/**
 * Save email configuration
 */
export async function saveEmailConfig(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // In a real application, you would save these settings to a database
    // or update environment variables

    // For demonstration purposes, we'll just log the values
    const host = formData.get("smtp_host")
    const port = formData.get("smtp_port")
    const user = formData.get("smtp_user")
    const password = formData.get("smtp_password")
    const fromEmail = formData.get("from_email")
    const secure = formData.get("smtp_secure") === "on"

    console.log("Email configuration:", {
      host,
      port,
      user,
      secure,
      fromEmail,
    })

    // Test the configuration
    const config = {
      host: host as string,
      port: Number(port),
      secure,
      auth: {
        user: user as string,
        pass: password as string,
      },
    }

    const transporter = nodemailer.createTransport(config)
    await transporter.verify()

    return {
      success: true,
      message: "Email configuration saved and verified successfully",
    }
  } catch (error: any) {
    console.error("Error saving email config:", error)
    return {
      success: false,
      message: error.message || "Failed to save email configuration",
    }
  }
}
