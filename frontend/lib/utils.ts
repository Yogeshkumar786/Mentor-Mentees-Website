import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export interface TimeOption {
  value: string
  label: string
}

/**
 * Time selection options in 30-minute intervals from 9:00 AM to 9:00 PM
 */
export const TIME_OPTIONS: TimeOption[] = [
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
  { value: '21:00', label: '9:00 PM' }
]

export interface MeetingValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates that a meeting date/time is in the future
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:mm format
 * @returns Validation result with error message if invalid
 */
export function validateMeetingDateTime(date: string, time: string): MeetingValidationResult {
  if (!date || !time) {
    return { valid: false, error: 'Date and time are required' }
  }

  const meetingDateTime = new Date(`${date}T${time}`)
  const now = new Date()

  if (isNaN(meetingDateTime.getTime())) {
    return { valid: false, error: 'Invalid date or time format' }
  }

  if (meetingDateTime <= now) {
    return { valid: false, error: 'Meeting must be scheduled in the future' }
  }

  return { valid: true }
}

/**
 * Validates that start time is before end time (for meetings with duration)
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param startTime - Start time string in HH:mm format
 * @param endDate - End date string in YYYY-MM-DD format (optional, defaults to startDate)
 * @param endTime - End time string in HH:mm format
 * @returns Validation result with error message if invalid
 */
export function validateMeetingTimeRange(
  startDate: string,
  startTime: string,
  endDate: string | undefined,
  endTime: string
): MeetingValidationResult {
  if (!startDate || !startTime || !endTime) {
    return { valid: false, error: 'Start date, start time, and end time are required' }
  }

  const effectiveEndDate = endDate || startDate
  const startDateTime = new Date(`${startDate}T${startTime}`)
  const endDateTime = new Date(`${effectiveEndDate}T${endTime}`)

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { valid: false, error: 'Invalid date or time format' }
  }

  if (startDateTime >= endDateTime) {
    return { valid: false, error: 'End time must be after start time' }
  }

  return { valid: true }
}

export interface MeetingItemValidation {
  date: string
  time: string
  index?: number
}

/**
 * Validates multiple meeting items for scheduling
 * @param meetings - Array of meeting items with date and time
 * @returns Validation result with detailed error message if any meeting is invalid
 */
export function validateMeetingSchedule(meetings: MeetingItemValidation[]): MeetingValidationResult {
  const now = new Date()
  
  for (let i = 0; i < meetings.length; i++) {
    const meeting = meetings[i]
    if (!meeting.date || !meeting.time) continue // Skip incomplete entries
    
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`)
    
    if (isNaN(meetingDateTime.getTime())) {
      return { 
        valid: false, 
        error: `Meeting ${i + 1}: Invalid date or time format` 
      }
    }
    
    if (meetingDateTime <= now) {
      return { 
        valid: false, 
        error: `Meeting ${i + 1}: Must be scheduled in the future (${meeting.date} ${meeting.time})` 
      }
    }
  }
  
  return { valid: true }
}
