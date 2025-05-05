"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { testEmailConfig, sendTestEmail, saveEmailConfig } from "@/app/actions/email-setup"
import { toast } from "@/components/ui/use-toast"

export default function EmailSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const testEmailRef = useRef<HTMLInputElement>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestStatus("idle")
    setErrorMessage("")

    try {
      const result = await testEmailConfig()

      if (result.success) {
        setTestStatus("success")
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the email server.",
        })
      } else {
        setTestStatus("error")
        setErrorMessage(result.message || "Failed to connect to the email server. Please check your settings.")
        toast({
          title: "Connection Failed",
          description: result.message || "Failed to connect to the email server.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setTestStatus("error")
      setErrorMessage(error.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await saveEmailConfig(formData)

      if (result.success) {
        toast({
          title: "Settings Saved",
          description: result.message,
        })
      } else {
        toast({
          title: "Save Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailRef.current?.value) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      })
      return
    }

    setIsSendingTest(true)

    try {
      const result = await sendTestEmail(testEmailRef.current.value)

      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: result.message,
        })
      } else {
        toast({
          title: "Failed to Send",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Setup</h1>
        <p className="text-muted-foreground">Configure your email sending settings</p>
      </div>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <form ref={formRef} onSubmit={handleSaveConfig}>
              <CardHeader>
                <CardTitle>SMTP Settings</CardTitle>
                <CardDescription>
                  Configure your SMTP server settings to enable email sending functionality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      name="smtp_host"
                      placeholder="smtp.example.com"
                      defaultValue={process.env.NEXT_PUBLIC_SMTP_HOST || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      name="smtp_port"
                      placeholder="587"
                      type="number"
                      defaultValue={process.env.NEXT_PUBLIC_SMTP_PORT || "587"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">SMTP Username</Label>
                    <Input
                      id="smtp_user"
                      name="smtp_user"
                      placeholder="your-email@example.com"
                      defaultValue={process.env.NEXT_PUBLIC_SMTP_USER || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input id="smtp_password" name="smtp_password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from_email">Default From Email</Label>
                    <Input
                      id="from_email"
                      name="from_email"
                      placeholder="noreply@example.com"
                      defaultValue={process.env.NEXT_PUBLIC_DEFAULT_FROM_EMAIL || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from_name">Default From Name</Label>
                    <Input id="from_name" name="from_name" placeholder="Your Company Name" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="smtp_secure"
                    name="smtp_secure"
                    className="rounded border-gray-300"
                    defaultChecked={process.env.NEXT_PUBLIC_SMTP_SECURE === "true"}
                  />
                  <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => formRef.current?.reset()}>
                  Reset
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          {testStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Connection Successful</AlertTitle>
              <AlertDescription className="text-green-600">
                Successfully connected to the SMTP server. Your email settings are working correctly.
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>Send a test email to verify your configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_email">Recipient Email</Label>
                <Input id="test_email" ref={testEmailRef} placeholder="your-email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test_subject">Subject</Label>
                <Input
                  id="test_subject"
                  placeholder="Test Email"
                  defaultValue="Test Email from User Dashboard"
                  disabled
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSendTestEmail} disabled={isSendingTest}>
                {isSendingTest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Development Mode</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                In development mode, emails are sent using Ethereal, a fake SMTP service that allows you to preview
                emails without actually sending them. Check the server console for login details to view sent emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
