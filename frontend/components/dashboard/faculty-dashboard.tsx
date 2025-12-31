"use client"

import { StatsCard } from "@/components/stats-card"
import { Calendar, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function FacultyDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Prof. {user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="Assigned Students" value={25} icon={Users} description="Mentees under your guidance" />
        <StatsCard title="Scheduled Meetings" value={3} icon={Calendar} description="Upcoming this week" />
      </div>
    </div>
  )
}
