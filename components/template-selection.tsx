"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScheduleCForm } from "./schedule-c-form"
import { Building, Home, ArrowLeft } from "lucide-react"
import { ScheduleEForm } from "./schedule-e-form"

type FormType = "selection" | "schedule_c" | "schedule_e"

export function TemplateSelection() {
  const [selectedForm, setSelectedForm] = useState<FormType>("selection")

  const handleBackToSelection = () => {
    setSelectedForm("selection")
  }

  if (selectedForm === "schedule_c") {
    return (
      <div>
        <Button
          variant="outline"
          onClick={handleBackToSelection}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Template Selection
        </Button>
        <ScheduleCForm />
      </div>
    )
  }

  if (selectedForm === "schedule_e") {
    return (
      <div>
        <Button
          variant="outline"
          onClick={handleBackToSelection}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Template Selection
        </Button>
        <ScheduleEForm />
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedForm("schedule_c")}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Schedule C</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Profit or Loss From Business</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            For sole proprietors and single-member LLCs reporting business income and expenses.
          </p>
          <Button className="w-full">
            Select Schedule C
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedForm("schedule_e")}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Schedule E</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Supplemental Income and Loss</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            For rental income, royalties, partnerships, S corporations, and estates/trusts.
          </p>
          <Button className="w-full">
            Select Schedule E
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 