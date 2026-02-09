"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Generate time slots from 9:00 AM to 9:00 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots: { value: string; label: string }[] = []
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip 9:30 PM (21:30) since we want to end at 9:00 PM
      if (hour === 21 && minute > 0) break
      
      const hourStr = hour.toString().padStart(2, '0')
      const minStr = minute.toString().padStart(2, '0')
      const value = `${hourStr}:${minStr}`
      
      // Format label as 12-hour time
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const label = `${hour12}:${minStr} ${ampm}`
      
      slots.push({ value, label })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface TimeSelectProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TimeSelect({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Select time",
  className 
}: TimeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {TIME_SLOTS.map((slot) => (
          <SelectItem key={slot.value} value={slot.value}>
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { TIME_SLOTS }
