"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, CheckCircle, User, Home, DollarSign, AlertTriangle } from "lucide-react"

interface ScheduleEFormData {
  // Personal Information
  name: string
  ssn: string

  // Property Information (up to 3 properties)
  // Property 1
  property1Type: string
  property1Address: string
  property1City: string
  property1State: string
  property1ZipCode: string
  property1RentalDays: string
  property1PersonalDays: string
  property1RentalIncome: string
  property1Royalties: string
  property1OtherIncome: string
  property1Advertising: string
  property1AutoTravel: string
  property1Cleaning: string
  property1Commissions: string
  property1Insurance: string
  property1Legal: string
  property1Management: string
  property1MortgageInterest: string
  property1OtherInterest: string
  property1Repairs: string
  property1Supplies: string
  property1Taxes: string
  property1Utilities: string
  property1Depreciation: string

  // Property 2
  property2Type: string
  property2Address: string
  property2City: string
  property2State: string
  property2ZipCode: string
  property2RentalDays: string
  property2PersonalDays: string
  property2RentalIncome: string
  property2Royalties: string
  property2OtherIncome: string
  property2Advertising: string
  property2AutoTravel: string
  property2Cleaning: string
  property2Commissions: string
  property2Insurance: string
  property2Legal: string
  property2Management: string
  property2MortgageInterest: string
  property2OtherInterest: string
  property2Repairs: string
  property2Supplies: string
  property2Taxes: string
  property2Utilities: string
  property2Depreciation: string

  // Property 3
  property3Type: string
  property3Address: string
  property3City: string
  property3State: string
  property3ZipCode: string
  property3RentalDays: string
  property3PersonalDays: string
  property3RentalIncome: string
  property3Royalties: string
  property3OtherIncome: string
  property3Advertising: string
  property3AutoTravel: string
  property3Cleaning: string
  property3Commissions: string
  property3Insurance: string
  property3Legal: string
  property3Management: string
  property3MortgageInterest: string
  property3OtherInterest: string
  property3Repairs: string
  property3Supplies: string
  property3Taxes: string
  property3Utilities: string
  property3Depreciation: string
}

interface FormErrors {
  [key: string]: string
}

export function ScheduleEForm() {
  const [formData, setFormData] = useState<ScheduleEFormData>({
    name: "",
    ssn: "",
    property1Type: "",
    property1Address: "",
    property1City: "",
    property1State: "",
    property1ZipCode: "",
    property1RentalDays: "",
    property1PersonalDays: "",
    property1RentalIncome: "",
    property1Royalties: "",
    property1OtherIncome: "",
    property1Advertising: "",
    property1AutoTravel: "",
    property1Cleaning: "",
    property1Commissions: "",
    property1Insurance: "",
    property1Legal: "",
    property1Management: "",
    property1MortgageInterest: "",
    property1OtherInterest: "",
    property1Repairs: "",
    property1Supplies: "",
    property1Taxes: "",
    property1Utilities: "",
    property1Depreciation: "",
    property2Type: "",
    property2Address: "",
    property2City: "",
    property2State: "",
    property2ZipCode: "",
    property2RentalDays: "",
    property2PersonalDays: "",
    property2RentalIncome: "",
    property2Royalties: "",
    property2OtherIncome: "",
    property2Advertising: "",
    property2AutoTravel: "",
    property2Cleaning: "",
    property2Commissions: "",
    property2Insurance: "",
    property2Legal: "",
    property2Management: "",
    property2MortgageInterest: "",
    property2OtherInterest: "",
    property2Repairs: "",
    property2Supplies: "",
    property2Taxes: "",
    property2Utilities: "",
    property2Depreciation: "",
    property3Type: "",
    property3Address: "",
    property3City: "",
    property3State: "",
    property3ZipCode: "",
    property3RentalDays: "",
    property3PersonalDays: "",
    property3RentalIncome: "",
    property3Royalties: "",
    property3OtherIncome: "",
    property3Advertising: "",
    property3AutoTravel: "",
    property3Cleaning: "",
    property3Commissions: "",
    property3Insurance: "",
    property3Legal: "",
    property3Management: "",
    property3MortgageInterest: "",
    property3OtherInterest: "",
    property3Repairs: "",
    property3Supplies: "",
    property3Taxes: "",
    property3Utilities: "",
    property3Depreciation: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch("http://localhost:9000/health")
      if (response.ok) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      setConnectionStatus("error")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Personal Information
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.ssn.trim()) {
      newErrors.ssn = "SSN is required"
    } else if (formData.ssn.replace(/\D/g, "").length !== 9) {
      newErrors.ssn = "SSN must be 9 digits"
    }

    // At least one property must have some data
    const hasPropertyData = 
      formData.property1Type || formData.property1Address || formData.property1RentalIncome ||
      formData.property2Type || formData.property2Address || formData.property2RentalIncome ||
      formData.property3Type || formData.property3Address || formData.property3RentalIncome

    if (!hasPropertyData) {
      newErrors.property1Type = "At least one property is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ScheduleEFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`
  }

  const handleSSNChange = (value: string) => {
    const formatted = formatSSN(value)
    handleInputChange("ssn", formatted)
  }

  const calculateTotals = () => {
    let totalIncome = 0
    let totalExpenses = 0

    // Calculate for each property
    for (let i = 1; i <= 3; i++) {
      const prefix = `property${i}` as keyof ScheduleEFormData
      const rentalIncome = Number(formData[`${prefix}RentalIncome` as keyof ScheduleEFormData]) || 0
      const royalties = Number(formData[`${prefix}Royalties` as keyof ScheduleEFormData]) || 0
      const otherIncome = Number(formData[`${prefix}OtherIncome` as keyof ScheduleEFormData]) || 0
      
      totalIncome += rentalIncome + royalties + otherIncome

      const expenseFields = [
        "Advertising", "AutoTravel", "Cleaning", "Commissions", "Insurance",
        "Legal", "Management", "MortgageInterest", "OtherInterest", "Repairs",
        "Supplies", "Taxes", "Utilities", "Depreciation"
      ]

      expenseFields.forEach(field => {
        const amount = Number(formData[`${prefix}${field}` as keyof ScheduleEFormData]) || 0
        totalExpenses += amount
      })
    }

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses
    }
  }

  const downloadPDF = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setShowSuccess(false)

    try {
      const response = await fetch("http://localhost:9000/generate-schedule-e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const blob = await response.blob()
        downloadPDF(blob, "schedule_e_report.pdf")
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        alert(`Error generating PDF: ${errorData.detail}`)
      }
    } catch (error) {
      alert("Error connecting to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-8">
      {connectionStatus === "checking" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking server connection...</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cannot connect to server. Please make sure the backend is running on localhost:9000
          </AlertDescription>
        </Alert>
      )}

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            PDF generated successfully! Check your downloads folder.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="ssn">Social Security Number</Label>
              <Input
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleSSNChange(e.target.value)}
                placeholder="000-00-0000"
                maxLength={11}
                className={errors.ssn ? "border-red-500" : ""}
              />
              {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        {[1, 2, 3].map((propertyNum) => (
          <Card key={propertyNum}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property {propertyNum}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`property${propertyNum}Type`}>Property Type</Label>
                  <Select
                    value={formData[`property${propertyNum}Type` as keyof ScheduleEFormData] as string}
                    onValueChange={(value) => handleInputChange(`property${propertyNum}Type` as keyof ScheduleEFormData, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential Rental</SelectItem>
                      <SelectItem value="commercial">Commercial Rental</SelectItem>
                      <SelectItem value="vacation">Vacation Rental</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`property${propertyNum}Address`}>Property Address</Label>
                  <Input
                    id={`property${propertyNum}Address`}
                    value={formData[`property${propertyNum}Address` as keyof ScheduleEFormData] as string}
                    onChange={(e) => handleInputChange(`property${propertyNum}Address` as keyof ScheduleEFormData, e.target.value)}
                    placeholder="Enter property address"
                  />
                </div>
                <div>
                  <Label htmlFor={`property${propertyNum}City`}>City</Label>
                  <Input
                    id={`property${propertyNum}City`}
                    value={formData[`property${propertyNum}City` as keyof ScheduleEFormData] as string}
                    onChange={(e) => handleInputChange(`property${propertyNum}City` as keyof ScheduleEFormData, e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor={`property${propertyNum}State`}>State</Label>
                  <Input
                    id={`property${propertyNum}State`}
                    value={formData[`property${propertyNum}State` as keyof ScheduleEFormData] as string}
                    onChange={(e) => handleInputChange(`property${propertyNum}State` as keyof ScheduleEFormData, e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor={`property${propertyNum}ZipCode`}>ZIP Code</Label>
                  <Input
                    id={`property${propertyNum}ZipCode`}
                    value={formData[`property${propertyNum}ZipCode` as keyof ScheduleEFormData] as string}
                    onChange={(e) => handleInputChange(`property${propertyNum}ZipCode` as keyof ScheduleEFormData, e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              <Separator />

              {/* Income */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Income
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`property${propertyNum}RentalIncome`}>Rental Income</Label>
                    <Input
                      id={`property${propertyNum}RentalIncome`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}RentalIncome` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}RentalIncome` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Royalties`}>Royalties</Label>
                    <Input
                      id={`property${propertyNum}Royalties`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Royalties` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Royalties` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}OtherIncome`}>Other Income</Label>
                    <Input
                      id={`property${propertyNum}OtherIncome`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}OtherIncome` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}OtherIncome` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Expenses */}
              <div>
                <h4 className="font-semibold mb-4">Expenses</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`property${propertyNum}Advertising`}>Advertising</Label>
                    <Input
                      id={`property${propertyNum}Advertising`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Advertising` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Advertising` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}AutoTravel`}>Auto & Travel</Label>
                    <Input
                      id={`property${propertyNum}AutoTravel`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}AutoTravel` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}AutoTravel` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Cleaning`}>Cleaning</Label>
                    <Input
                      id={`property${propertyNum}Cleaning`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Cleaning` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Cleaning` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Insurance`}>Insurance</Label>
                    <Input
                      id={`property${propertyNum}Insurance`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Insurance` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Insurance` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Legal`}>Legal</Label>
                    <Input
                      id={`property${propertyNum}Legal`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Legal` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Legal` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Management`}>Management</Label>
                    <Input
                      id={`property${propertyNum}Management`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Management` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Management` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}MortgageInterest`}>Mortgage Interest</Label>
                    <Input
                      id={`property${propertyNum}MortgageInterest`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}MortgageInterest` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}MortgageInterest` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Repairs`}>Repairs</Label>
                    <Input
                      id={`property${propertyNum}Repairs`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Repairs` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Repairs` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Taxes`}>Taxes</Label>
                    <Input
                      id={`property${propertyNum}Taxes`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Taxes` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Taxes` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Utilities`}>Utilities</Label>
                    <Input
                      id={`property${propertyNum}Utilities`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Utilities` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Utilities` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`property${propertyNum}Depreciation`}>Depreciation</Label>
                    <Input
                      id={`property${propertyNum}Depreciation`}
                      type="number"
                      step="0.01"
                      value={formData[`property${propertyNum}Depreciation` as keyof ScheduleEFormData] as string}
                      onChange={(e) => handleInputChange(`property${propertyNum}Depreciation` as keyof ScheduleEFormData, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-blue-600">${totals.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totals.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-green-600">${totals.netIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || connectionStatus === "error"}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Schedule E PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 