"use client"

// This is a simplified version of the toast component
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ToastProps) => {
      sonnerToast[variant === "destructive" ? "error" : "success"](title, {
        description,
      })
    },
  }
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  sonnerToast[variant === "destructive" ? "error" : "success"](title, {
    description,
  })
}
