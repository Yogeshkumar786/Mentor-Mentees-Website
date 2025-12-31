"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentPersonalProblems } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HeartPulse, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Loader2,
  AlertCircle,
  Brain,
  Clock,
  Mic,
  TrendingUp,
  Frown,
  AlertTriangle,
  Calendar
} from "lucide-react"

interface ProblemItem {
  key: keyof Omit<StudentPersonalProblems, 'id' | 'studentId' | 'message'>
  label: string
  description: string
  icon: React.ElementType
}

export default function PersonalProblemsPage() {
  const [problemsData, setProblemsData] = useState<StudentPersonalProblems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentPersonalProblems()
        setProblemsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const problemItems: ProblemItem[] = [
    { 
      key: 'stress', 
      label: 'Stress', 
      description: 'Feeling overwhelmed or under pressure',
      icon: Brain
    },
    { 
      key: 'anger', 
      label: 'Anger Issues', 
      description: 'Difficulty managing anger or frustration',
      icon: Frown
    },
    { 
      key: 'examinationAnxiety', 
      label: 'Examination Anxiety', 
      description: 'Feeling anxious before or during exams',
      icon: Calendar
    },
    { 
      key: 'timeManagementProblem', 
      label: 'Time Management', 
      description: 'Difficulty managing time effectively',
      icon: Clock
    },
    { 
      key: 'procrastination', 
      label: 'Procrastination', 
      description: 'Tendency to delay important tasks',
      icon: AlertTriangle
    },
    { 
      key: 'worriesAboutFuture', 
      label: 'Future Worries', 
      description: 'Anxiety about career or future prospects',
      icon: TrendingUp
    },
    { 
      key: 'fearOfPublicSpeaking', 
      label: 'Public Speaking Fear', 
      description: 'Anxiety when speaking in front of others',
      icon: Mic
    },
  ]

  const getStatusBadge = (value: boolean | null) => {
    if (value === null) {
      return (
        <Badge variant="outline" className="gap-1">
          <HelpCircle className="h-3 w-3" />
          Not Specified
        </Badge>
      )
    }
    if (value) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Yes
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        No
      </Badge>
    )
  }

  const issuesCount = problemItems.filter(
    item => problemsData?.[item.key] === true
  ).length

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Personal Challenges</h1>
            <p className="text-muted-foreground">
              Self-assessment of personal challenges (confidential)
            </p>
          </div>
          <Badge 
            variant={issuesCount > 3 ? 'destructive' : issuesCount > 0 ? 'secondary' : 'default'}
            className="text-lg px-4 py-2"
          >
            {issuesCount} Issues Identified
          </Badge>
        </div>

        {problemsData?.message && (
          <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700 dark:text-blue-400">{problemsData.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <HeartPulse className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                  Your Well-being Matters
                </h4>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  This information helps your mentor understand your challenges better and provide 
                  personalized guidance. All data is confidential and shared only with your assigned mentor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {problemItems.map((item) => {
            const Icon = item.icon
            const value = problemsData?.[item.key] as boolean | null
            
            return (
              <Card key={item.key} className={value === true ? 'border-orange-500/50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${value === true ? 'bg-orange-100 dark:bg-orange-950' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${value === true ? 'text-orange-500' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(value)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        {issuesCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Based on your self-assessment, we recommend discussing these challenges with your mentor 
                during your next meeting. They can provide guidance and resources to help you overcome these obstacles.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
