export interface MedicineCostInput {
  brandName: string;
  unit: string;
  unitPriceValue: number | null;
  tabletsPerDose: number | null;
  frequencyPerDay: number | null;
  durationDays: number | null;
}

export interface MedicineCostResult {
  brandName: string;
  unit: string;
  dailyDose: number | null;
  dailyCost: number | null;
  fullDurationCost: number | null;
  cost7Day: number | null;
  cost30Day: number | null;
  isCalculable: boolean;
  reason: string | null;
}

export interface TreatmentCostSummaryData {
  perMedicine: MedicineCostResult[];
  totals: {
    fullDuration: number | null;
    fullDurationPartial: number;
    plan7Day: number | null;
    plan30Day: number | null;
  };
  warnings: string[];
}

const NON_TABLET_UNITS = ['syrup', 'drop', 'inhaler', 'injection', 'other', 'cream', 'ointment', 'gel', 'spray', 'lotion'];

function notCalculable(brandName: string, unit: string, reason: string): MedicineCostResult {
  return {
    brandName,
    unit: unit || 'other',
    dailyDose: null,
    dailyCost: null,
    fullDurationCost: null,
    cost7Day: null,
    cost30Day: null,
    isCalculable: false,
    reason,
  };
}

export function calculateMedicineCost(med: MedicineCostInput): MedicineCostResult {
  const unitStr = (med.unit || 'other').toLowerCase();

  // CHECK 1: Missing or invalid price
  if (med.unitPriceValue === null || med.unitPriceValue === undefined || med.unitPriceValue <= 0) {
    return notCalculable(med.brandName, med.unit, 'Price unavailable');
  }

  const isNonTablet = NON_TABLET_UNITS.includes(unitStr);

  // NON-TABLET UNIT HANDLING (Creams, Ointments, Syrups, Drops, Inhalers, Injections, Other)
  // When unitPriceValue is known, 1 unit (tube/bottle/pack) is calculated
  if (isNonTablet) {
    const packCost = parseFloat(med.unitPriceValue.toFixed(2));
    const duration = med.durationDays && med.durationDays > 0 ? med.durationDays : 1;
    const dailyEst = parseFloat((packCost / duration).toFixed(2));

    return {
      brandName: med.brandName || 'Medication',
      unit: med.unit || 'other',
      dailyDose: med.frequencyPerDay ? med.frequencyPerDay * (med.tabletsPerDose || 1) : 1,
      dailyCost: dailyEst > 0 ? dailyEst : packCost,
      fullDurationCost: packCost,
      cost7Day: packCost,
      cost30Day: packCost,
      isCalculable: true,
      reason: `Fixed unit price (1 ${med.unit || 'pack'})`,
    };
  }

  // TABLET & CAPSULE CALCULATIONS
  // CHECK 2: SOS / as-needed frequency
  if (med.frequencyPerDay === null || med.frequencyPerDay === undefined) {
    return notCalculable(med.brandName, med.unit, 'Taken as needed (SOS)');
  }

  // CHECK 3: Invalid frequency value
  if (med.frequencyPerDay <= 0) {
    return notCalculable(med.brandName, med.unit, 'Invalid daily frequency');
  }

  const tabletsPerDose =
    med.tabletsPerDose !== null && med.tabletsPerDose !== undefined && med.tabletsPerDose > 0
      ? med.tabletsPerDose
      : 1;
  const usedFallback = med.tabletsPerDose === null || med.tabletsPerDose === undefined;

  const dailyDose = tabletsPerDose * med.frequencyPerDay;
  const dailyCost = parseFloat((dailyDose * med.unitPriceValue).toFixed(2));

  const fullDurationCost =
    med.durationDays !== null && med.durationDays !== undefined && med.durationDays > 0
      ? parseFloat((dailyCost * med.durationDays).toFixed(2))
      : dailyCost;

  return {
    brandName: med.brandName || 'Medication',
    unit: med.unit || 'tablet',
    dailyDose,
    dailyCost,
    fullDurationCost,
    cost7Day: parseFloat((dailyCost * 7).toFixed(2)),
    cost30Day: parseFloat((dailyCost * 30).toFixed(2)),
    isCalculable: true,
    reason: usedFallback ? 'Dose assumed as 1 unit' : null,
  };
}

export function calculateTreatmentCost(medicines: MedicineCostInput[]): TreatmentCostSummaryData {
  if (!medicines || medicines.length === 0) {
    return {
      perMedicine: [],
      totals: { fullDuration: 0, fullDurationPartial: 0, plan7Day: 0, plan30Day: 0 },
      warnings: [],
    };
  }

  const perMedicine = medicines.map(calculateMedicineCost);
  const calculable = perMedicine.filter((r) => r.isCalculable);
  const excluded = perMedicine.filter((r) => !r.isCalculable);

  if (calculable.length === 0) {
    return {
      perMedicine,
      totals: { fullDuration: null, fullDurationPartial: 0, plan7Day: null, plan30Day: null },
      warnings: ['No medicines could be calculated for cost totals. Prices or unit values are unavailable.'],
    };
  }

  const warnings: string[] = [];
  if (excluded.length > 0) {
    warnings.push(
      `${excluded.length} medicine(s) excluded from calculation: ${excluded
        .map((e) => `${e.brandName} (${e.reason})`)
        .join(', ')}`
    );
  }

  const fullDurationValues = calculable.map((r) => r.fullDurationCost);
  const hasNullDuration = fullDurationValues.some((v) => v === null);
  const fullDurationPartial = fullDurationValues
    .filter((v): v is number => v !== null)
    .reduce((a, b) => a + b, 0);

  return {
    perMedicine,
    totals: {
      fullDuration: hasNullDuration ? null : parseFloat(fullDurationPartial.toFixed(2)),
      fullDurationPartial: parseFloat(fullDurationPartial.toFixed(2)),
      plan7Day: parseFloat(calculable.reduce((a, r) => a + (r.cost7Day ?? 0), 0).toFixed(2)),
      plan30Day: parseFloat(calculable.reduce((a, r) => a + (r.cost30Day ?? 0), 0).toFixed(2)),
    },
    warnings,
  };
}
