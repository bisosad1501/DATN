"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Loader2 } from "lucide-react"

export default function ExercisesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to exercise list page
    router.push("/exercises/list")
  }, [router])

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  )
}
