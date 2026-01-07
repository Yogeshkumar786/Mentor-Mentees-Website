"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentCareerByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Target, Star, TrendingUp, Lightbulb, Briefcase, GraduationCap, Building, Rocket, Users } from "lucide-react"

export default function StudentCareerDetailsPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentCareerByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentCareerByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch career details")
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
    return <div className="text-center text-muted-foreground py-8">No career details found</div>
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1st Priority</Badge>
    if (rank === 2) return <Badge className="bg-gray-400">2nd Priority</Badge>
    if (rank === 3) return <Badge className="bg-amber-600">3rd Priority</Badge>
    return <Badge variant="outline">#{rank}</Badge>
  }

  const careerPaths = [
    { key: 'govt_sector_rank', label: 'Government Sector', icon: Building, rank: data.careerRankings?.govt_sector_rank },
    { key: 'core_rank', label: 'Core Engineering', icon: Briefcase, rank: data.careerRankings?.core_rank },
    { key: 'it_rank', label: 'IT/Software', icon: Brain, rank: data.careerRankings?.it_rank },
    { key: 'higher_education_rank', label: 'Higher Education', icon: GraduationCap, rank: data.careerRankings?.higher_education_rank },
    { key: 'startup_rank', label: 'Startup/Entrepreneurship', icon: Rocket, rank: data.careerRankings?.startup_rank },
    { key: 'family_business_rank', label: 'Family Business', icon: Users, rank: data.careerRankings?.family_business_rank },
  ].sort((a, b) => (a.rank || 99) - (b.rank || 99))

  return (
    <div className="space-y-6">
      {/* Career Path Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> Career Path Priority Rankings
          </CardTitle>
          <CardDescription>Student&apos;s career preferences ranked by priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.map((path) => (
              <div key={path.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <path.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{path.label}</span>
                </div>
                {path.rank ? getRankBadge(path.rank) : <Badge variant="outline">Not Ranked</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hobbies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Hobbies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.hobbies && data.hobbies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.hobbies.map((hobby, idx) => (
                  <Badge key={idx} variant="secondary">{hobby}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hobbies listed</p>
            )}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.strengths && data.strengths.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.strengths.map((strength, idx) => (
                  <Badge key={idx} className="bg-green-500">{strength}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No strengths listed</p>
            )}
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.areasToImprove && data.areasToImprove.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.areasToImprove.map((area, idx) => (
                  <Badge key={idx} variant="outline">{area}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No areas listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Career Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" /> Career Interests
          </CardTitle>
          <CardDescription>Detailed interest areas by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Core */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Core Engineering
              </h4>
              {data.careerInterests?.core && data.careerInterests.core.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.core.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>

            {/* IT */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" /> IT/Software
              </h4>
              {data.careerInterests?.it && data.careerInterests.it.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.it.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>

            {/* Higher Education */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Higher Education
              </h4>
              {data.careerInterests?.higherEducation && data.careerInterests.higherEducation.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.higherEducation.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>

            {/* Startup */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4" /> Startup Ideas
              </h4>
              {data.careerInterests?.startup && data.careerInterests.startup.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.startup.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>

            {/* Family Business */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Family Business
              </h4>
              {data.careerInterests?.familyBusiness && data.careerInterests.familyBusiness.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.familyBusiness.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>

            {/* Other Interests */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Other Interests
              </h4>
              {data.careerInterests?.otherInterests && data.careerInterests.otherInterests.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.careerInterests.otherInterests.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None specified</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
