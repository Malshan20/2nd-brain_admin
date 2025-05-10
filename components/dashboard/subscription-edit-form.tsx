"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { updateUserSubscription, type SubscriptionUpdateData } from "@/app/actions/subscription"
import { toast } from "@/components/ui/use-toast"
import type { Profile } from "@/types"

interface SubscriptionEditFormProps {
  profile: Profile
  onSuccess: () => void
  onCancel: () => void
}

export function SubscriptionEditForm({ profile, onSuccess, onCancel }: SubscriptionEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<SubscriptionUpdateData>({
    subscription_status: profile.subscription_status || "",
    subscription_tier: profile.subscription_tier || "",
    subscription_start_date: profile.subscription_start_date || null,
    subscription_end_date: profile.subscription_end_date || null,
    paddle_customer_id: profile.paddle_customer_id || "",
    paddle_subscription_id: profile.paddle_subscription_id || "",
  })

  const handleChange = (field: keyof SubscriptionUpdateData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateUserSubscription(profile.id, formData)

      if (result.success) {
        toast({
          title: "Subscription updated",
          description: "The user's subscription details have been updated successfully.",
        })
        router.refresh()
        onSuccess()
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update subscription details.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subscription_status">Subscription Status</Label>
          <Select
            value={formData.subscription_status || ""}
            onValueChange={(value) => handleChange("subscription_status", value)}
          >
            <SelectTrigger id="subscription_status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trial</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription_tier">Subscription Tier</Label>
          <Select
            value={formData.subscription_tier || ""}
            onValueChange={(value) => handleChange("subscription_tier", value)}
          >
            <SelectTrigger id="subscription_tier">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro brain">Pro Brain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription_start_date">Start Date</Label>
          <Input
            id="subscription_start_date"
            type="date"
            value={
              formData.subscription_start_date
                ? new Date(formData.subscription_start_date).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              handleChange("subscription_start_date", e.target.value ? new Date(e.target.value).toISOString() : null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription_end_date">End Date</Label>
          <Input
            id="subscription_end_date"
            type="date"
            value={
              formData.subscription_end_date ? new Date(formData.subscription_end_date).toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              handleChange("subscription_end_date", e.target.value ? new Date(e.target.value).toISOString() : null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paddle_customer_id">Paddle Customer ID</Label>
          <Input
            id="paddle_customer_id"
            value={formData.paddle_customer_id || ""}
            onChange={(e) => handleChange("paddle_customer_id", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paddle_subscription_id">Paddle Subscription ID</Label>
          <Input
            id="paddle_subscription_id"
            value={formData.paddle_subscription_id || ""}
            onChange={(e) => handleChange("paddle_subscription_id", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
