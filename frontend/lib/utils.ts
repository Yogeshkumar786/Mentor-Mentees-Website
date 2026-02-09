import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date format: DD/MM/YYYY
export const DATE_FORMAT = 'dd/MM/yyyy'

/**
 * Format a date string or Date object to DD/MM/YYYY format
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'N/A'
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format a date string or Date object to DD/MM/YYYY HH:MM format
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in DD/MM/YYYY HH:MM format
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'N/A'
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Format a date for display with day, month name, and year (e.g., "09 Feb 2026")
 * @param dateStr - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateLong(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'N/A'
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Parse a DD/MM/YYYY date string to Date object
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Date object or null if invalid
 */
export function parseDateDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // JS months are 0-indexed
  const year = parseInt(parts[2], 10)
  
  const date = new Date(year, month, day)
  if (isNaN(date.getTime())) return null
  
  return date
}

/**
 * Time selection options in 30-minute intervals from 9:00 AM to 9:00 PM
 */
export const TIME_OPTIONS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
]

/**
 * Format a 24-hour time string (HH:MM) to 12-hour format with AM/PM
 * @param timeStr - Time string in HH:MM format
 * @returns Formatted time string (e.g., "9:30 AM")
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return 'N/A'
  try {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  } catch {
    return timeStr
  }
}
