"use client"

import { StatsCard } from "@/components/stats-card"
import { BookOpen, Target, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function StudentDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your academic progress, {user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Current GPA" value={3.8} icon={BookOpen} description="Latest semester" />
        <StatsCard title="Goals Met" value="4/6" icon={Target} description="Career milestones" />
        <StatsCard title="Next Meeting" value="Oct 12" icon={Calendar} description="With your mentor" />
      </div>
    </div>
  )
}
