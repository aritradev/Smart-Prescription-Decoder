export type UnitType = 
  | "tablet" 
  | "capsule" 
  | "syrup" 
  | "drop" 
  | "inhaler" 
  | "injection" 
  | "other";

export interface AlternativeMedicine {
  brandName: string | null;
  genericName: string | null;
  manufacturer: string | null;
  unitPrice: string | null;
  unitPriceValue: number | null;
  stripPrice: string | null;
  stripPriceValue: number | null;
  tabletsPerStrip: number | null;
  type: "best" | "cheaper" | null;
}

export interface PrescribedMedicine {
  brandName: string;
  genericName: string | null;
  manufacturer: string | null;
  unit: UnitType;

  // Dosage & Schedule
  dosage: string;
  tabletsPerDose: number | null;
  frequency: string;
  frequencyPerDay: number | null;
  duration: string;
  durationDays: number | null;

  // Pricing
  unitPrice: string | null;
  unitPriceValue: number | null;
  stripPrice: string | null;
  stripPriceValue: number | null;
  tabletsPerStrip: number | null;

  // Clinical info
  sideEffects: string[];
  doctorNotes: string | null;

  // Exactly 3 alternatives
  alternatives: AlternativeMedicine[];
}

export interface DoctorInfo {
  name: string | null;
  specialization: string | null;
  chamber: string | null;
  date: string | null;
}

export interface PatientInfo {
  name: string | null;
  age: string | null;
  gender: string | null;
}

export interface PrescriptionDecodeResult {
  doctorInfo: DoctorInfo;
  patientInfo: PatientInfo;
  medicines: PrescribedMedicine[];
  generalInstructions: string | null;
}

export interface DecodeApiResponse {
  success: boolean;
  data?: PrescriptionDecodeResult;
  error?: string;
  isRateLimited?: boolean;
  cooldownSeconds?: number;
  unreadable?: boolean;
}
