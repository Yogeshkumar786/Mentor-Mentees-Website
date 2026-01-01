import { Suspense } from "react"
import MentorGroupClient from "./mentor-group-client"
import { Loader2 } from "lucide-react"

export default function MentorshipGroupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <MentorGroupClient />
    </Suspense>
  )
}