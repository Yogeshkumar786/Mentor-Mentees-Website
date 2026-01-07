"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentInternshipsByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Briefcase, MapPin, Calendar, DollarSign, Clock } from "lucide-react"

export default function StudentInternshipsPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentInternshipsByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentInternshipsByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch internships")
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

  const getTypeBadgeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SUMMER':
        return "bg-yellow-500"
      case 'WINTER':
        return "bg-blue-500"
      case 'INDUSTRIAL':
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Paid Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.internships?.filter(i => i.stipend > 0)?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Stipend Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹{data?.internships?.reduce((acc, i) => acc + (i.stipend || 0), 0)?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Internships List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Internships
          </CardTitle>
          <CardDescription>All internship experiences</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.internships || data.internships.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No internships found</p>
          ) : (
            <div className="space-y-4">
              {data.internships.map((internship) => (
                <Card key={internship.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{internship.organisation}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeBadgeColor(internship.type)}>
                            {internship.type}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Sem {internship.semester}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">{internship.location || "N/A"}</p>
                        </div>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">{internship.duration || "N/A"}</p>
                        </div>
                      </div>
                      
                      {/* Stipend */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Stipend</p>
                          <p className="text-sm font-medium">
                            {internship.stipend > 0 ? `₹${internship.stipend.toLocaleString()}` : "Unpaid"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
