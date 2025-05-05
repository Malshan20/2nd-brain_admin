"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  id?: string
  allowCustomValues?: boolean
  customValueValidator?: (value: string) => boolean
  customValuePrefix?: string
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  id,
  allowCustomValues = false,
  customValueValidator = () => true,
  customValuePrefix = "custom-",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!allowCustomValues) return

    const value = inputValue.trim()

    if ((e.key === "Enter" || e.key === ",") && value && customValueValidator(value)) {
      e.preventDefault()

      // Check if this value already exists in options or selected values
      const exists =
        options.some((option) => option.label.toLowerCase() === value.toLowerCase()) ||
        selectedValues.some((val) => {
          const option = options.find((opt) => opt.value === val)
          return option ? option.label.toLowerCase() === value.toLowerCase() : false
        })

      if (!exists) {
        const customValue = `${customValuePrefix}${value}`
        if (!selectedValues.includes(customValue)) {
          onChange([...selectedValues, customValue])
          setInputValue("")
        }
      }
    }
  }

  const selectedLabels = selectedValues.map((value) => {
    // Check if it's a custom value
    if (value.startsWith(customValuePrefix)) {
      return value.substring(customValuePrefix.length)
    }

    // Otherwise find in options
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  })

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={allowCustomValues ? "Search or enter email address..." : "Search options..."}
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {allowCustomValues ? (
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span>Add "{inputValue}"</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const value = inputValue.trim()
                        if (value && customValueValidator(value)) {
                          const customValue = `${customValuePrefix}${value}`
                          if (!selectedValues.includes(customValue)) {
                            handleSelect(customValue)
                            setInputValue("")
                          }
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ) : (
                  "No options found."
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            // Check if it's a custom value
            if (value.startsWith(customValuePrefix)) {
              const label = value.substring(customValuePrefix.length)
              return (
                <Badge key={value} variant="secondary" className="flex items-center gap-1">
                  {label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemove(value)} />
                </Badge>
              )
            }

            // Otherwise find in options
            const option = options.find((opt) => opt.value === value)
            return (
              <Badge key={value} variant="secondary" className="flex items-center gap-1">
                {option?.label || value}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemove(value)} />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
