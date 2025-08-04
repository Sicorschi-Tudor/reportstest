import logging
import os
import tempfile
from pathlib import Path
from typing import Dict
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Tax Form Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from pdfrw import PdfReader, PdfWriter, PdfDict
    PDF_LIBRARY_AVAILABLE = True
    logger.info("pdfrw library loaded successfully")
except ImportError:
    PDF_LIBRARY_AVAILABLE = False

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
    logger.info("reportlab library loaded successfully")
except ImportError:
    REPORTLAB_AVAILABLE = False

class FormType(str, Enum):
    SCHEDULE_C = "schedule_c"
    SCHEDULE_E = "schedule_e"

class ScheduleCData(BaseModel):
    # Personal Information
    name: str
    ssn: str
    
    # Business Information
    principalBusinessActivity: str
    businessCode: str
    businessName: str
    businessAddress: str
    city: str
    state: str
    zipCode: str
    accountingMethod: str
    materialParticipation: bool
    startedBusiness: bool
    businessStartDate: str
    additionalBusinessInfo: str = ""
    
    # Part I - Income
    grossReceipts: str
    returnsAllowances: str
    otherIncome: str
    
    # Part II - Expenses
    advertising: str
    carTruckExpenses: str
    commissionsAndFees: str
    contractLabor: str
    depletion: str
    depreciation: str
    employeeBenefitPrograms: str
    insurance: str
    interestMortgage: str
    interestOther: str
    legalProfessionalServices: str
    officeExpense: str
    pensionProfitSharing: str
    rentLeaseVehicles: str
    rentLeaseMachinery: str
    rentLeaseOther: str
    repairsMaintenance: str
    supplies: str
    taxesLicenses: str
    travel: str
    deductibleMeals: str
    utilities: str
    wages: str
    
    # Part IV - Vehicle Information
    vehicleUsed: bool = False
    vehicleMakeModel: str = ""
    vehicleYear: str = ""
    totalMiles: str = ""
    businessMiles: str = ""
    commutingMiles: str = ""
    otherPersonalMiles: str = ""
    availableForPersonalUse: str = ""
    evidenceToSupportDeduction: str = ""
    evidenceWritten: str = ""
    
    # Part V - Other Expenses (up to 10 entries)
    otherExpense1Desc: str = ""
    otherExpense1Amount: str = ""
    otherExpense2Desc: str = ""
    otherExpense2Amount: str = ""
    otherExpense3Desc: str = ""
    otherExpense3Amount: str = ""
    otherExpense4Desc: str = ""
    otherExpense4Amount: str = ""
    otherExpense5Desc: str = ""
    otherExpense5Amount: str = ""
    otherExpense6Desc: str = ""
    otherExpense6Amount: str = ""
    otherExpense7Desc: str = ""
    otherExpense7Amount: str = ""
    otherExpense8Desc: str = ""
    otherExpense8Amount: str = ""
    otherExpense9Desc: str = ""
    otherExpense9Amount: str = ""
    otherExpense10Desc: str = ""
    otherExpense10Amount: str = ""

class ScheduleEData(BaseModel):
    # Personal Information
    name: str
    ssn: str
    
    # Property Information (up to 3 properties)
    # Property 1
    property1Type: str = ""
    property1Address: str = ""
    property1City: str = ""
    property1State: str = ""
    property1ZipCode: str = ""
    property1RentalDays: str = ""
    property1PersonalDays: str = ""
    property1RentalIncome: str = ""
    property1Royalties: str = ""
    property1OtherIncome: str = ""
    property1Advertising: str = ""
    property1AutoTravel: str = ""
    property1Cleaning: str = ""
    property1Commissions: str = ""
    property1Insurance: str = ""
    property1Legal: str = ""
    property1Management: str = ""
    property1MortgageInterest: str = ""
    property1OtherInterest: str = ""
    property1Repairs: str = ""
    property1Supplies: str = ""
    property1Taxes: str = ""
    property1Utilities: str = ""
    property1Depreciation: str = ""
    
    # Property 2
    property2Type: str = ""
    property2Address: str = ""
    property2City: str = ""
    property2State: str = ""
    property2ZipCode: str = ""
    property2RentalDays: str = ""
    property2PersonalDays: str = ""
    property2RentalIncome: str = ""
    property2Royalties: str = ""
    property2OtherIncome: str = ""
    property2Advertising: str = ""
    property2AutoTravel: str = ""
    property2Cleaning: str = ""
    property2Commissions: str = ""
    property2Insurance: str = ""
    property2Legal: str = ""
    property2Management: str = ""
    property2MortgageInterest: str = ""
    property2OtherInterest: str = ""
    property2Repairs: str = ""
    property2Supplies: str = ""
    property2Taxes: str = ""
    property2Utilities: str = ""
    property2Depreciation: str = ""
    
    # Property 3
    property3Type: str = ""
    property3Address: str = ""
    property3City: str = ""
    property3State: str = ""
    property3ZipCode: str = ""
    property3RentalDays: str = ""
    property3PersonalDays: str = ""
    property3RentalIncome: str = ""
    property3Royalties: str = ""
    property3OtherIncome: str = ""
    property3Advertising: str = ""
    property3AutoTravel: str = ""
    property3Cleaning: str = ""
    property3Commissions: str = ""
    property3Insurance: str = ""
    property3Legal: str = ""
    property3Management: str = ""
    property3MortgageInterest: str = ""
    property3OtherInterest: str = ""
    property3Repairs: str = ""
    property3Supplies: str = ""
    property3Taxes: str = ""
    property3Utilities: str = ""
    property3Depreciation: str = ""

def safe_float(value: str) -> float:
    try:
        return float(value) if value else 0.0
    except (ValueError, TypeError):
        return 0.0

def calculate_schedule_c_totals(data: ScheduleCData) -> Dict[str, float]:
    gross_receipts = safe_float(data.grossReceipts)
    returns_allowances = safe_float(data.returnsAllowances)
    other_income = safe_float(data.otherIncome)
    
    gross_income = gross_receipts - returns_allowances + other_income
    
    expenses = [
        safe_float(data.advertising),
        safe_float(data.carTruckExpenses),
        safe_float(data.commissionsAndFees),
        safe_float(data.contractLabor),
        safe_float(data.depletion),
        safe_float(data.depreciation),
        safe_float(data.employeeBenefitPrograms),
        safe_float(data.insurance),
        safe_float(data.interestMortgage),
        safe_float(data.interestOther),
        safe_float(data.legalProfessionalServices),
        safe_float(data.officeExpense),
        safe_float(data.pensionProfitSharing),
        safe_float(data.rentLeaseVehicles),
        safe_float(data.rentLeaseMachinery),
        safe_float(data.rentLeaseOther),
        safe_float(data.repairsMaintenance),
        safe_float(data.supplies),
        safe_float(data.taxesLicenses),
        safe_float(data.travel),
        safe_float(data.deductibleMeals),
        safe_float(data.utilities),
        safe_float(data.wages)
    ]
    
    other_expenses = [
        safe_float(data.otherExpense1Amount),
        safe_float(data.otherExpense2Amount),
        safe_float(data.otherExpense3Amount),
        safe_float(data.otherExpense4Amount),
        safe_float(data.otherExpense5Amount),
        safe_float(data.otherExpense6Amount),
        safe_float(data.otherExpense7Amount),
        safe_float(data.otherExpense8Amount),
        safe_float(data.otherExpense9Amount),
        safe_float(data.otherExpense10Amount)
    ]
    
    total_expenses = sum(expenses) + sum(other_expenses)
    net_profit = gross_income - total_expenses
    
    return {
        "gross_income": gross_income,
        "total_expenses": total_expenses,
        "net_profit": net_profit
    }

def calculate_schedule_e_totals(data: ScheduleEData) -> Dict[str, float]:
    total_income = 0
    total_expenses = 0
    
    # Calculate totals for each property
    for i in range(1, 4):
        prefix = f"property{i}"
        
        # Income
        rental_income = safe_float(getattr(data, f"{prefix}RentalIncome", "0"))
        royalties = safe_float(getattr(data, f"{prefix}Royalties", "0"))
        other_income = safe_float(getattr(data, f"{prefix}OtherIncome", "0"))
        total_income += rental_income + royalties + other_income
        
        # Expenses
        expenses = [
            safe_float(getattr(data, f"{prefix}Advertising", "0")),
            safe_float(getattr(data, f"{prefix}AutoTravel", "0")),
            safe_float(getattr(data, f"{prefix}Cleaning", "0")),
            safe_float(getattr(data, f"{prefix}Commissions", "0")),
            safe_float(getattr(data, f"{prefix}Insurance", "0")),
            safe_float(getattr(data, f"{prefix}Legal", "0")),
            safe_float(getattr(data, f"{prefix}Management", "0")),
            safe_float(getattr(data, f"{prefix}MortgageInterest", "0")),
            safe_float(getattr(data, f"{prefix}OtherInterest", "0")),
            safe_float(getattr(data, f"{prefix}Repairs", "0")),
            safe_float(getattr(data, f"{prefix}Supplies", "0")),
            safe_float(getattr(data, f"{prefix}Taxes", "0")),
            safe_float(getattr(data, f"{prefix}Utilities", "0")),
            safe_float(getattr(data, f"{prefix}Depreciation", "0"))
        ]
        total_expenses += sum(expenses)
    
    net_income = total_income - total_expenses
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": net_income
    }

def create_schedule_c_fallback_pdf(data: ScheduleCData, output_path: str) -> bool:
    if not REPORTLAB_AVAILABLE:
        return False
    
    try:
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        y_position = height - 50
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, "Schedule C - Profit or Loss From Business")
        y_position -= 30
        
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, f"Name: {data.name}")
        y_position -= 20
        c.drawString(50, y_position, f"SSN: {data.ssn}")
        y_position -= 20
        c.drawString(50, y_position, f"Business: {data.businessName}")
        y_position -= 20
        c.drawString(50, y_position, f"Address: {data.businessAddress}, {data.city}, {data.state} {data.zipCode}")
        y_position -= 30
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Income")
        y_position -= 20
        
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, f"Gross Receipts: ${safe_float(data.grossReceipts):,.2f}")
        y_position -= 20
        c.drawString(50, y_position, f"Returns & Allowances: ${safe_float(data.returnsAllowances):,.2f}")
        y_position -= 20
        c.drawString(50, y_position, f"Other Income: ${safe_float(data.otherIncome):,.2f}")
        y_position -= 30
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Expenses")
        y_position -= 20
        
        c.setFont("Helvetica", 12)
        expenses = [
            ("Advertising", data.advertising),
            ("Car & Truck", data.carTruckExpenses),
            ("Commissions", data.commissionsAndFees),
            ("Contract Labor", data.contractLabor),
            ("Depreciation", data.depreciation),
            ("Insurance", data.insurance),
            ("Legal Services", data.legalProfessionalServices),
            ("Office Expense", data.officeExpense),
            ("Rent", data.rentLeaseOther),
            ("Repairs", data.repairsMaintenance),
            ("Supplies", data.supplies),
            ("Travel", data.travel),
            ("Utilities", data.utilities),
            ("Wages", data.wages)
        ]
        
        for expense_name, expense_amount in expenses:
            if safe_float(expense_amount) > 0:
                c.drawString(50, y_position, f"{expense_name}: ${safe_float(expense_amount):,.2f}")
                y_position -= 15
        
        if data.vehicleUsed:
            y_position -= 10
            c.drawString(50, y_position, f"Vehicle: {data.vehicleMakeModel} {data.vehicleYear}")
            y_position -= 15
            c.drawString(50, y_position, f"Business Miles: {data.businessMiles}")
            y_position -= 15
            c.drawString(50, y_position, f"Total Miles: {data.totalMiles}")
        
        other_expenses = [
            (data.otherExpense1Desc, data.otherExpense1Amount),
            (data.otherExpense2Desc, data.otherExpense2Amount),
            (data.otherExpense3Desc, data.otherExpense3Amount),
            (data.otherExpense4Desc, data.otherExpense4Amount),
            (data.otherExpense5Desc, data.otherExpense5Amount),
            (data.otherExpense6Desc, data.otherExpense6Amount),
            (data.otherExpense7Desc, data.otherExpense7Amount),
            (data.otherExpense8Desc, data.otherExpense8Amount),
            (data.otherExpense9Desc, data.otherExpense9Amount),
            (data.otherExpense10Desc, data.otherExpense10Amount)
        ]
        
        for desc, amount in other_expenses:
            if desc and safe_float(amount) > 0:
                y_position -= 10
                c.drawString(50, y_position, f"Other: {desc} - ${safe_float(amount):,.2f}")
                y_position -= 15
        
        totals = calculate_totals(data)
        y_position -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, f"Gross Income: ${totals['gross_income']:,.2f}")
        y_position -= 20
        c.drawString(50, y_position, f"Total Expenses: ${totals['total_expenses']:,.2f}")
        y_position -= 20
        c.drawString(50, y_position, f"Net Profit: ${totals['net_profit']:,.2f}")
        
        c.save()
        return True
    except Exception as e:
        logger.error(f"Error creating fallback PDF: {e}")
        return False

def create_schedule_e_fallback_pdf(data: ScheduleEData, output_path: str) -> bool:
    if not REPORTLAB_AVAILABLE:
        return False
    
    try:
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        y_position = height - 50
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, "Schedule E - Supplemental Income and Loss")
        y_position -= 30
        
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, f"Name: {data.name}")
        y_position -= 20
        c.drawString(50, y_position, f"SSN: {data.ssn}")
        y_position -= 30
        
        # Property information
        for i in range(1, 4):
            prefix = f"property{i}"
            property_type = getattr(data, f"{prefix}Type", "")
            property_address = getattr(data, f"{prefix}Address", "")
            
            if property_type or property_address:
                c.setFont("Helvetica-Bold", 14)
                c.drawString(50, y_position, f"Property {i}")
                y_position -= 20
                
                c.setFont("Helvetica", 12)
                if property_type:
                    c.drawString(50, y_position, f"Type: {property_type}")
                    y_position -= 15
                if property_address:
                    c.drawString(50, y_position, f"Address: {property_address}")
                    y_position -= 15
                
                # Income
                rental_income = safe_float(getattr(data, f"{prefix}RentalIncome", "0"))
                royalties = safe_float(getattr(data, f"{prefix}Royalties", "0"))
                other_income = safe_float(getattr(data, f"{prefix}OtherIncome", "0"))
                
                if rental_income > 0 or royalties > 0 or other_income > 0:
                    c.drawString(50, y_position, "Income:")
                    y_position -= 15
                    if rental_income > 0:
                        c.drawString(70, y_position, f"Rental Income: ${rental_income:,.2f}")
                        y_position -= 15
                    if royalties > 0:
                        c.drawString(70, y_position, f"Royalties: ${royalties:,.2f}")
                        y_position -= 15
                    if other_income > 0:
                        c.drawString(70, y_position, f"Other Income: ${other_income:,.2f}")
                        y_position -= 15
                
                # Expenses
                expenses = [
                    ("Advertising", getattr(data, f"{prefix}Advertising", "0")),
                    ("Auto & Travel", getattr(data, f"{prefix}AutoTravel", "0")),
                    ("Cleaning", getattr(data, f"{prefix}Cleaning", "0")),
                    ("Insurance", getattr(data, f"{prefix}Insurance", "0")),
                    ("Legal", getattr(data, f"{prefix}Legal", "0")),
                    ("Management", getattr(data, f"{prefix}Management", "0")),
                    ("Mortgage Interest", getattr(data, f"{prefix}MortgageInterest", "0")),
                    ("Repairs", getattr(data, f"{prefix}Repairs", "0")),
                    ("Supplies", getattr(data, f"{prefix}Supplies", "0")),
                    ("Taxes", getattr(data, f"{prefix}Taxes", "0")),
                    ("Utilities", getattr(data, f"{prefix}Utilities", "0")),
                    ("Depreciation", getattr(data, f"{prefix}Depreciation", "0"))
                ]
                
                total_expenses = 0
                for expense_name, expense_amount in expenses:
                    amount = safe_float(expense_amount)
                    if amount > 0:
                        total_expenses += amount
                        c.drawString(70, y_position, f"{expense_name}: ${amount:,.2f}")
                        y_position -= 15
                
                if total_expenses > 0:
                    c.drawString(50, y_position, f"Total Expenses: ${total_expenses:,.2f}")
                    y_position -= 20
                
                y_position -= 10
        
        c.save()
        return True
        
    except Exception as e:
        logger.error(f"Error creating Schedule E fallback PDF: {e}")
        return False

def fill_schedule_c_pdf_template(template_path: str, output_path: str, data: ScheduleCData) -> bool:
    if not PDF_LIBRARY_AVAILABLE:
        return create_schedule_c_fallback_pdf(data, output_path)
    
    try:
        template = PdfReader(template_path)
        print("template",template)
       
        output = PdfWriter()

        print("output",output)
        
        field_mappings = {
            '<FEFF00660031005F0031005B0030005D>': data.name,
            '<FEFF00660031005F0032005B0030005D>': data.ssn,
            '<FEFF00660031005F0033005B0030005D>': data.principalBusinessActivity,
            '<FEFF00660031005F0034005B0030005D>': data.businessCode,
            '<FEFF00660031005F0035005B0030005D>': data.businessName,
            '<FEFF00660031005F0036005B0030005D>': data.businessAddress,
            '<FEFF00660031005F0037005B0030005D>': f"{data.city}, {data.state} {data.zipCode}",
            '<FEFF00660031005F0038005B0030005D>': data.businessStartDate,
            '<FEFF00660031005F0039005B0030005D>': data.additionalBusinessInfo,
            '<FEFF00660031005F00310030005B0030005D>': data.grossReceipts,
            '<FEFF00660031005F00310031005B0030005D>': data.returnsAllowances,
            '<FEFF00660031005F00310032005B0030005D>': data.otherIncome,
            '<FEFF00660031005F00310034005B0030005D>': data.advertising,
            '<FEFF00660031005F00310035005B0030005D>': data.carTruckExpenses,
            '<FEFF00660031005F00310036005B0030005D>': data.commissionsAndFees,
            '<FEFF00660031005F00310037005B0030005D>': data.contractLabor,
            '<FEFF00660031005F00310038005B0030005D>': data.depletion,
            '<FEFF00660031005F00310039005B0030005D>': data.depreciation,
            '<FEFF00660031005F00320030005B0030005D>': data.employeeBenefitPrograms,
            '<FEFF00660031005F00320031005B0030005D>': data.insurance,
            '<FEFF00660031005F00320032005B0030005D>': data.interestMortgage,
            '<FEFF00660031005F00320033005B0030005D>': data.interestOther,
            '<FEFF00660031005F00320034005B0030005D>': data.legalProfessionalServices,
            '<FEFF00660031005F00320035005B0030005D>': data.officeExpense,
            '<FEFF00660031005F00320036005B0030005D>': data.pensionProfitSharing,
            '<FEFF00660031005F00320037005B0030005D>': data.rentLeaseVehicles,
            '<FEFF00660031005F00320038005B0030005D>': data.rentLeaseMachinery,
            '<FEFF00660031005F00320039005B0030005D>': data.rentLeaseOther,
            '<FEFF00660031005F00330030005B0030005D>': data.repairsMaintenance,
            '<FEFF00660031005F00330031005B0030005D>': data.supplies,
            '<FEFF00660031005F00330032005B0030005D>': data.taxesLicenses,
            '<FEFF00660031005F00330033005B0030005D>': data.travel,
            '<FEFF00660031005F00330034005B0030005D>': data.deductibleMeals,
            '<FEFF00660031005F00330035005B0030005D>': data.utilities,
            '<FEFF00660031005F00330036005B0030005D>': data.wages,
            '<FEFF00660032005F0031005B0030005D>': data.vehicleMakeModel,
            '<FEFF00660032005F0032005B0030005D>': data.vehicleYear,
            '<FEFF00660032005F0033005B0030005D>': data.totalMiles,
            '<FEFF00660032005F0034005B0030005D>': data.businessMiles,
            '<FEFF00660032005F0035005B0030005D>': data.commutingMiles,
            '<FEFF00660032005F0036005B0030005D>': data.otherPersonalMiles,
            '<FEFF00660032005F0037005B0030005D>': data.availableForPersonalUse,
            '<FEFF00660032005F0038005B0030005D>': data.evidenceToSupportDeduction,
            '<FEFF00660032005F0039005B0030005D>': data.evidenceWritten,
            '<FEFF00660032005F00310035005B0030005D>': data.otherExpense1Desc,
            '<FEFF00660032005F00310036005B0030005D>': data.otherExpense1Amount,
            '<FEFF00660032005F00310037005B0030005D>': data.otherExpense2Desc,
            '<FEFF00660032005F00310038005B0030005D>': data.otherExpense2Amount,
            '<FEFF00660032005F00310039005B0030005D>': data.otherExpense3Desc,
            '<FEFF00660032005F00320030005B0030005D>': data.otherExpense3Amount,
            '<FEFF00660032005F00320031005B0030005D>': data.otherExpense4Desc,
            '<FEFF00660032005F00320032005B0030005D>': data.otherExpense4Amount,
            '<FEFF00660032005F00320033005B0030005D>': data.otherExpense5Desc,
            '<FEFF00660032005F00320034005B0030005D>': data.otherExpense5Amount,
            '<FEFF00660032005F00320035005B0030005D>': data.otherExpense6Desc,
            '<FEFF00660032005F00320036005B0030005D>': data.otherExpense6Amount,
            '<FEFF00660032005F00320037005B0030005D>': data.otherExpense7Desc,
            '<FEFF00660032005F00320038005B0030005D>': data.otherExpense7Amount,
            '<FEFF00660032005F00320039005B0030005D>': data.otherExpense8Desc,
            '<FEFF00660032005F00330030005B0030005D>': data.otherExpense8Amount,
            '<FEFF00660032005F00330031005B0030005D>': data.otherExpense9Desc,
            '<FEFF00660032005F00330032005B0030005D>': data.otherExpense9Amount,
            '<FEFF00660032005F00330033005B0030005D>': data.otherExpense10Desc,
        }
        
        filled_fields = 0
        for page in template.pages:
            if '/Annots' in page:
                for annot in page['/Annots']:
                    if annot['/Subtype'] == '/Widget':
                        field_name = annot['/T']
                        if field_name in field_mappings:
                            value = field_mappings[field_name]
                            if value:
                                annot.update(PdfDict(V=str(value)))
                                filled_fields += 1
        
        output.addpage(template.pages[0])
        if len(template.pages) > 1:
            output.addpage(template.pages[1])
        
        output.write(output_path)
        logger.info(f"Filled {filled_fields} fields in PDF")
        return True
        
    except Exception as e:
        logger.error(f"Error filling PDF template: {e}")
        return create_schedule_c_fallback_pdf(data, output_path)

def fill_schedule_e_pdf_template(template_path: str, output_path: str, data: ScheduleEData) -> bool:
    if not PDF_LIBRARY_AVAILABLE:
        return create_schedule_e_fallback_pdf(data, output_path)
    
    try:
        template = PdfReader(template_path)
        output = PdfWriter()
        
        # Field mappings for Schedule E based on actual PDF field names
        field_mappings = {
            # Personal Information (same as Schedule C)
            '<FEFF00660031005F0031005B0030005D>': data.name,
            '<FEFF00660031005F0032005B0030005D>': data.ssn,
            
            # Property 1 fields (f1_ prefix)
            '<FEFF00660031005F0033005B0030005D>': data.property1Type,
            '<FEFF00660031005F0034005B0030005D>': data.property1Address,
            '<FEFF00660031005F0035005B0030005D>': data.property1City,
            '<FEFF00660031005F0036005B0030005D>': data.property1State,
            '<FEFF00660031005F0037005B0030005D>': data.property1ZipCode,
            '<FEFF00660031005F0038005B0030005D>': data.property1RentalDays,
            '<FEFF00660031005F0039005B0030005D>': data.property1PersonalDays,
            '<FEFF00660031005F00310030005B0030005D>': data.property1RentalIncome,
            '<FEFF00660031005F00310031005B0030005D>': data.property1Royalties,
            '<FEFF00660031005F00310032005B0030005D>': data.property1OtherIncome,
            '<FEFF00660031005F00310033005B0030005D>': data.property1Advertising,
            '<FEFF00660031005F00310034005B0030005D>': data.property1AutoTravel,
            '<FEFF00660031005F00310035005B0030005D>': data.property1Cleaning,
            '<FEFF00660031005F00310036005B0030005D>': data.property1Commissions,
            '<FEFF00660031005F00310037005B0030005D>': data.property1Insurance,
            '<FEFF00660031005F00310038005B0030005D>': data.property1Legal,
            '<FEFF00660031005F00310039005B0030005D>': data.property1Management,
            '<FEFF00660031005F00320030005B0030005D>': data.property1MortgageInterest,
            '<FEFF00660031005F00320031005B0030005D>': data.property1OtherInterest,
            '<FEFF00660031005F00320032005B0030005D>': data.property1Repairs,
            '<FEFF00660031005F00320033005B0030005D>': data.property1Supplies,
            '<FEFF00660031005F00320034005B0030005D>': data.property1Taxes,
            '<FEFF00660031005F00320035005B0030005D>': data.property1Utilities,
            '<FEFF00660031005F00320036005B0030005D>': data.property1Depreciation,
            
            # Property 2 fields (f2_ prefix)
            '<FEFF00660032005F0031005B0030005D>': data.property2Type,
            '<FEFF00660032005F0032005B0030005D>': data.property2Address,
            '<FEFF00660032005F0033005B0030005D>': data.property2City,
            '<FEFF00660032005F0034005B0030005D>': data.property2State,
            '<FEFF00660032005F0035005B0030005D>': data.property2ZipCode,
            '<FEFF00660032005F0036005B0030005D>': data.property2RentalDays,
            '<FEFF00660032005F0037005B0030005D>': data.property2PersonalDays,
            '<FEFF00660032005F0038005B0030005D>': data.property2RentalIncome,
            '<FEFF00660032005F0039005B0030005D>': data.property2Royalties,
            '<FEFF00660032005F00310030005B0030005D>': data.property2OtherIncome,
            '<FEFF00660032005F00310031005B0030005D>': data.property2Advertising,
            '<FEFF00660032005F00310032005B0030005D>': data.property2AutoTravel,
            '<FEFF00660032005F00310033005B0030005D>': data.property2Cleaning,
            '<FEFF00660032005F00310034005B0030005D>': data.property2Commissions,
            '<FEFF00660032005F00310035005B0030005D>': data.property2Insurance,
            '<FEFF00660032005F00310036005B0030005D>': data.property2Legal,
            '<FEFF00660032005F00310037005B0030005D>': data.property2Management,
            '<FEFF00660032005F00310038005B0030005D>': data.property2MortgageInterest,
            '<FEFF00660032005F00310039005B0030005D>': data.property2OtherInterest,
            '<FEFF00660032005F00320030005B0030005D>': data.property2Repairs,
            '<FEFF00660032005F00320031005B0030005D>': data.property2Supplies,
            '<FEFF00660032005F00320032005B0030005D>': data.property2Taxes,
            '<FEFF00660032005F00320033005B0030005D>': data.property2Utilities,
            '<FEFF00660032005F00320034005B0030005D>': data.property2Depreciation,
        }
        
        filled_fields = 0
        for page in template.pages:
            if '/Annots' in page:
                for annot in page['/Annots']:
                    if annot['/Subtype'] == '/Widget':
                        field_name = annot['/T']
                        if field_name in field_mappings:
                            value = field_mappings[field_name]
                            if value:
                                annot.update(PdfDict(V=str(value)))
                                filled_fields += 1
        
        output.addpage(template.pages[0])
        if len(template.pages) > 1:
            output.addpage(template.pages[1])
        
        output.write(output_path)
        logger.info(f"Filled {filled_fields} fields in Schedule E PDF")
        return True
        
    except Exception as e:
        logger.error(f"Error filling Schedule E PDF template: {e}")
        return create_schedule_e_fallback_pdf(data, output_path)

@app.get("/")
async def root():
    return {"message": "Tax Form Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    schedule_c_template = Path(__file__).parent / "f1040sc.pdf"
    schedule_e_template = Path(__file__).parent / "schedule-e.pdf"
    return {
        "status": "healthy",
        "pdf_library": PDF_LIBRARY_AVAILABLE,
        "reportlab": REPORTLAB_AVAILABLE,
        "schedule_c_template_exists": schedule_c_template.exists(),
        "schedule_e_template_exists": schedule_e_template.exists()
    }

@app.post("/generate-schedule-c")
async def generate_schedule_c_pdf(data: ScheduleCData):
    try:
        template_path = Path(__file__).parent / "f1040sc.pdf"
        if not template_path.exists():
            raise HTTPException(status_code=404, detail="Schedule C PDF template not found")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            output_path = tmp_file.name
        
        success = fill_schedule_c_pdf_template(str(template_path), output_path, data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to generate Schedule C PDF")
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="schedule_c_report.pdf",
            background=None
        )
        
    except Exception as e:
        logger.error(f"Error generating Schedule C PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-schedule-e")
async def generate_schedule_e_pdf(data: ScheduleEData):
    try:
        template_path = Path(__file__).parent / "schedule-e.pdf"
        if not template_path.exists():
            raise HTTPException(status_code=404, detail="Schedule E PDF template not found")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            output_path = tmp_file.name
        
        success = fill_schedule_e_pdf_template(str(template_path), output_path, data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to generate Schedule E PDF")
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="schedule_e_report.pdf",
            background=None
        )
        
    except Exception as e:
        logger.error(f"Error generating Schedule E PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Keep the old endpoint for backward compatibility
@app.post("/generate-pdf")
async def generate_pdf(data: ScheduleCData):
    return await generate_schedule_c_pdf(data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
