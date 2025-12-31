"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentInternships } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  IndianRupee,
  Calendar,
  Building2,
  Loader2,
  AlertCircle
} from "lucide-react"

export default function InternshipsPage() {
  const [internshipsData, setInternshipsData] = useState<StudentInternships | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentInternships()
        setInternshipsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch internships')
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
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

  const formatStipend = (stipend: number) => {
    if (stipend === 0) return 'Unpaid'
    return `₹${stipend.toLocaleString('en-IN')}/month`
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
            <p className="text-muted-foreground">Your internship experiences</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total: {internshipsData?.total || 0}
          </Badge>
        </div>

        {/* Internships List */}
        {internshipsData?.internships && internshipsData.internships.length > 0 ? (
          <div className="grid gap-6">
            {internshipsData.internships.map((internship) => (
              <Card key={internship.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {internship.organisation}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{internship.type}</Badge>
                        <span>•</span>
                        <span>Semester {internship.semester}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{internship.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{internship.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stipend</p>
                        <p className="font-medium">{formatStipend(internship.stipend)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No Internships Yet</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  You haven&apos;t added any internship experiences yet. 
                  Internships are a great way to gain practical experience!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
