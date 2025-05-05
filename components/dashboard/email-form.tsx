"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailTagInput } from "@/components/dashboard/email-tag-input"
import { sendEmail } from "@/app/actions/email"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Send } from "lucide-react"
import type { Profile } from "@/types"
import type { EmailTemplate } from "@/lib/email-templates"

interface EmailFormProps {
  recipients: Profile[]
  templates: EmailTemplate[]
}

export function EmailForm({ recipients, templates }: EmailFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    }
  }, [selectedTemplate, templates])

  // Process the email body to replace placeholders with actual values
  const processEmailBody = (body: string): string => {
    // For demonstration, we'll just return the body as is
    // In a real application, you would replace placeholders like {{name}} with actual values
    return body
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailRecipients.length) {
      toast({
        title: "No recipients specified",
        description: "Please enter at least one email address",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Subject is required",
        description: "Please enter an email subject",
        variant: "destructive",
      })
      return
    }

    if (!body.trim()) {
      toast({
        title: "Email body is required",
        description: "Please enter the email content",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Create form data
      const formData = new FormData()
      emailRecipients.forEach((email) => formData.append("recipients", email))
      formData.append("subject", subject)
      formData.append("body", processEmailBody(body))
      formData.append("saveAsTemplate", saveAsTemplate ? "on" : "off")
      if (saveAsTemplate && templateName) {
        formData.append("templateName", templateName)
      }

      // Send the email
      const result = await sendEmail(formData)

      if (result.success) {
        toast({
          title: "Email sent",
          description: result.message,
        })

        // Reset form
        setEmailRecipients([])
        setSubject("")
        setBody("")
        setSaveAsTemplate(false)
        setTemplateName("")
        setSelectedTemplate("")

        // Refresh the page to update logs
        router.refresh()
      } else {
        toast({
          title: "Failed to send email",
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
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="template">Email Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template or create your own" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Email</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recipients">Recipients</Label>
          <EmailTagInput
            id="recipients"
            tags={emailRecipients}
            onTagsChange={setEmailRecipients}
            placeholder="Type email addresses and press Enter..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            {emailRecipients.length} recipient(s). Type or paste email addresses and press Enter. Separate multiple
            emails with commas.
          </p>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            required
          />
        </div>

        <div>
          <Label htmlFor="body">Email Content</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter your email content here..."
            className="min-h-[200px]"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="saveTemplate"
            checked={saveAsTemplate}
            onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
          />
          <Label htmlFor="saveTemplate" className="cursor-pointer">
            Save as template
          </Label>
        </div>

        {saveAsTemplate && (
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for this template"
              required={saveAsTemplate}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
