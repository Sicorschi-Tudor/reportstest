import logging
import os
import tempfile
from pathlib import Path
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Schedule C Generator")

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

def safe_float(value: str) -> float:
    try:
        return float(value) if value else 0.0
    except (ValueError, TypeError):
        return 0.0

def calculate_totals(data: ScheduleCData) -> Dict[str, float]:
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

def create_fallback_pdf(data: ScheduleCData, output_path: str) -> bool:
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

def fill_pdf_template(template_path: str, output_path: str, data: ScheduleCData) -> bool:
    if not PDF_LIBRARY_AVAILABLE:
        return create_fallback_pdf(data, output_path)
    
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
        return create_fallback_pdf(data, output_path)

@app.get("/")
async def root():
    return {"message": "Schedule C Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    template_path = Path(__file__).parent / "f1040sc.pdf"
    return {
        "status": "healthy",
        "pdf_library": PDF_LIBRARY_AVAILABLE,
        "reportlab": REPORTLAB_AVAILABLE,
        "template_exists": template_path.exists()
    }

@app.post("/generate-pdf")
async def generate_pdf(data: ScheduleCData):
    try:
        template_path = Path(__file__).parent / "f1040sc.pdf"
        if not template_path.exists():
            raise HTTPException(status_code=404, detail="PDF template not found")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            output_path = tmp_file.name
        
        success = fill_pdf_template(str(template_path), output_path, data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="schedule_c_report.pdf",
            background=None
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
