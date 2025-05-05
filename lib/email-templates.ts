export type EmailTemplate = {
    id: string
    name: string
    subject: string
    body: string
  }
  
  // Predefined email templates
  export const emailTemplates: EmailTemplate[] = [
    {
      id: "welcome",
      name: "Welcome Email",
      subject: "Welcome to Our Platform!",
      body: `<p>Dear {{name}},</p>
  <p>Welcome to our platform! We're excited to have you join our community.</p>
  <p>Here are a few things you can do to get started:</p>
  <ul>
    <li>Complete your profile</li>
    <li>Explore our features</li>
    <li>Connect with other users</li>
  </ul>
  <p>If you have any questions, feel free to reach out to our support team.</p>
  <p>Best regards,<br>The Team</p>`,
    },
    {
      id: "password-reset",
      name: "Password Reset",
      subject: "Password Reset Instructions",
      body: `<p>Dear {{name}},</p>
  <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
  <p>To reset your password, please click the link below:</p>
  <p><a href="{{resetLink}}">Reset Password</a></p>
  <p>This link will expire in 24 hours.</p>
  <p>Best regards,<br>The Team</p>`,
    },
    {
      id: "subscription-renewal",
      name: "Subscription Renewal Reminder",
      subject: "Your Subscription is About to Expire",
      body: `<p>Dear {{name}},</p>
  <p>This is a friendly reminder that your subscription will expire on {{expiryDate}}.</p>
  <p>To continue enjoying our services without interruption, please renew your subscription before the expiration date.</p>
  <p><a href="{{renewLink}}">Renew Subscription</a></p>
  <p>Thank you for your continued support!</p>
  <p>Best regards,<br>The Team</p>`,
    },
    {
      id: "new-feature",
      name: "New Feature Announcement",
      subject: "Exciting New Features Available!",
      body: `<p>Dear {{name}},</p>
  <p>We're excited to announce that we've added some great new features to our platform!</p>
  <p>Here's what's new:</p>
  <ul>
    <li>Feature 1: Enhanced dashboard with more analytics</li>
    <li>Feature 2: Improved document management</li>
    <li>Feature 3: Advanced search capabilities</li>
  </ul>
  <p>Log in to check out these exciting new features!</p>
  <p>Best regards,<br>The Team</p>`,
    },
    {
      id: "account-verification",
      name: "Account Verification",
      subject: "Verify Your Account",
      body: `<p>Dear {{name}},</p>
  <p>Thank you for creating an account. To complete your registration, please verify your email address by clicking the link below:</p>
  <p><a href="{{verificationLink}}">Verify Email Address</a></p>
  <p>If you didn't create this account, you can safely ignore this email.</p>
  <p>Best regards,<br>The Team</p>`,
    },
  ]
  