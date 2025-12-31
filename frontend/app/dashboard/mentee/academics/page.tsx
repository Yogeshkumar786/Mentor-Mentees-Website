"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import type { AcademicRecord, Course } from "@/lib/types"

export default function MenteeAcademicsPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([{ code: "", name: "", grade: "", credits: 0 }])
  const [achievements, setAchievements] = useState<string[]>([""])

  const [formData, setFormData] = useState({
    semester: "Fall",
    year: new Date().getFullYear(),
    gpa: 0,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allRecords = storage.getAcademicRecords()
    const myRecords = allRecords.filter((r) => r.studentId === user.id)
    setRecords(myRecords.sort((a, b) => b.year - a.year || a.semester.localeCompare(b.semester)))
  }

  const handleAddCourse = () => {
    setCourses([...courses, { code: "", name: "", grade: "", credits: 0 }])
  }

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index))
  }

  const handleUpdateCourse = (index: number, field: keyof Course, value: any) => {
    const updated = [...courses]
    updated[index] = { ...updated[index], [field]: value }
    setCourses(updated)
  }

  const handleAddAchievement = () => {
    setAchievements([...achievements, ""])
  }

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index))
  }

  const handleUpdateAchievement = (index: number, value: string) => {
    const updated = [...achievements]
    updated[index] = value
    setAchievements(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validCourses = courses.filter((c) => c.code && c.name)
    const validAchievements = achievements.filter((a) => a.trim())

    const newRecord: AcademicRecord = {
      id: Date.now().toString(),
      studentId: user.id,
      semester: formData.semester,
      year: formData.year,
      gpa: formData.gpa,
      courses: validCourses,
      achievements: validAchievements,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allRecords = storage.getAcademicRecords()
    storage.setAcademicRecords([...allRecords, newRecord])

    setIsDialogOpen(false)
    setFormData({ semester: "Fall", year: new Date().getFullYear(), gpa: 0, notes: "" })
    setCourses([{ code: "", name: "", grade: "", credits: 0 }])
    setAchievements([""])
    loadData()
  }

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600 dark:text-green-400"
    if (gpa >= 3.0) return "text-blue-600 dark:text-blue-400"
    if (gpa >= 2.5) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const calculateOverallGPA = (): string => {
    if (records.length === 0) return "0.00"
    const total = records.reduce((sum, r) => sum + r.gpa, 0)
    return (total / records.length).toFixed(2)
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
            <p className="text-muted-foreground mt-1">Track your academic performance</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Academic Record</DialogTitle>
                <DialogDescription>Record your semester performance and achievements</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <select
                      id="semester"
                      aria-label="Select semester"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: Number.parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Courses</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddCourse}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Course
                    </Button>
                  </div>
                  {courses.map((course, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <Input
                          placeholder="Course Code"
                          value={course.code}
                          onChange={(e) => handleUpdateCourse(index, "code", e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Course Name"
                          value={course.name}
                          onChange={(e) => handleUpdateCourse(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Grade"
                          value={course.grade}
                          onChange={(e) => handleUpdateCourse(index, "grade", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Credits"
                          value={course.credits === 0 ? "" : String(course.credits)}
                          onChange={(e) => handleUpdateCourse(index, "credits", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCourse(index)}
                          disabled={courses.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Achievements</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddAchievement}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Achievement
                    </Button>
                  </div>
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Achievement or award"
                        value={achievement}
                        onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAchievement(index)}
                        disabled={achievements.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this semester..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Record
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Overall GPA:</span>
                  <span className={`text-2xl font-bold ${getGradeColor(Number.parseFloat(calculateOverallGPA()))}`}>
                    {calculateOverallGPA()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  {records.length} semester{records.length !== 1 ? "s" : ""} recorded
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {record.semester} {record.year}
                      </CardTitle>
                      <CardDescription>{record.courses.length} courses</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">GPA</div>
                      <div className={`text-2xl font-bold ${getGradeColor(record.gpa)}`}>{record.gpa.toFixed(2)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.courses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Courses:</p>
                      <div className="space-y-1">
                        {record.courses.map((course, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{course.code}</span>
                              <span>{course.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{course.grade}</Badge>
                              <span className="text-xs text-muted-foreground">{course.credits} credits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.achievements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Achievements:</p>
                      <ul className="space-y-1">
                        {record.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {record.notes && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No academic records yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>Add Your First Record</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
