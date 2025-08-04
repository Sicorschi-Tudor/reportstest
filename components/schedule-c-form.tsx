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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Download, CheckCircle, User, Building, DollarSign, AlertTriangle } from "lucide-react"

interface ScheduleCFormData {
  // Personal Information
  name: string
  ssn: string

  // Business Information
  principalBusinessActivity: string
  businessCode: string
  businessName: string
  businessAddress: string
  city: string
  state: string
  zipCode: string
  accountingMethod: string
  materialParticipation: boolean
  startedBusiness: boolean
  businessStartDate: string
  additionalBusinessInfo: string

  // Part I - Income
  grossReceipts: string
  returnsAllowances: string
  otherIncome: string

  // Part II - Expenses
  advertising: string
  carTruckExpenses: string
  commissionsAndFees: string
  contractLabor: string
  depletion: string
  depreciation: string
  employeeBenefitPrograms: string
  insurance: string
  interestMortgage: string
  interestOther: string
  legalProfessionalServices: string
  officeExpense: string
  pensionProfitSharing: string
  rentLeaseVehicles: string
  rentLeaseMachinery: string
  rentLeaseOther: string
  repairsMaintenance: string
  supplies: string
  taxesLicenses: string
  travel: string
  deductibleMeals: string
  utilities: string
  wages: string

  // Part IV - Vehicle Information
  vehicleUsed: boolean
  vehicleMakeModel: string
  vehicleYear: string
  totalMiles: string
  businessMiles: string
  commutingMiles: string
  otherPersonalMiles: string
  availableForPersonalUse: string
  evidenceToSupportDeduction: string
  evidenceWritten: string

  // Part V - Other Expenses (up to 10 entries)
  otherExpense1Desc: string
  otherExpense1Amount: string
  otherExpense2Desc: string
  otherExpense2Amount: string
  otherExpense3Desc: string
  otherExpense3Amount: string
  otherExpense4Desc: string
  otherExpense4Amount: string
  otherExpense5Desc: string
  otherExpense5Amount: string
  otherExpense6Desc: string
  otherExpense6Amount: string
  otherExpense7Desc: string
  otherExpense7Amount: string
  otherExpense8Desc: string
  otherExpense8Amount: string
  otherExpense9Desc: string
  otherExpense9Amount: string
  otherExpense10Desc: string
  otherExpense10Amount: string
}

interface FormErrors {
  [key: string]: string
}

export function ScheduleCForm() {
  const [formData, setFormData] = useState<ScheduleCFormData>({
    name: "",
    ssn: "",
    principalBusinessActivity: "",
    businessCode: "",
    businessName: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    accountingMethod: "cash",
    materialParticipation: true,
    startedBusiness: false,
    businessStartDate: "",
    additionalBusinessInfo: "",

    grossReceipts: "",
    returnsAllowances: "",
    otherIncome: "",

    advertising: "",
    carTruckExpenses: "",
    commissionsAndFees: "",
    contractLabor: "",
    depletion: "",
    depreciation: "",
    employeeBenefitPrograms: "",
    insurance: "",
    interestMortgage: "",
    interestOther: "",
    legalProfessionalServices: "",
    officeExpense: "",
    pensionProfitSharing: "",
    rentLeaseVehicles: "",
    rentLeaseMachinery: "",
    rentLeaseOther: "",
    repairsMaintenance: "",
    supplies: "",
    taxesLicenses: "",
    travel: "",
    deductibleMeals: "",
    utilities: "",
    wages: "",

    vehicleUsed: false,
    vehicleMakeModel: "",
    vehicleYear: "",
    totalMiles: "",
    businessMiles: "",
    commutingMiles: "",
    otherPersonalMiles: "",
    availableForPersonalUse: "",
    evidenceToSupportDeduction: "",
    evidenceWritten: "",

    otherExpense1Desc: "",
    otherExpense1Amount: "",
    otherExpense2Desc: "",
    otherExpense2Amount: "",
    otherExpense3Desc: "",
    otherExpense3Amount: "",
    otherExpense4Desc: "",
    otherExpense4Amount: "",
    otherExpense5Desc: "",
    otherExpense5Amount: "",
    otherExpense6Desc: "",
    otherExpense6Amount: "",
    otherExpense7Desc: "",
    otherExpense7Amount: "",
    otherExpense8Desc: "",
    otherExpense8Amount: "",
    otherExpense9Desc: "",
    otherExpense9Amount: "",
    otherExpense10Desc: "",
    otherExpense10Amount: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "disconnected">("unknown")
  const [serverInfo, setServerInfo] = useState<{
    status: string;
    pdf_library_available: boolean;
    reportlab_available: boolean;
    schedule_c_template_exists: boolean;
  } | null>(null)

  const testConnection = async () => {
    try {
      const response = await fetch("http://localhost:9000/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const info = await response.json()
        setServerInfo(info)
        setConnectionStatus("connected")
        return true
      } else {
        setConnectionStatus("disconnected")
        return false
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("disconnected")
      return false
    }
  }

  useEffect(() => {
   testConnection()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.ssn.trim()) newErrors.ssn = "SSN is required"
    if (!formData.principalBusinessActivity.trim())
      newErrors.principalBusinessActivity = "Principal business activity is required"
    if (!formData.businessCode.trim()) newErrors.businessCode = "Business code is required"
    if (!formData.grossReceipts.trim()) newErrors.grossReceipts = "Gross receipts is required"

    // Validate numeric fields
    const numericFields = [
      "grossReceipts",
      "returnsAllowances",
      "otherIncome",
      "advertising",
      "carTruckExpenses",
      "commissionsAndFees",
      "contractLabor",
      "depletion",
      "depreciation",
      "employeeBenefitPrograms",
      "insurance",
      "interestMortgage",
      "interestOther",
      "legalProfessionalServices",
      "officeExpense",
      "pensionProfitSharing",
      "rentLeaseVehicles",
      "rentLeaseMachinery",
      "rentLeaseOther",
      "repairsMaintenance",
      "supplies",
      "taxesLicenses",
      "travel",
      "deductibleMeals",
      "utilities",
      "wages",
    ]

    numericFields.forEach((field) => {
      const value = formData[field as keyof ScheduleCFormData] as string
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        newErrors[field] = "Please enter a valid amount"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ScheduleCFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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
    const grossReceipts = Number(formData.grossReceipts) || 0
    const returnsAllowances = Number(formData.returnsAllowances) || 0
    const otherIncome = Number(formData.otherIncome) || 0
    const grossIncome = grossReceipts - returnsAllowances + otherIncome

    const expenseFields = [
      "advertising",
      "carTruckExpenses",
      "commissionsAndFees",
      "contractLabor",
      "depletion",
      "depreciation",
      "employeeBenefitPrograms",
      "insurance",
      "interestMortgage",
      "interestOther",
      "legalProfessionalServices",
      "officeExpense",
      "pensionProfitSharing",
      "rentLeaseVehicles",
      "rentLeaseMachinery",
      "rentLeaseOther",
      "repairsMaintenance",
      "supplies",
      "taxesLicenses",
      "travel",
      "deductibleMeals",
      "utilities",
      "wages",
    ]

    const totalExpenses = expenseFields.reduce((sum, field) => {
      return sum + (Number(formData[field as keyof ScheduleCFormData]) || 0)
    }, 0)

    const otherExpensesTotal = [
      Number(formData.otherExpense1Amount) || 0,
      Number(formData.otherExpense2Amount) || 0,
      Number(formData.otherExpense3Amount) || 0,
      Number(formData.otherExpense4Amount) || 0,
      Number(formData.otherExpense5Amount) || 0,
      Number(formData.otherExpense6Amount) || 0,
      Number(formData.otherExpense7Amount) || 0,
      Number(formData.otherExpense8Amount) || 0,
      Number(formData.otherExpense9Amount) || 0,
      Number(formData.otherExpense10Amount) || 0,
    ].reduce((sum, amount) => sum + amount, 0)

    const finalTotalExpenses = totalExpenses + otherExpensesTotal
    const netProfit = grossIncome - finalTotalExpenses

    return { grossIncome, totalExpenses: finalTotalExpenses, netProfit }
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

    // Test connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      setIsLoading(false)
      alert(
        "Cannot connect to the backend server. Please ensure:\n\n" +
          "1. The Python backend server is running on http://localhost:9000\n" +
          "2. Run: python scripts/start_server.py\n" +
          "3. Check that the f1040sc.pdf template is in the scripts folder\n" +
          "4. No firewall is blocking port 9000",
      )
      return
    }

    try {
      console.log("Sending data to backend:", formData)

      const response = await fetch("http://localhost:9000/generate-schedule-c", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Server error (${response.status}): ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/pdf")) {
        const responseText = await response.text()
        console.error("Unexpected response type:", contentType, responseText)
        throw new Error("Server did not return a PDF file")
      }

      const blob = await response.blob()
      console.log("PDF blob size:", blob.size)

      if (blob.size === 0) {
        throw new Error("Received empty PDF file")
      }

      const filename = `schedule-c-${formData.businessName.replace(/\s+/g, "-").toLowerCase() || "report"}.pdf`
      downloadPDF(blob, filename)
      setShowSuccess(true)

      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Error generating PDF:", error)

      let errorMessage = "Failed to generate PDF. "
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage +=
          "Cannot connect to backend server. Please ensure the Python server is running on http://localhost:9000"
      } else if (error instanceof Error) {
        errorMessage += error.message
      } else {
        errorMessage += "Unknown error occurred"
      }

      alert(errorMessage + "\n\nCheck the browser console for more details.")
    } finally {
      setIsLoading(false)
    }
  }

  const { grossIncome, totalExpenses, netProfit } = calculateTotals()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Schedule C PDF has been generated and downloaded successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "disconnected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            />
            <span className="text-sm">
              Backend Server:{" "}
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "disconnected"
                  ? "Disconnected"
                  : "Checking..."}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={testConnection} disabled={isLoading}>
              Test Connection
            </Button>
          </div>

          {connectionStatus === "disconnected" && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Backend server not running!</strong>
                <br />
                Please run: <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded text-red-800 dark:text-red-200">python scripts/start_server.py</code>
              </AlertDescription>
            </Alert>
          )}

          {serverInfo && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              <p>Template found: {serverInfo.schedule_c_template_exists ? "✅ Yes" : "❌ No"}</p>
                {!serverInfo.schedule_c_template_exists && (
                <p className="text-red-600 dark:text-red-400">Download f1040sc.pdf and place it in the scripts folder</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name of proprietor *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500 dark:border-red-400" : ""}
              />
              {errors.name && <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssn">Social security number *</Label>
              <Input
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleSSNChange(e.target.value)}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                className={errors.ssn ? "border-red-500 dark:border-red-400" : ""}
              />
              {errors.ssn && <p className="text-sm text-red-500 dark:text-red-400">{errors.ssn}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principalBusinessActivity">Principal business or profession *</Label>
            <Input
              id="principalBusinessActivity"
              value={formData.principalBusinessActivity}
              onChange={(e) => handleInputChange("principalBusinessActivity", e.target.value)}
                              className={errors.principalBusinessActivity ? "border-red-500 dark:border-red-400" : ""}
            />
            {errors.principalBusinessActivity && (
                              <p className="text-sm text-red-500 dark:text-red-400">{errors.principalBusinessActivity}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessCode">Principal business code *</Label>
              <Input
                id="businessCode"
                value={formData.businessCode}
                onChange={(e) => handleInputChange("businessCode", e.target.value)}
                className={errors.businessCode ? "border-red-500 dark:border-red-400" : ""}
              />
              {errors.businessCode && <p className="text-sm text-red-500 dark:text-red-400">{errors.businessCode}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <Input
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange("businessAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountingMethod">Accounting method</Label>
              <Select
                value={formData.accountingMethod}
                onValueChange={(value) => handleInputChange("accountingMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="accrual">Accrual</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessStartDate">Business start date (if started this year)</Label>
              <Input
                id="businessStartDate"
                type="date"
                value={formData.businessStartDate}
                onChange={(e) => handleInputChange("businessStartDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="materialParticipation"
                checked={formData.materialParticipation}
                onCheckedChange={(checked) => handleInputChange("materialParticipation", checked as boolean)}
              />
              <Label htmlFor="materialParticipation">
                Did you materially participate in the operation of this business?
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="startedBusiness"
                checked={formData.startedBusiness}
                onCheckedChange={(checked) => handleInputChange("startedBusiness", checked as boolean)}
              />
              <Label htmlFor="startedBusiness">Did you start or acquire this business during the year?</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Part I - Income */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Part I - Income
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossReceipts">Gross receipts or sales *</Label>
              <Input
                id="grossReceipts"
                type="number"
                step="0.01"
                value={formData.grossReceipts}
                onChange={(e) => handleInputChange("grossReceipts", e.target.value)}
                className={errors.grossReceipts ? "border-red-500 dark:border-red-400" : ""}
              />
              {errors.grossReceipts && <p className="text-sm text-red-500 dark:text-red-400">{errors.grossReceipts}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnsAllowances">Returns and allowances</Label>
              <Input
                id="returnsAllowances"
                type="number"
                step="0.01"
                value={formData.returnsAllowances}
                onChange={(e) => handleInputChange("returnsAllowances", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherIncome">Other income</Label>
              <Input
                id="otherIncome"
                type="number"
                step="0.01"
                value={formData.otherIncome}
                onChange={(e) => handleInputChange("otherIncome", e.target.value)}
              />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold">Gross Income: ${grossIncome.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Part II - Expenses */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Part II - Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "advertising", label: "Advertising" },
              { id: "carTruckExpenses", label: "Car and truck expenses" },
              { id: "commissionsAndFees", label: "Commissions and fees" },
              { id: "contractLabor", label: "Contract labor" },
              { id: "depletion", label: "Depletion" },
              { id: "depreciation", label: "Depreciation" },
              { id: "employeeBenefitPrograms", label: "Employee benefit programs" },
              { id: "insurance", label: "Insurance (other than health)" },
              { id: "interestMortgage", label: "Interest (mortgage)" },
              { id: "interestOther", label: "Interest (other)" },
              { id: "legalProfessionalServices", label: "Legal and professional services" },
              { id: "officeExpense", label: "Office expense" },
              { id: "pensionProfitSharing", label: "Pension and profit-sharing plans" },
              { id: "rentLeaseVehicles", label: "Rent or lease (vehicles)" },
              { id: "rentLeaseMachinery", label: "Rent or lease (machinery and equipment)" },
              { id: "rentLeaseOther", label: "Rent or lease (other)" },
              { id: "repairsMaintenance", label: "Repairs and maintenance" },
              { id: "supplies", label: "Supplies" },
              { id: "taxesLicenses", label: "Taxes and licenses" },
              { id: "travel", label: "Travel" },
              { id: "deductibleMeals", label: "Deductible meals" },
              { id: "utilities", label: "Utilities" },
              { id: "wages", label: "Wages" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type="number"
                  step="0.01"
                  value={formData[field.id as keyof ScheduleCFormData] as string}
                  onChange={(e) => handleInputChange(field.id as keyof ScheduleCFormData, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Part V - Other Expenses */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Part V - Other Expenses (up to 10 entries)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`otherExpense${index}Desc`}>Description {index}</Label>
                <Input
                  id={`otherExpense${index}Desc`}
                  value={formData[`otherExpense${index}Desc` as keyof ScheduleCFormData] as string}
                  onChange={(e) => handleInputChange(`otherExpense${index}Desc` as keyof ScheduleCFormData, e.target.value)}
                  placeholder="Expense description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`otherExpense${index}Amount`}>Amount {index}</Label>
                <Input
                  id={`otherExpense${index}Amount`}
                  type="number"
                  step="0.01"
                  value={formData[`otherExpense${index}Amount` as keyof ScheduleCFormData] as string}
                  onChange={(e) => handleInputChange(`otherExpense${index}Amount` as keyof ScheduleCFormData, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Part IV - Information on Your Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicleUsed"
              checked={formData.vehicleUsed}
              onCheckedChange={(checked) => handleInputChange("vehicleUsed", checked as boolean)}
            />
            <Label htmlFor="vehicleUsed">Did you use your vehicle for business purposes?</Label>
          </div>

          {formData.vehicleUsed && (
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMiles">Total miles</Label>
                  <Input
                    id="totalMiles"
                    type="number"
                    value={formData.totalMiles}
                    onChange={(e) => handleInputChange("totalMiles", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessMiles">Business miles</Label>
                  <Input
                    id="businessMiles"
                    type="number"
                    value={formData.businessMiles}
                    onChange={(e) => handleInputChange("businessMiles", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commutingMiles">Commuting miles</Label>
                  <Input
                    id="commutingMiles"
                    type="number"
                    value={formData.commutingMiles}
                    onChange={(e) => handleInputChange("commutingMiles", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherPersonalMiles">Other personal miles</Label>
                  <Input
                    id="otherPersonalMiles"
                    type="number"
                    value={formData.otherPersonalMiles}
                    onChange={(e) => handleInputChange("otherPersonalMiles", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableForPersonalUse">Available for personal use</Label>
                  <Input
                    id="availableForPersonalUse"
                    value={formData.availableForPersonalUse}
                    onChange={(e) => handleInputChange("availableForPersonalUse", e.target.value)}
                    placeholder="Yes/No"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evidenceToSupportDeduction">Evidence to support deduction</Label>
                  <Input
                    id="evidenceToSupportDeduction"
                    value={formData.evidenceToSupportDeduction}
                    onChange={(e) => handleInputChange("evidenceToSupportDeduction", e.target.value)}
                    placeholder="Yes/No"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evidenceWritten">Evidence written</Label>
                  <Input
                    id="evidenceWritten"
                    value={formData.evidenceWritten}
                    onChange={(e) => handleInputChange("evidenceWritten", e.target.value)}
                    placeholder="Yes/No"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-lg">
            <span>Gross Income:</span>
            <span className="font-semibold">${grossIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Total Expenses:</span>
            <span className="font-semibold">${totalExpenses.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-xl font-bold">
            <span>Net Profit (Loss):</span>
            <span className={netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>${netProfit.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="submit"
              disabled={isLoading || connectionStatus !== "connected"}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Schedule C Report
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
            * Required fields. Make sure the backend server is running and connected.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
