"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, ExternalLink, Edit2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubscriptionEditForm } from "./subscription-edit-form"
import { Toaster } from "sonner"
import type { Profile } from "@/types"

interface ProfilesTableProps {
  data: Profile[]
  count: number
  page: number
  pageSize: number
  searchQuery: string
}

export function ProfilesTable({ data, count, page, pageSize, searchQuery }: ProfilesTableProps) {
  const router = useRouter()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const totalPages = Math.ceil(count / pageSize)
  const [editingSubscription, setEditingSubscription] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("page", "1") // Reset to first page on new search
    if (localSearchQuery) params.set("search", localSearchQuery)
    router.push(`/dashboard/users?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("page", newPage.toString())
    if (localSearchQuery) params.set("search", localSearchQuery)
    router.push(`/dashboard/users?${params.toString()}`)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getSubscriptionBadge = (status: string | null) => {
    if (!status) return null

    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "trialing":
        return <Badge className="bg-blue-500">Trial</Badge>
      case "canceled":
        return <Badge className="bg-red-500">Canceled</Badge>
      case "past_due":
        return <Badge className="bg-yellow-500">Past Due</Badge>
      case "paused":
        return <Badge className="bg-orange-500">Paused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by name, username, or school..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              data.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || profile.username || ""} />
                        <AvatarFallback>
                          {(profile.full_name || profile.username || "User")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.full_name || "No Name"}</div>
                        {profile.bio && <div className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.username || "N/A"}</TableCell>
                  <TableCell>{profile.school || "N/A"}</TableCell>
                  <TableCell>{profile.major || "N/A"}</TableCell>
                  <TableCell>
                    {getSubscriptionBadge(profile.subscription_status)}
                    {profile.subscription_tier && (
                      <div className="text-xs text-muted-foreground mt-1">{profile.subscription_tier}</div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(profile.created_at)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDialog === profile.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenDialog(profile.id)
                        } else {
                          setOpenDialog(null)
                          setEditingSubscription(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" /> Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Profile Details</DialogTitle>
                          <DialogDescription>
                            Complete information for {profile.full_name || profile.username || "this user"}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[calc(90vh-120px)]">
                          <div className="p-4 space-y-6">
                            {/* User header section */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage
                                    src={profile.avatar_url || ""}
                                    alt={profile.full_name || profile.username || ""}
                                  />
                                  <AvatarFallback>
                                    {(profile.full_name || profile.username || "User")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{profile.full_name || "No Name"}</h3>
                                  <p className="text-muted-foreground">@{profile.username || "username"}</p>
                                </div>
                              </div>
                              {profile.bio && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                                  <p className="text-sm">{profile.bio}</p>
                                </div>
                              )}
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">ID</span>
                                  <span className="text-sm truncate max-w-[180px] sm:max-w-none">{profile.id}</span>
                                </div>

                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">Age</span>
                                  <span className="text-sm">{profile.age || "N/A"}</span>
                                </div>

                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">School</span>
                                  <span className="text-sm">{profile.school || "N/A"}</span>
                                </div>

                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">Major</span>
                                  <span className="text-sm">{profile.major || "N/A"}</span>
                                </div>

                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">Graduation Year</span>
                                  <span className="text-sm">{profile.grad_year || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Subscription Details */}
                            <div className="space-y-3 border-t pt-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-muted-foreground">Subscription Details</h4>
                                {editingSubscription === profile.id ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingSubscription(null)}
                                    className="h-8 px-2"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingSubscription(profile.id)}
                                    className="h-8 px-2"
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                )}
                              </div>

                              {editingSubscription === profile.id ? (
                                <SubscriptionEditForm
                                  profile={profile}
                                  onSuccess={() => setEditingSubscription(null)}
                                  onCancel={() => setEditingSubscription(null)}
                                />
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Status</span>
                                    <span className="text-sm">{getSubscriptionBadge(profile.subscription_status)}</span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Tier</span>
                                    <span className="text-sm">{profile.subscription_tier || "N/A"}</span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Start Date</span>
                                    <span className="text-sm">{formatDate(profile.subscription_start_date)}</span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">End Date</span>
                                    <span className="text-sm">{formatDate(profile.subscription_end_date)}</span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Subscription ID</span>
                                    <span className="text-sm truncate max-w-[180px] sm:max-w-none">
                                      {profile.subscription_id || "N/A"}
                                    </span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Paddle Customer ID</span>
                                    <span className="text-sm truncate max-w-[180px] sm:max-w-none">
                                      {profile.paddle_customer_id || "N/A"}
                                    </span>
                                  </div>

                                  <div className="flex justify-between sm:block">
                                    <span className="text-sm font-medium">Paddle Subscription ID</span>
                                    <span className="text-sm truncate max-w-[180px] sm:max-w-none">
                                      {profile.paddle_subscription_id || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* System Information */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="text-sm font-medium text-muted-foreground">System Information</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">Created At</span>
                                  <span className="text-sm">{formatDate(profile.created_at)}</span>
                                </div>

                                <div className="flex justify-between sm:block">
                                  <span className="text-sm font-medium">Updated At</span>
                                  <span className="text-sm">{formatDate(profile.updated_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
