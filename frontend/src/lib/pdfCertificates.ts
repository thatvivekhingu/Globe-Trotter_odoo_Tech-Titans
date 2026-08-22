import { jsPDF } from 'jspdf'

interface InsurancePdfData {
  policyNumber: string
  travelerName: string
  passportNumber: string
  destination: string
  startDate: string
  endDate: string
  planTitle: string
  coverageAmount: string
  premiumPaid: number
  partner: string
}

interface VisaPdfData {
  applicationRef: string
  applicantName: string
  passportNumber: string
  destinationCountry: string
  visaType: string
  validity: string
  guaranteedDelivery: string
  submissionDate: string
}

export function downloadInsuranceCertificate(data: InsurancePdfData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Header Banner
  doc.setFillColor(15, 23, 42) // Dark slate
  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(180, 240, 86) // Lime accent
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('GLOBETROTTER TRAVEL SAAS', 15, 18)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('EMBASSY-COMPLIANT INTERNATIONAL TRAVEL & MEDICAL INSURANCE CERTIFICATE', 15, 26)

  // Policy Reference Box
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(15, 42, 180, 24, 3, 3, 'F')

  doc.setTextColor(79, 70, 229)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`POLICY NUMBER: ${data.policyNumber}`, 20, 52)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Issued by: ${data.partner} | IRDAI Reg: TATTGOP25046V032425 | 100% Cashless Worldwide`, 20, 60)

  // Section 1: Insured Traveler Details
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Insured Traveler & Trip Details', 15, 76)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)

  doc.text(`Primary Insured: ${data.travelerName}`, 15, 84)
  doc.text(`Passport Number: ${data.passportNumber}`, 110, 84)

  doc.text(`Destination Country: ${data.destination}`, 15, 92)
  doc.text(`Coverage Period: ${data.startDate} to ${data.endDate}`, 110, 92)

  doc.text(`Plan Selected: ${data.planTitle}`, 15, 100)
  doc.text(`Total Premium Paid: INR ${data.premiumPaid.toLocaleString('en-IN')}`, 110, 100)

  // Section 2: Coverage Schedule Table
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Schedule of Medical & Travel Benefits', 15, 115)

  doc.setFillColor(79, 70, 229)
  doc.rect(15, 120, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('COVERAGE SECTION', 20, 125)
  doc.text('SUM INSURED LIMIT', 120, 125)
  doc.text('DEDUCTIBLE', 165, 125)

  const rows = [
    ['Emergency Medical Hospitalization & ICU', data.coverageAmount, 'NIL ($0)'],
    ['Emergency Medical Evacuation & Repatriation', 'Up to $100,000', 'NIL ($0)'],
    ['Loss of Checked-in Baggage', 'Up to INR 65,000', 'NIL'],
    ['Flight Delay Compensation (>1 hour)', 'Flat INR 3,500', 'NIL'],
    ['Passport & Travel Documents Replacement', 'Up to INR 15,000', 'NIL'],
    ['Trip Cancellation / Curtailment', 'Up to INR 1,50,000', 'NIL'],
    ['Personal Liability & Legal Bail Support', 'Up to $50,000', '$100'],
  ]

  let y = 135
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 41, 59)
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y - 5, 180, 7, 'F')
    }
    doc.text(row[0], 20, y)
    doc.text(row[1], 120, y)
    doc.text(row[2], 165, y)
    y += 8
  })

  // Section 3: 24/7 Global Assistance & Claim Process
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Worldwide Cashless Claims Assistance', 15, y + 10)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('• 24x7 Toll-Free International Helpline: +1-800-266-7780 / +91-22-6693-8000', 15, y + 18)
  doc.text('• Cashless Network: Present this digital/printed certificate at 5,000+ partner hospitals globally.', 15, y + 24)
  doc.text('• Email Claims: claims@globetrotter-travel.com | Policy Status: ACTIVE & EMBASSY CERTIFIED', 15, y + 30)

  // Official Signature / Stamp Box
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(15, y + 38, 85, 22, 2, 2, 'D')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('DIGITAL EMBASSY COMPLIANCE SEAL', 20, y + 44)
  doc.setTextColor(16, 185, 129)
  doc.setFont('helvetica', 'bold')
  doc.text('VERIFIED AUTHENTIC BY GLOBETROTTER', 20, y + 52)

  doc.roundedRect(110, y + 38, 85, 22, 2, 2, 'D')
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('AUTHORIZED SIGNATORY', 115, y + 44)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('Chief Underwriter, Tata AIG Group', 115, y + 52)

  // Save PDF
  doc.save(`GlobeTrotter_Travel_Insurance_${data.policyNumber}.pdf`)
}

export function downloadVisaApplicationPass(data: VisaPdfData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Header Banner
  doc.setFillColor(16, 185, 129) // Emerald
  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('OFFICIAL e-VISA APPLICATION SUMMARY', 15, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('ATLYS & GLOBETROTTER IMMIGRATION GATEWAY • EMBASSY VERIFIED', 15, 26)

  // Reference Code Banner
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(15, 42, 180, 22, 3, 3, 'F')

  doc.setTextColor(4, 120, 87)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`APPLICATION REFERENCE: ${data.applicationRef}`, 20, 52)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Destination: ${data.destinationCountry} | Type: ${data.visaType} (${data.validity}) | Status: PROCESSING`, 20, 59)

  // Applicant Table
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Applicant & Travel Passport Credentials', 15, 75)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)

  doc.text(`Applicant Name: ${data.applicantName}`, 15, 84)
  doc.text(`Passport Number: ${data.passportNumber}`, 110, 84)

  doc.text(`Country of Issue: Republic of India`, 15, 92)
  doc.text(`Submission Date: ${data.submissionDate}`, 110, 92)

  doc.text(`Guaranteed e-Visa Date: ${data.guaranteedDelivery}`, 15, 100)
  doc.text(`Port of Entry: All International Air & Sea Ports`, 110, 100)

  // Instructions
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(15, 115, 180, 60, 3, 3, 'F')

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Important Instructions for Boarding & Immigration:', 20, 125)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('1. Carry a printed copy of this confirmation along with your original Indian Passport.', 20, 133)
  doc.text('2. Ensure your passport has at least 6 months validity remaining from the date of arrival.', 20, 140)
  doc.text('3. Keep your return flight ticket and hotel reservation confirmation ready for immigration officers.', 20, 147)
  doc.text('4. In case of any immigration inquiries, contact our 24x7 Visa Desk: +91-11-4928-1000.', 20, 154)
  doc.text('5. Guaranteed On-Time Delivery Guarantee backed by Atlys & GlobeTrotter.', 20, 161)

  // Save PDF
  doc.save(`GlobeTrotter_Visa_Pass_${data.applicationRef}.pdf`)
}
