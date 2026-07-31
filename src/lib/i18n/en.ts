export const en = {
  // Navigation & Header
  appTitle: 'Smart Rx Decoder',
  appSubtitle: 'AI Prescription Intelligence · Medex.bd Grounded',
  history: 'History',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  language: 'English',
  toggleLanguage: 'বাংলা',

  // Hero Section
  heroTitlePrefix: 'Read Any Medical Rx & Find',
  heroTitleSuffix: 'Live BDT Prices & Alternatives',
  heroSubtitle: 'Snap or upload handwritten doctor prescriptions. Instant AI OCR extracts medications, dosages, live Bangladeshi market pricing, and cheaper generic alternatives.',
  freeBadge: '100% Free Gemini AI',
  groundingBadge: 'Medex.com.bd Real-Time Search',
  privateBadge: 'Private & Serverless',

  // Upload Zone
  uploadTitle: 'Upload Prescription Photo',
  uploadSubtitle: 'Drag & drop your handwritten medical prescription, or click to browse. Supports JPG, PNG, WEBP up to 10MB.',
  chooseFile: 'Choose File',
  useCamera: 'Use Camera',
  changeImage: 'Change Image',
  decodeRx: 'Decode Prescription',
  analyzingRx: 'Analyzing Rx...',

  // Results & Medication
  prescribingDoctor: 'Prescribing Doctor',
  patientInformation: 'Patient Information',
  age: 'Age',
  gender: 'Gender',
  date: 'Date',
  foundMedicines: 'Found {count} Medicine(s) Decoded',
  generic: 'Generic',
  perUnit: 'per {unit}',
  strip: 'Strip',
  dosage: 'Dosage',
  frequency: 'Frequency',
  duration: 'Duration',
  doctorInstruction: 'Doctor Instruction',
  commonSideEffects: 'Common Side Effects',
  alternatives: 'Generic & Brand Alternatives',
  bestMatch: 'Best Match',
  cheapestOption: 'Cheapest Option',
  savePercentage: 'Save ~{percent}%',
  decodeAnother: 'Decode Another Rx',
  doctorAdvice: 'General Doctor Advice & Instructions',

  // Cost Calculator
  costEstimateTitle: 'Total Treatment Cost Estimate',
  perMedicineBreakdown: 'Per-Medicine Cost Breakdown',
  fullDurationAsPrescribed: 'Full Duration Total (as prescribed)',
  plan7Day: 'Standard 7-Day Treatment Cost',
  plan30Day: 'Standard 30-Day Monthly Cost',
  calculableDaily: '{dailyDose} units/day · {dailyCost} / day',
  fullDurationCalculated: '{cost} total ({days} days)',
  costNotAvailable: 'Cannot calculate',
  costExclusionsWarning: 'Note: Non-tablet dosage forms (syrups/drops) or unpriced items are excluded from totals.',

  // Actions
  printPdf: 'Print / Save PDF',
  copyText: 'Copy Summary',
  share: 'Share',
  copiedSuccess: 'Prescription summary copied to clipboard!',
};

export type TranslationKeys = keyof typeof en;
