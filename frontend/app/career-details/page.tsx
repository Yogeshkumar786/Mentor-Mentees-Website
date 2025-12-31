"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentCareerDetails } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Heart, 
  Star, 
  TrendingUp,
  Briefcase,
  Code,
  GraduationCap,
  Rocket,
  Building2,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react"

export default function CareerDetailsPage() {
  const [careerData, setCareerData] = useState<StudentCareerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentCareerDetails()
        setCareerData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch career details')
      } finally {
        setLoading(false)
      }
    }

    fetchCareerData()
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

  const renderBadgeList = (items: string[], emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    )
  }

  const careerSections = [
    { 
      icon: Briefcase, 
      title: 'Core Engineering', 
      items: careerData?.careerInterests.core || [],
      color: 'text-blue-500'
    },
    { 
      icon: Code, 
      title: 'IT / Software', 
      items: careerData?.careerInterests.it || [],
      color: 'text-green-500'
    },
    { 
      icon: GraduationCap, 
      title: 'Higher Education', 
      items: careerData?.careerInterests.higherEducation || [],
      color: 'text-purple-500'
    },
    { 
      icon: Rocket, 
      title: 'Startup', 
      items: careerData?.careerInterests.startup || [],
      color: 'text-orange-500'
    },
    { 
      icon: Building2, 
      title: 'Family Business', 
      items: careerData?.careerInterests.familyBusiness || [],
      color: 'text-amber-500'
    },
    { 
      icon: Sparkles, 
      title: 'Other Interests', 
      items: careerData?.careerInterests.otherInterests || [],
      color: 'text-pink-500'
    },
  ]

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Details</h1>
          <p className="text-muted-foreground">Your hobbies, strengths, and career aspirations</p>
        </div>

        {careerData?.message && (
          <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{careerData.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Hobbies, Strengths, Areas to Improve */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Hobbies
              </CardTitle>
              <CardDescription>Things you love doing</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBadgeList(careerData?.hobbies || [], 'No hobbies added yet')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Strengths
              </CardTitle>
              <CardDescription>Your key strengths</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBadgeList(careerData?.strengths || [], 'No strengths added yet')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Areas to Improve
              </CardTitle>
              <CardDescription>Skills to develop</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBadgeList(careerData?.areasToImprove || [], 'No areas added yet')}
            </CardContent>
          </Card>
        </div>

        {/* Career Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Career Interests
            </CardTitle>
            <CardDescription>Your career aspirations and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {careerSections.map((section) => (
                <div key={section.title} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                    <h4 className="font-semibold">{section.title}</h4>
                  </div>
                  {renderBadgeList(section.items, 'Not specified')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
