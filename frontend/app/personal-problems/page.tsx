"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentPersonalProblems, UpdatePersonalProblemsRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
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
  Calendar,
  Pencil,
  Save,
  X,
  Heart,
  BookOpen,
  Users,
  MessageCircle,
  Target,
  Coffee,
  Flame,
  Headphones,
  Shield,
  Languages
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
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<UpdatePersonalProblemsRequest>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentPersonalProblems()
        setProblemsData(data)
        // Initialize edit data with all 32 fields
        setEditData({
          stress: data.stress,
          anger: data.anger,
          emotional_problem: data.emotional_problem,
          low_self_esteem: data.low_self_esteem,
          examination_anxiety: data.examination_anxiety,
          negative_thoughts: data.negative_thoughts,
          exam_phobia: data.exam_phobia,
          stammering: data.stammering,
          financial_problems: data.financial_problems,
          disturbed_relationship_with_teachers: data.disturbed_relationship_with_teachers,
          disturbed_relationship_with_parents: data.disturbed_relationship_with_parents,
          mood_swings: data.mood_swings,
          stage_phobia: data.stage_phobia,
          poor_concentration: data.poor_concentration,
          poor_memory_problem: data.poor_memory_problem,
          adjustment_problem: data.adjustment_problem,
          frustration: data.frustration,
          migraine_headache: data.migraine_headache,
          relationship_problems: data.relationship_problems,
          fear_of_public_speaking: data.fear_of_public_speaking,
          disciplinary_problems_in_college: data.disciplinary_problems_in_college,
          disturbed_peer_relationship_with_friends: data.disturbed_peer_relationship_with_friends,
          worries_about_future: data.worries_about_future,
          disappointment_with_course: data.disappointment_with_course,
          time_management_problem: data.time_management_problem,
          lack_of_expression: data.lack_of_expression,
          poor_decisive_power: data.poor_decisive_power,
          conflicts: data.conflicts,
          low_self_motivation: data.low_self_motivation,
          procrastination: data.procrastination,
          suicidal_attempt_or_thought: data.suicidal_attempt_or_thought,
          tobacco_or_alcohol_use: data.tobacco_or_alcohol_use,
          poor_command_of_english: data.poor_command_of_english,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedData = await api.updatePersonalProblems(editData)
      setProblemsData(updatedData)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Personal challenges updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update',
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (problemsData) {
      setEditData({
        stress: problemsData.stress,
        anger: problemsData.anger,
        emotional_problem: problemsData.emotional_problem,
        low_self_esteem: problemsData.low_self_esteem,
        examination_anxiety: problemsData.examination_anxiety,
        negative_thoughts: problemsData.negative_thoughts,
        exam_phobia: problemsData.exam_phobia,
        stammering: problemsData.stammering,
        financial_problems: problemsData.financial_problems,
        disturbed_relationship_with_teachers: problemsData.disturbed_relationship_with_teachers,
        disturbed_relationship_with_parents: problemsData.disturbed_relationship_with_parents,
        mood_swings: problemsData.mood_swings,
        stage_phobia: problemsData.stage_phobia,
        poor_concentration: problemsData.poor_concentration,
        poor_memory_problem: problemsData.poor_memory_problem,
        adjustment_problem: problemsData.adjustment_problem,
        frustration: problemsData.frustration,
        migraine_headache: problemsData.migraine_headache,
        relationship_problems: problemsData.relationship_problems,
        fear_of_public_speaking: problemsData.fear_of_public_speaking,
        disciplinary_problems_in_college: problemsData.disciplinary_problems_in_college,
        disturbed_peer_relationship_with_friends: problemsData.disturbed_peer_relationship_with_friends,
        worries_about_future: problemsData.worries_about_future,
        disappointment_with_course: problemsData.disappointment_with_course,
        time_management_problem: problemsData.time_management_problem,
        lack_of_expression: problemsData.lack_of_expression,
        poor_decisive_power: problemsData.poor_decisive_power,
        conflicts: problemsData.conflicts,
        low_self_motivation: problemsData.low_self_motivation,
        procrastination: problemsData.procrastination,
        suicidal_attempt_or_thought: problemsData.suicidal_attempt_or_thought,
        tobacco_or_alcohol_use: problemsData.tobacco_or_alcohol_use,
        poor_command_of_english: problemsData.poor_command_of_english,
      })
    }
    setIsEditing(false)
  }

  const handleToggle = (key: keyof UpdatePersonalProblemsRequest, value: boolean) => {
    setEditData(prev => ({ ...prev, [key]: value }))
  }

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

  // Organized problem items in 3 columns/categories
  const problemCategories = {
    emotional: {
      title: "Emotional & Psychological",
      items: [
        { key: 'stress', label: 'Stress', description: 'Feeling overwhelmed or under pressure', icon: Brain },
        { key: 'anger', label: 'Anger Issues', description: 'Difficulty managing anger', icon: Flame },
        { key: 'emotional_problem', label: 'Emotional Problem', description: 'General emotional difficulties', icon: Heart },
        { key: 'low_self_esteem', label: 'Low Self Esteem', description: 'Lack of confidence in oneself', icon: Target },
        { key: 'negative_thoughts', label: 'Negative Thoughts', description: 'Persistent negative thinking', icon: Brain },
        { key: 'mood_swings', label: 'Mood Swings', description: 'Rapid mood changes', icon: Frown },
        { key: 'frustration', label: 'Frustration', description: 'Feeling frustrated often', icon: AlertTriangle },
        { key: 'low_self_motivation', label: 'Low Self Motivation', description: 'Lack of drive or motivation', icon: Target },
        { key: 'suicidal_attempt_or_thought', label: 'Suicidal Thoughts', description: 'Thoughts of self-harm (please seek help)', icon: AlertCircle },
      ] as ProblemItem[]
    },
    academic: {
      title: "Academic & Learning",
      items: [
        { key: 'examination_anxiety', label: 'Examination Anxiety', description: 'Anxiety during exams', icon: Calendar },
        { key: 'exam_phobia', label: 'Exam Phobia', description: 'Fear of examinations', icon: Calendar },
        { key: 'poor_concentration', label: 'Poor Concentration', description: 'Difficulty focusing', icon: Brain },
        { key: 'poor_memory_problem', label: 'Poor Memory', description: 'Difficulty remembering', icon: Brain },
        { key: 'time_management_problem', label: 'Time Management', description: 'Managing time effectively', icon: Clock },
        { key: 'procrastination', label: 'Procrastination', description: 'Tendency to delay tasks', icon: Clock },
        { key: 'disappointment_with_course', label: 'Course Disappointment', description: 'Unhappy with chosen course', icon: BookOpen },
        { key: 'poor_command_of_english', label: 'Poor English Command', description: 'Language barrier issues', icon: Languages },
      ] as ProblemItem[]
    },
    social: {
      title: "Social & Interpersonal",
      items: [
        { key: 'disturbed_relationship_with_teachers', label: 'Issues with Teachers', description: 'Problems with faculty', icon: Users },
        { key: 'disturbed_relationship_with_parents', label: 'Issues with Parents', description: 'Family relationship problems', icon: Users },
        { key: 'disturbed_peer_relationship_with_friends', label: 'Issues with Friends', description: 'Peer relationship problems', icon: Users },
        { key: 'relationship_problems', label: 'Relationship Problems', description: 'General relationship issues', icon: Heart },
        { key: 'adjustment_problem', label: 'Adjustment Problem', description: 'Difficulty adapting', icon: Shield },
        { key: 'conflicts', label: 'Conflicts', description: 'Frequent conflicts with others', icon: AlertTriangle },
        { key: 'disciplinary_problems_in_college', label: 'Disciplinary Issues', description: 'College discipline problems', icon: Shield },
      ] as ProblemItem[]
    },
    communication: {
      title: "Communication & Expression",
      items: [
        { key: 'fear_of_public_speaking', label: 'Public Speaking Fear', description: 'Fear of speaking publicly', icon: Mic },
        { key: 'stage_phobia', label: 'Stage Phobia', description: 'Fear of performing on stage', icon: Mic },
        { key: 'stammering', label: 'Stammering', description: 'Speech difficulties', icon: MessageCircle },
        { key: 'lack_of_expression', label: 'Lack of Expression', description: 'Difficulty expressing feelings', icon: MessageCircle },
        { key: 'poor_decisive_power', label: 'Poor Decision Making', description: 'Difficulty making decisions', icon: Target },
      ] as ProblemItem[]
    },
    lifestyle: {
      title: "Lifestyle & Health",
      items: [
        { key: 'migraine_headache', label: 'Migraine/Headache', description: 'Frequent headaches', icon: Headphones },
        { key: 'financial_problems', label: 'Financial Problems', description: 'Money-related stress', icon: AlertTriangle },
        { key: 'worries_about_future', label: 'Future Worries', description: 'Anxiety about career/future', icon: TrendingUp },
        { key: 'tobacco_or_alcohol_use', label: 'Substance Use', description: 'Tobacco or alcohol usage', icon: Coffee },
      ] as ProblemItem[]
    }
  }

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

  const displayData = isEditing ? editData : problemsData
  const allItems = Object.values(problemCategories).flatMap(cat => cat.items)
  const issuesCount = allItems.filter(
    item => displayData?.[item.key as keyof typeof displayData] === true
  ).length

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Personal Challenges</h1>
            <p className="text-muted-foreground">Self-assessment of personal challenges (confidential)</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={issuesCount > 10 ? 'destructive' : issuesCount > 5 ? 'secondary' : 'default'}
              className="text-lg px-4 py-2"
            >
              {issuesCount} Issues Identified
            </Badge>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

        {problemsData?.message && !isEditing && (
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
                <h4 className="font-semibold text-purple-700 dark:text-purple-400">Your Well-being Matters</h4>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  This information helps your mentor understand your challenges better and provide 
                  personalized guidance. All data is confidential and shared only with your assigned mentor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems by Category */}
        {Object.entries(problemCategories).map(([categoryKey, category]) => (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const value = displayData?.[item.key as keyof typeof displayData] as boolean | null
                  
                  return (
                    <div 
                      key={item.key} 
                      className={`p-4 rounded-lg border ${value === true ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${value === true ? 'bg-orange-100 dark:bg-orange-950' : 'bg-muted'}`}>
                            <Icon className={`h-4 w-4 ${value === true ? 'text-orange-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm">{item.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        </div>
                        {isEditing ? (
                          <Switch
                            checked={editData[item.key as keyof UpdatePersonalProblemsRequest] === true}
                            onCheckedChange={(checked) => handleToggle(item.key as keyof UpdatePersonalProblemsRequest, checked)}
                          />
                        ) : (
                          getStatusBadge(value)
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        {issuesCount > 0 && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Based on your self-assessment, we recommend discussing these challenges with your mentor 
                during your next meeting. They can provide guidance and resources to help you overcome these obstacles.
                {issuesCount > 10 && (
                  <span className="block mt-2 text-orange-600 dark:text-orange-400">
                    You have identified multiple challenges. Consider prioritizing the most impactful ones first.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
