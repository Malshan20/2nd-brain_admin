import { Suspense } from "react"
import { EmailForm } from "@/components/dashboard/email-form"
import { EmailLogs } from "@/components/dashboard/email-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmailRecipients, getEmailLogs, getEmailTemplates } from "@/app/actions/email"

interface EmailPageProps {
  searchParams: {
    tab?: string
    page?: string
  }
}

export default async function EmailPage({ searchParams }: EmailPageProps) {
  const tab = searchParams.tab || "compose"
  const page = Number(searchParams.page) || 1

  // Fetch recipients for the email form
  const recipients = await getEmailRecipients()

  // Fetch email templates
  const templates = await getEmailTemplates()

  // Fetch email logs for the logs tab
  const { data: logs, count: logsCount } = await getEmailLogs(page, 10)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email</h1>
        <p className="text-muted-foreground">Send emails to users and view email history</p>
      </div>

      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Email</CardTitle>
              <CardDescription>
                Send an email to one or more users. You can use templates or create your own.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading email form...</div>}>
                <EmailForm recipients={recipients} templates={templates} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>View a history of all emails sent through the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading email logs...</div>}>
                <EmailLogs logs={logs} count={logsCount} page={page} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
