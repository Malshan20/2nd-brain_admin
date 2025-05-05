export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  user_id: string | null
  created_at: string
  updated_at: string | null
}

export type DashboardStats = {
  totalMessages: number
  newMessages: number
  resolvedMessages: number
  pendingMessages: number
}

export type Profile = {
  id: string
  created_at: string
  updated_at: string | null
  age: number | null
  subscription_start_date: string | null
  subscription_end_date: string | null
  avatar_url: string | null
  subscription_status: string | null
  paddle_customer_id: string | null
  bio: string | null
  school: string | null
  major: string | null
  grad_year: string | null
  paddle_subscription_id: string | null
  subscription_tier: string | null
  username: string | null
  full_name: string | null
  subscription_id: string | null
}

export type Document = {
  id: string
  title: string
  summary: string | null
  content: string | null
  file_path: string | null
  type: string | null
  updated_at: string | null
  public_url: string | null
  created_at: string
  subject_id: string | null
  user_id: string | null
}
