"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentProblemsByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, AlertTriangle, CheckCircle, XCircle, Brain, Users, MessageSquare, Activity } from "lucide-react"

// Problem categories
const PROBLEM_CATEGORIES = {
  emotional: {
    title: "Emotional & Psychological",
    icon: Heart,
    color: "text-red-500",
    fields: [
      { key: "stress", label: "Stress" },
      { key: "anger", label: "Anger Issues" },
      { key: "emotional_problem", label: "Emotional Problems" },
      { key: "low_self_esteem", label: "Low Self-Esteem" },
      { key: "mood_swings", label: "Mood Swings" },
      { key: "negative_thoughts", label: "Negative Thoughts" },
      { key: "frustration", label: "Frustration" },
      { key: "worries_about_future", label: "Worries About Future" },
      { key: "low_self_motivation", label: "Low Self-Motivation" },
      { key: "suicidal_attempt_or_thought", label: "Suicidal Thoughts" },
    ]
  },
  academic: {
    title: "Academic & Learning",
    icon: Brain,
    color: "text-blue-500",
    fields: [
      { key: "examination_anxiety", label: "Examination Anxiety" },
      { key: "exam_phobia", label: "Exam Phobia" },
      { key: "poor_concentration", label: "Poor Concentration" },
      { key: "poor_memory_problem", label: "Poor Memory" },
      { key: "time_management_problem", label: "Time Management" },
      { key: "disappointment_with_course", label: "Disappointed with Course" },
      { key: "poor_decisive_power", label: "Poor Decision Making" },
      { key: "procrastination", label: "Procrastination" },
    ]
  },
  social: {
    title: "Social & Interpersonal",
    icon: Users,
    color: "text-green-500",
    fields: [
      { key: "adjustment_problem", label: "Adjustment Problems" },
      { key: "relationship_problems", label: "Relationship Problems" },
      { key: "disturbed_relationship_with_teachers", label: "Issues with Teachers" },
      { key: "disturbed_relationship_with_parents", label: "Issues with Parents" },
      { key: "disturbed_peer_relationship_with_friends", label: "Issues with Friends" },
      { key: "disciplinary_problems_in_college", label: "Disciplinary Issues" },
      { key: "conflicts", label: "Conflicts" },
    ]
  },
  communication: {
    title: "Communication & Expression",
    icon: MessageSquare,
    color: "text-purple-500",
    fields: [
      { key: "stammering", label: "Stammering" },
      { key: "stage_phobia", label: "Stage Phobia" },
      { key: "fear_of_public_speaking", label: "Fear of Public Speaking" },
      { key: "lack_of_expression", label: "Lack of Expression" },
      { key: "poor_command_of_english", label: "Poor English Skills" },
    ]
  },
  lifestyle: {
    title: "Lifestyle & Health",
    icon: Activity,
    color: "text-orange-500",
    fields: [
      { key: "financial_problems", label: "Financial Problems" },
      { key: "migraine_headache", label: "Migraine/Headaches" },
      { key: "tobacco_or_alcohol_use", label: "Tobacco/Alcohol Use" },
    ]
  }
}

export default function StudentPersonalChallengesPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentProblemsByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentProblemsByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch personal challenges")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [rollno])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">No personal challenges data found</div>
  }

  // Helper to get field value from data
  const getFieldValue = (key: string): boolean | null => {
    return (data as unknown as Record<string, boolean | null>)[key] ?? null
  }

  // Count problems
  const countProblems = () => {
    let total = 0
    let active = 0
    Object.values(PROBLEM_CATEGORIES).forEach(category => {
      category.fields.forEach(field => {
        total++
        if (getFieldValue(field.key) === true) {
          active++
        }
      })
    })
    return { total, active }
  }

  const { total, active } = countProblems()

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Object.keys(PROBLEM_CATEGORIES).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Overall Status</CardTitle>
          </CardHeader>
          <CardContent>
            {active === 0 ? (
              <Badge className="bg-green-500">No Concerns</Badge>
            ) : active <= 3 ? (
              <Badge className="bg-yellow-500">Few Concerns</Badge>
            ) : active <= 7 ? (
              <Badge className="bg-orange-500">Moderate Concerns</Badge>
            ) : (
              <Badge className="bg-red-500">Needs Attention</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning for serious issues */}
      {getFieldValue("suicidal_attempt_or_thought") === true && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400">Critical Attention Required</h4>
                <p className="text-sm text-red-600 dark:text-red-300">Student has indicated suicidal thoughts. Immediate counseling recommended.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(PROBLEM_CATEGORIES).map(([key, category]) => {
          const CategoryIcon = category.icon
          const activeInCategory = category.fields.filter(f => getFieldValue(f.key) === true).length

          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                    {category.title}
                  </div>
                  {activeInCategory > 0 && (
                    <Badge variant="destructive">{activeInCategory} active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.fields.map((field) => {
                    const value = getFieldValue(field.key)
                    const isActive = value === true

                    return (
                      <div
                        key={field.key}
                        className={`flex items-center justify-between p-2 rounded ${
                          isActive ? "bg-red-50 dark:bg-red-950" : "bg-muted/30"
                        }`}
                      >
                        <span className={isActive ? "text-red-700 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                          {field.label}
                        </span>
                        {isActive ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : value === false ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Badge variant="outline" className="text-xs">Not Set</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Problems Summary */}
      {active > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Challenges Summary
            </CardTitle>
            <CardDescription>All reported challenges that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.values(PROBLEM_CATEGORIES).flatMap(category =>
                category.fields
                  .filter(field => getFieldValue(field.key) === true)
                  .map(field => (
                    <Badge key={field.key} variant="destructive">{field.label}</Badge>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
