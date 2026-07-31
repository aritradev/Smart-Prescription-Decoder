'use client';

import React from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { PrescribedMedicine } from '@/types/prescription';
import { calculateTreatmentCost, MedicineCostInput } from '@/lib/costCalculator';
import { useLanguage } from '@/context/LanguageContext';

interface TreatmentCostSummaryProps {
  medicines: PrescribedMedicine[];
}

export default function TreatmentCostSummary({ medicines }: TreatmentCostSummaryProps) {
  const { t } = useLanguage();

  const costInputs: MedicineCostInput[] = medicines.map((med) => ({
    brandName: med.brandName,
    unit: med.unit,
    unitPriceValue: med.unitPriceValue,
    tabletsPerDose: med.tabletsPerDose,
    frequencyPerDay: med.frequencyPerDay,
    durationDays: med.durationDays,
  }));

  const summary = calculateTreatmentCost(costInputs);

  return (
    <div className="w-full glass-panel rounded-2xl p-5 sm:p-6 border border-brand-teal/20 bg-surface-100/60 backdrop-blur-xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chestnut-600/20 dark:border-gray-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground leading-none">
              {t('costEstimateTitle')}
            </h3>
            <p className="text-[11px] text-foreground/60 pt-0.5 font-medium">
              Calculated based on Medex.bd unit prices &amp; prescribed schedules
            </p>
          </div>
        </div>
      </div>

      {/* Per Medicine Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">
          {t('perMedicineBreakdown')}
        </h4>

        <div className="divide-y divide-chestnut-600/20 dark:divide-gray-800/80 rounded-xl border border-chestnut-600/20 dark:border-gray-800/80 bg-surface-200/50 overflow-hidden text-xs">
          {summary.perMedicine.map((medCost, index) => (
            <div key={index} className="p-3 flex flex-wrap items-center justify-between gap-2 hover:bg-surface-300/30 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">{medCost.brandName}</span>
                {medCost.isCalculable ? (
                  <span className="text-foreground/60 text-[11px]">
                    {medCost.reason?.includes('Fixed unit price')
                      ? `1 ${medCost.unit || 'pack'} · Unit Price: ৳ ${(medCost.fullDurationCost ?? 0).toFixed(2)}`
                      : t('calculableDaily', {
                          dailyDose: medCost.dailyDose ?? 1,
                          dailyCost: `৳ ${(medCost.dailyCost ?? 0).toFixed(2)}`,
                        })}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400/90 text-[11px] italic">
                    ⚠️ {medCost.reason}
                  </span>
                )}
              </div>

              <div className="text-right">
                {medCost.isCalculable ? (
                  <div>
                    <span className="font-extrabold text-foreground text-sm">
                      ৳ {(medCost.fullDurationCost ?? medCost.dailyCost ?? 0).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-brand-teal font-semibold">
                      {medCost.reason?.includes('Fixed unit price')
                        ? `Fixed 1 ${medCost.unit || 'unit'}`
                        : `৳ ${(medCost.dailyCost ?? 0).toFixed(2)} / day`}
                    </span>
                  </div>
                ) : (
                  <span className="text-foreground/40 font-semibold italic">N/A</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        
        {/* Full Prescribed Duration */}
        <div className="p-3.5 rounded-xl bg-brand-teal/10 border border-brand-teal/30 space-y-1">
          <span className="text-[10px] font-bold text-foreground/60 block uppercase tracking-wider">
            {t('fullDurationAsPrescribed')}
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-brand-teal">
            {summary.totals.fullDuration !== null
              ? `৳ ${summary.totals.fullDuration.toFixed(2)}`
              : summary.totals.fullDurationPartial > 0
              ? `৳ ${summary.totals.fullDurationPartial.toFixed(2)}*`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-foreground/60">
            {summary.totals.fullDuration !== null ? 'Exact total' : 'Partial estimate'}
          </span>
        </div>

        {/* 7-Day Plan */}
        <div className="p-3.5 rounded-xl bg-surface-200/80 border border-chestnut-600/20 dark:border-gray-800/80 space-y-1">
          <span className="text-[10px] font-bold text-foreground/60 block uppercase tracking-wider">
            {t('plan7Day')}
          </span>
          <div className="text-lg font-bold text-foreground">
            {summary.totals.plan7Day !== null
              ? `৳ ${summary.totals.plan7Day.toFixed(2)}`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-foreground/60">Standard 7-day supply</span>
        </div>

        {/* 30-Day Plan */}
        <div className="p-3.5 rounded-xl bg-surface-200/80 border border-chestnut-600/20 dark:border-gray-800/80 space-y-1">
          <span className="text-[10px] font-bold text-foreground/60 block uppercase tracking-wider">
            {t('plan30Day')}
          </span>
          <div className="text-lg font-bold text-foreground">
            {summary.totals.plan30Day !== null
              ? `৳ ${summary.totals.plan30Day.toFixed(2)}`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-foreground/60">Monthly supply estimate</span>
        </div>

      </div>

      {/* Warnings & Exclusions Banners */}
      {summary.warnings.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {summary.warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
