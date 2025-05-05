"use client"

import { useState } from "react"
import type { ContactMessage } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateMessageStatus } from "@/app/actions"
import { useRouter } from "next/navigation"

interface MessageDetailProps {
  message: ContactMessage
  isOpen: boolean
  onClose: () => void
}

export function MessageDetail({ message, isOpen, onClose }: MessageDetailProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true)
      await updateMessageStatus(message.id, status)
      router.refresh()
      onClose()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            From: {message.name} ({message.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-4">
            <p className="whitespace-pre-wrap">{message.message}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{message.status}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Received: <span className="font-medium">{new Date(message.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <div>
            {message.status !== "resolved" && (
              <Button variant="default" onClick={() => handleStatusChange("resolved")} disabled={isUpdating}>
                Mark as Resolved
              </Button>
            )}
            {message.status !== "pending" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("pending")}
                disabled={isUpdating}
                className="ml-2"
              >
                Mark as Pending
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
