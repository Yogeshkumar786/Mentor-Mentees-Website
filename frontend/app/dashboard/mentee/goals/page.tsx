"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import type { CareerGoal, Milestone } from "@/lib/types"

export default function MenteeGoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "not-started" | "in-progress" | "completed">("all")
  const [milestones, setMilestones] = useState<string[]>([""])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
    category: "short-term" as "short-term" | "long-term",
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allGoals = storage.getCareerGoals()
    const myGoals = allGoals.filter((g) => g.studentId === user.id)
    setGoals(myGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const handleAddMilestone = () => {
    setMilestones([...milestones, ""])
  }

  const handleUpdateMilestone = (index: number, value: string) => {
    const updated = [...milestones]
    updated[index] = value
    setMilestones(updated)
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validMilestones = milestones
      .filter((m) => m.trim())
      .map(
        (title, idx): Milestone => ({
          id: `${Date.now()}-${idx}`,
          title,
          completed: false,
        }),
      )

    const newGoal: CareerGoal = {
      id: Date.now().toString(),
      studentId: user.id,
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate || undefined,
      category: formData.category,
      status: "not-started",
      milestones: validMilestones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allGoals = storage.getCareerGoals()
    storage.setCareerGoals([...allGoals, newGoal])

    setIsDialogOpen(false)
    setFormData({ title: "", description: "", targetDate: "", category: "short-term" })
    setMilestones([""])
    loadData()
  }

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const allGoals = storage.getCareerGoals()
    const updatedGoals = allGoals.map((g) => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
            : m,
        )

        // Update goal status based on milestones
        let newStatus = g.status
        const completedCount = updatedMilestones.filter((m) => m.completed).length
        if (completedCount === 0) {
          newStatus = "not-started"
        } else if (completedCount === updatedMilestones.length) {
          newStatus = "completed"
        } else {
          newStatus = "in-progress"
        }

        return {
          ...g,
          milestones: updatedMilestones,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }
      }
      return g
    })

    storage.setCareerGoals(updatedGoals)
    loadData()
  }

  const filteredGoals = goals.filter((g) => (filter === "all" ? true : g.status === filter))

  const getProgress = (goal: CareerGoal) => {
    if (goal.milestones.length === 0) return 0
    const completed = goal.milestones.filter((m) => m.completed).length
    return Math.round((completed / goal.milestones.length) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Career Goals</h1>
            <p className="text-muted-foreground mt-1">Set and track your career objectives</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Career Goal</DialogTitle>
                <DialogDescription>Set a new career goal with milestones</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Land a software engineering internship"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your goal and why it matters..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      aria-label="Select goal category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="short-term">Short-term</option>
                      <option value="long-term">Long-term</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date (Optional)</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Milestones</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddMilestone}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Milestone description"
                        value={milestone}
                        onChange={(e) => handleUpdateMilestone(index, e.target.value)}
                      />
                      {milestones.length > 1 && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveMilestone(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Goal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button
            variant={filter === "not-started" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("not-started")}
          >
            Not Started
          </Button>
          <Button
            variant={filter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>

        <div className="space-y-4">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => {
              const progress = getProgress(goal)
              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{goal.title}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {goal.category}
                          </Badge>
                        </div>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <Badge className={`capitalize ${getStatusColor(goal.status)}`}>
                        {goal.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {goal.milestones.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Milestones:</p>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent">
                              <Checkbox
                                checked={milestone.completed}
                                onCheckedChange={() => handleToggleMilestone(goal.id, milestone.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <p
                                  className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {milestone.title}
                                </p>
                                {milestone.completedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {milestone.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No career goals yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>Set Your First Goal</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
