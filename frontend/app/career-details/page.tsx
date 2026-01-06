"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentCareerDetails, UpdateCareerRankingsRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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
  AlertCircle,
  Pencil,
  Plus,
  X,
  Award,
  Building,
  Save
} from "lucide-react"

interface EditDialogState {
  open: boolean
  field: string
  title: string
  items: string[]
  apiFunction: (items: string[]) => Promise<any>
}

export default function CareerDetailsPage() {
  const [careerData, setCareerData] = useState<StudentCareerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingRankings, setSavingRankings] = useState(false)
  const [editingRankings, setEditingRankings] = useState(false)
  const [rankings, setRankings] = useState<UpdateCareerRankingsRequest>({})
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    field: '',
    title: '',
    items: [],
    apiFunction: async () => {}
  })
  const [newItem, setNewItem] = useState('')
  const { toast } = useToast()

  const fetchCareerData = async () => {
    try {
      setLoading(true)
      const data = await api.getStudentCareerDetails()
      setCareerData(data)
      // Initialize rankings from data
      if (data.careerRankings) {
        setRankings({
          govt_sector_rank: data.careerRankings.govt_sector_rank,
          core_rank: data.careerRankings.core_rank,
          it_rank: data.careerRankings.it_rank,
          higher_education_rank: data.careerRankings.higher_education_rank,
          startup_rank: data.careerRankings.startup_rank,
          family_business_rank: data.careerRankings.family_business_rank,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch career details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCareerData()
  }, [])

  // Validation constants
  const MAX_ITEMS = 15
  const MAX_ITEM_LENGTH = 50

  const openEditDialog = (field: string, title: string, items: string[], apiFunction: (items: string[]) => Promise<any>) => {
    setEditDialog({
      open: true,
      field,
      title,
      items: [...items],
      apiFunction
    })
    setNewItem('')
  }

  const handleAddItem = () => {
    const trimmedItem = newItem.trim()
    
    // Validation
    if (!trimmedItem) return
    
    if (trimmedItem.length > MAX_ITEM_LENGTH) {
      toast({
        title: "Too Long",
        description: `Item must be ${MAX_ITEM_LENGTH} characters or less`,
        variant: "destructive",
      })
      return
    }
    
    if (editDialog.items.includes(trimmedItem)) {
      toast({
        title: "Duplicate",
        description: "This item already exists",
        variant: "destructive",
      })
      return
    }
    
    if (editDialog.items.length >= MAX_ITEMS) {
      toast({
        title: "Limit Reached",
        description: `Maximum ${MAX_ITEMS} items allowed`,
        variant: "destructive",
      })
      return
    }
    
    setEditDialog(prev => ({
      ...prev,
      items: [...prev.items, trimmedItem]
    }))
    setNewItem('')
  }

  const handleRemoveItem = (item: string) => {
    setEditDialog(prev => ({
      ...prev,
      items: prev.items.filter(i => i !== item)
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await editDialog.apiFunction(editDialog.items)
      await fetchCareerData()
      setEditDialog(prev => ({ ...prev, open: false }))
      toast({
        title: "Success",
        description: `${editDialog.title} updated successfully`,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  const handleSaveRankings = async () => {
    try {
      setSavingRankings(true)
      await api.updateCareerRankings(rankings)
      await fetchCareerData()
      setEditingRankings(false)
      toast({
        title: "Success",
        description: "Career rankings updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update rankings',
        variant: "destructive",
      })
    } finally {
      setSavingRankings(false)
    }
  }

  const handleCancelRankings = () => {
    if (careerData?.careerRankings) {
      setRankings({
        govt_sector_rank: careerData.careerRankings.govt_sector_rank,
        core_rank: careerData.careerRankings.core_rank,
        it_rank: careerData.careerRankings.it_rank,
        higher_education_rank: careerData.careerRankings.higher_education_rank,
        startup_rank: careerData.careerRankings.startup_rank,
        family_business_rank: careerData.careerRankings.family_business_rank,
      })
    }
    setEditingRankings(false)
  }

  const rankingOptions = [
    { value: '1', label: '1 - Highest Priority' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6 - Lowest Priority' },
  ]

  const careerRankingFields = [
    { key: 'govt_sector_rank' as const, label: 'Govt. Sector', icon: Building, color: 'text-blue-600' },
    { key: 'core_rank' as const, label: 'Core Engineering', icon: Briefcase, color: 'text-indigo-500' },
    { key: 'it_rank' as const, label: 'IT / Software', icon: Code, color: 'text-green-500' },
    { key: 'higher_education_rank' as const, label: 'Higher Education', icon: GraduationCap, color: 'text-purple-500' },
    { key: 'startup_rank' as const, label: 'Startup', icon: Rocket, color: 'text-orange-500' },
    { key: 'family_business_rank' as const, label: 'Family Business', icon: Building2, color: 'text-amber-500' },
  ]

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
      field: 'core',
      items: careerData?.careerInterests.core || [],
      color: 'text-blue-500',
      apiFunction: api.updateCareerCore.bind(api)
    },
    { 
      icon: Code, 
      title: 'IT / Software', 
      field: 'it',
      items: careerData?.careerInterests.it || [],
      color: 'text-green-500',
      apiFunction: api.updateCareerIT.bind(api)
    },
    { 
      icon: GraduationCap, 
      title: 'Higher Education', 
      field: 'higherEducation',
      items: careerData?.careerInterests.higherEducation || [],
      color: 'text-purple-500',
      apiFunction: api.updateCareerHigherEducation.bind(api)
    },
    { 
      icon: Rocket, 
      title: 'Startup', 
      field: 'startup',
      items: careerData?.careerInterests.startup || [],
      color: 'text-orange-500',
      apiFunction: api.updateCareerStartup.bind(api)
    },
    { 
      icon: Building2, 
      title: 'Family Business', 
      field: 'familyBusiness',
      items: careerData?.careerInterests.familyBusiness || [],
      color: 'text-amber-500',
      apiFunction: api.updateCareerFamilyBusiness.bind(api)
    },
    { 
      icon: Sparkles, 
      title: 'Other Interests', 
      field: 'otherInterests',
      items: careerData?.careerInterests.otherInterests || [],
      color: 'text-pink-500',
      apiFunction: api.updateCareerOtherInterests.bind(api)
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Hobbies
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openEditDialog('hobbies', 'Hobbies', careerData?.hobbies || [], api.updateCareerHobbies.bind(api))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Things you love doing</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBadgeList(careerData?.hobbies || [], 'No hobbies added yet')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Strengths
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openEditDialog('strengths', 'Strengths', careerData?.strengths || [], api.updateCareerStrengths.bind(api))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Your key strengths</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBadgeList(careerData?.strengths || [], 'No strengths added yet')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Areas to Improve
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openEditDialog('areasToImprove', 'Areas to Improve', careerData?.areasToImprove || [], api.updateCareerAreasToImprove.bind(api))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                      <h4 className="font-semibold">{section.title}</h4>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(section.field, section.title, section.items, section.apiFunction)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                  {renderBadgeList(section.items, 'Not specified')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Career Rankings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Career Path Priority Rankings
                </CardTitle>
                <CardDescription>Rank your career preferences from 1 (highest) to 6 (lowest)</CardDescription>
              </div>
              {!editingRankings ? (
                <Button variant="outline" onClick={() => setEditingRankings(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Rankings
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelRankings} disabled={savingRankings}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRankings} disabled={savingRankings}>
                    {savingRankings ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {careerRankingFields.map((field) => {
                const Icon = field.icon
                const currentRank = editingRankings 
                  ? rankings[field.key] 
                  : careerData?.careerRankings?.[field.key] ?? 0
                
                return (
                  <div key={field.key} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${field.color}`} />
                      <span className="font-medium">{field.label}</span>
                    </div>
                    {editingRankings ? (
                      <Select
                        value={String(rankings[field.key] ?? '')}
                        onValueChange={(value) => setRankings(prev => ({ ...prev, [field.key]: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {rankingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={currentRank <= 2 ? "default" : currentRank <= 4 ? "secondary" : "outline"}>
                          Rank #{currentRank}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {currentRank === 1 ? '(Top Priority)' : currentRank === 6 ? '(Lowest)' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editDialog.title}</DialogTitle>
              <DialogDescription>
                Add or remove items from your {editDialog.title.toLowerCase()} list. Max {MAX_ITEMS} items, {MAX_ITEM_LENGTH} chars each.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Add new ${editDialog.title.toLowerCase().replace(/s$/, '')}...`}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={MAX_ITEM_LENGTH}
                  disabled={editDialog.items.length >= MAX_ITEMS}
                />
                <Button 
                  onClick={handleAddItem} 
                  size="icon"
                  disabled={editDialog.items.length >= MAX_ITEMS || !newItem.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{newItem.length}/{MAX_ITEM_LENGTH} characters</span>
                <span className={editDialog.items.length >= MAX_ITEMS ? 'text-destructive' : ''}>
                  {editDialog.items.length}/{MAX_ITEMS} items
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {editDialog.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No items added yet</p>
                ) : (
                  editDialog.items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1">
                      {item}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(prev => ({ ...prev, open: false }))}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
