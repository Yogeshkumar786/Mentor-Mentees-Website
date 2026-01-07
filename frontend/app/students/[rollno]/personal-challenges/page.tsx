"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api, type StudentProblemsByRollno, type UpdateSpecialIssuesRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, Heart, AlertTriangle, CheckCircle, XCircle, Brain, Users, MessageSquare, Activity,
  Edit, Save, X, DollarSign, UserX, Stethoscope, FileText
} from "lucide-react"

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
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<StudentProblemsByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingSpecialIssues, setIsEditingSpecialIssues] = useState(false)
  const [savingSpecialIssues, setSavingSpecialIssues] = useState(false)
  const [specialIssuesForm, setSpecialIssuesForm] = useState<UpdateSpecialIssuesRequest>({})

  // Check if user can edit special issues (Mentor, HOD, Admin)
  const canEditSpecialIssues = user?.role === 'FACULTY' || user?.role === 'HOD' || user?.role === 'ADMIN'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentProblemsByRollNumber(rollno)
        setData(result)
        // Initialize special issues form
        setSpecialIssuesForm({
          economic_issues_suggestion: result.economic_issues_suggestion || '',
          economic_issues_outcome: result.economic_issues_outcome || '',
          teenage_issues_suggestion: result.teenage_issues_suggestion || '',
          teenage_issues_outcome: result.teenage_issues_outcome || '',
          health_issues_suggestion: result.health_issues_suggestion || '',
          health_issues_outcome: result.health_issues_outcome || '',
          emotional_issues_suggestion: result.emotional_issues_suggestion || '',
          emotional_issues_outcome: result.emotional_issues_outcome || '',
          psychological_issues_suggestion: result.psychological_issues_suggestion || '',
          psychological_issues_outcome: result.psychological_issues_outcome || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch personal challenges")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [rollno])

  const handleSaveSpecialIssues = async () => {
    setSavingSpecialIssues(true)
    try {
      await api.updateStudentSpecialIssues(rollno, specialIssuesForm)
      // Refresh data
      const result = await api.getStudentProblemsByRollNumber(rollno)
      setData(result)
      setIsEditingSpecialIssues(false)
      toast({ title: "Success", description: "Special issues updated successfully" })
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to update special issues", 
        variant: "destructive" 
      })
    } finally {
      setSavingSpecialIssues(false)
    }
  }

  const handleCancelSpecialIssues = () => {
    if (data) {
      setSpecialIssuesForm({
        economic_issues_suggestion: data.economic_issues_suggestion || '',
        economic_issues_outcome: data.economic_issues_outcome || '',
        teenage_issues_suggestion: data.teenage_issues_suggestion || '',
        teenage_issues_outcome: data.teenage_issues_outcome || '',
        health_issues_suggestion: data.health_issues_suggestion || '',
        health_issues_outcome: data.health_issues_outcome || '',
        emotional_issues_suggestion: data.emotional_issues_suggestion || '',
        emotional_issues_outcome: data.emotional_issues_outcome || '',
        psychological_issues_suggestion: data.psychological_issues_suggestion || '',
        psychological_issues_outcome: data.psychological_issues_outcome || '',
      })
    }
    setIsEditingSpecialIssues(false)
  }

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

      {/* Special Issues Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <CardTitle>Special Issues</CardTitle>
            </div>
            {canEditSpecialIssues && (
              <div className="flex gap-2">
                {isEditingSpecialIssues ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelSpecialIssues} disabled={savingSpecialIssues}>
                      <X className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveSpecialIssues} disabled={savingSpecialIssues}>
                      {savingSpecialIssues ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSpecialIssues(true)}>
                    <Edit className="mr-1 h-4 w-4" /> Edit Suggestions
                  </Button>
                )}
              </div>
            )}
          </div>
          <CardDescription>
            Issues reported by the student with mentor suggestions and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Economic Issues */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <h4 className="font-medium">Economic Issues</h4>
            </div>
            <div className="grid gap-3">
              <div>
                <Label className="text-muted-foreground">Student&apos;s Issue</Label>
                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[60px]">
                  {data?.economic_issues || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Suggestion</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter your suggestion..."
                      value={specialIssuesForm.economic_issues_suggestion || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, economic_issues_suggestion: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg min-h-[60px] border border-blue-200/50 dark:border-blue-800/50">
                      {data?.economic_issues_suggestion || <span className="text-muted-foreground italic">No suggestion yet</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter the outcome..."
                      value={specialIssuesForm.economic_issues_outcome || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, economic_issues_outcome: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg min-h-[60px] border border-green-200/50 dark:border-green-800/50">
                      {data?.economic_issues_outcome || <span className="text-muted-foreground italic">Pending</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Teenage Issues */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-500" />
              <h4 className="font-medium">Teenage Issues</h4>
            </div>
            <div className="grid gap-3">
              <div>
                <Label className="text-muted-foreground">Student&apos;s Issue</Label>
                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[60px]">
                  {data?.teenage_issues || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Suggestion</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter your suggestion..."
                      value={specialIssuesForm.teenage_issues_suggestion || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, teenage_issues_suggestion: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg min-h-[60px] border border-blue-200/50 dark:border-blue-800/50">
                      {data?.teenage_issues_suggestion || <span className="text-muted-foreground italic">No suggestion yet</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter the outcome..."
                      value={specialIssuesForm.teenage_issues_outcome || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, teenage_issues_outcome: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg min-h-[60px] border border-green-200/50 dark:border-green-800/50">
                      {data?.teenage_issues_outcome || <span className="text-muted-foreground italic">Pending</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Health Issues */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-red-500" />
              <h4 className="font-medium">Health Issues</h4>
            </div>
            <div className="grid gap-3">
              <div>
                <Label className="text-muted-foreground">Student&apos;s Issue</Label>
                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[60px]">
                  {data?.health_issues || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Suggestion</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter your suggestion..."
                      value={specialIssuesForm.health_issues_suggestion || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, health_issues_suggestion: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg min-h-[60px] border border-blue-200/50 dark:border-blue-800/50">
                      {data?.health_issues_suggestion || <span className="text-muted-foreground italic">No suggestion yet</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter the outcome..."
                      value={specialIssuesForm.health_issues_outcome || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, health_issues_outcome: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg min-h-[60px] border border-green-200/50 dark:border-green-800/50">
                      {data?.health_issues_outcome || <span className="text-muted-foreground italic">Pending</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emotional Issues */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <h4 className="font-medium">Emotional Issues</h4>
            </div>
            <div className="grid gap-3">
              <div>
                <Label className="text-muted-foreground">Student&apos;s Issue</Label>
                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[60px]">
                  {data?.emotional_issues || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Suggestion</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter your suggestion..."
                      value={specialIssuesForm.emotional_issues_suggestion || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, emotional_issues_suggestion: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg min-h-[60px] border border-blue-200/50 dark:border-blue-800/50">
                      {data?.emotional_issues_suggestion || <span className="text-muted-foreground italic">No suggestion yet</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter the outcome..."
                      value={specialIssuesForm.emotional_issues_outcome || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, emotional_issues_outcome: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg min-h-[60px] border border-green-200/50 dark:border-green-800/50">
                      {data?.emotional_issues_outcome || <span className="text-muted-foreground italic">Pending</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Psychological Issues */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <h4 className="font-medium">Psychological Issues</h4>
            </div>
            <div className="grid gap-3">
              <div>
                <Label className="text-muted-foreground">Student&apos;s Issue</Label>
                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[60px]">
                  {data?.psychological_issues || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Suggestion</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter your suggestion..."
                      value={specialIssuesForm.psychological_issues_suggestion || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, psychological_issues_suggestion: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg min-h-[60px] border border-blue-200/50 dark:border-blue-800/50">
                      {data?.psychological_issues_suggestion || <span className="text-muted-foreground italic">No suggestion yet</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  {isEditingSpecialIssues ? (
                    <Textarea
                      placeholder="Enter the outcome..."
                      value={specialIssuesForm.psychological_issues_outcome || ''}
                      onChange={(e) => setSpecialIssuesForm({ ...specialIssuesForm, psychological_issues_outcome: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg min-h-[60px] border border-green-200/50 dark:border-green-800/50">
                      {data?.psychological_issues_outcome || <span className="text-muted-foreground italic">Pending</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Comments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium">Additional Comments</h4>
            </div>
            <div>
              <Label className="text-muted-foreground">Student&apos;s Additional Comments</Label>
              <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg min-h-[80px]">
                {data?.additional_comments || <span className="text-muted-foreground italic">No additional comments</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
