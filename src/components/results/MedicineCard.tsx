'use client';

import React from 'react';
import { Pill, Clock, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { PrescribedMedicine } from '@/types/prescription';
import AlternativesAccordion from './AlternativesAccordion';

interface MedicineCardProps {
  medicine: PrescribedMedicine;
  index: number;
  onSwapMedicine?: (currentBrandName: string, newBrand: any) => void;
}

/**
 * Formats frequency shorthand like 1-0-1, 0-0-1, 1-1-1 into human readable Morning (সকাল), Night (রাত) explanations
 */
function formatFrequencyWithExplanation(freq: string): { display: string; detail?: string } {
  if (!freq) return { display: 'As directed' };

  const cleaned = freq.trim();

  if (cleaned.includes('1-0-1')) {
    return { display: '1-0-1', detail: 'Morning & Night (সকাল ও রাত)' };
  }
  if (cleaned.includes('0-0-1')) {
    return { display: '0-0-1', detail: 'Night only (শুধুমাত্র রাত)' };
  }
  if (cleaned.includes('1-1-1')) {
    return { display: '1-1-1', detail: 'Morning, Afternoon & Night (সকাল, দুপুর ও রাত)' };
  }
  if (cleaned.includes('1-0-0')) {
    return { display: '1-0-0', detail: 'Morning only (শুধুমাত্র সকাল)' };
  }
  if (cleaned.includes('0-1-0')) {
    return { display: '0-1-0', detail: 'Afternoon only (শুধুমাত্র দুপুর)' };
  }
  if (cleaned.includes('1-1-0')) {
    return { display: '1-1-0', detail: 'Morning & Afternoon (সকাল ও দুপুর)' };
  }
  if (cleaned.includes('0-1-1')) {
    return { display: '0-1-1', detail: 'Afternoon & Night (দুপুর ও রাত)' };
  }

  const lower = cleaned.toLowerCase();
  if (lower.includes('b.d') || lower.includes('bd')) {
    return { display: cleaned, detail: '2 times daily (সকাল ও রাত)' };
  }
  if (lower.includes('t.d.s') || lower.includes('tds')) {
    return { display: cleaned, detail: '3 times daily (সকাল, দুপুর ও রাত)' };
  }
  if (lower.includes('o.d') || lower.includes('od')) {
    return { display: cleaned, detail: '1 time daily (প্রতিদিন ১ বার)' };
  }
  if (lower.includes('q.i.d') || lower.includes('qid')) {
    return { display: cleaned, detail: '4 times daily (প্রতিদিন ৪ বার)' };
  }
  if (lower.includes('s.o.s') || lower.includes('sos')) {
    return { display: cleaned, detail: 'As needed (প্রয়োজন হলে)' };
  }

  return { display: cleaned };
}

export default function MedicineCard({ medicine, index, onSwapMedicine }: MedicineCardProps) {
  const unitBadgeColorMap: Record<string, string> = {
    tablet: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    capsule: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
    syrup: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    drop: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    inhaler: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
    injection: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    other: 'bg-surface-200 text-foreground/80 border-chestnut-600/20 dark:border-gray-800/80',
  };

  const badgeStyle = unitBadgeColorMap[medicine.unit] || unitBadgeColorMap.other;
  const freqInfo = formatFrequencyWithExplanation(medicine.frequency);

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-chestnut-600/20 dark:border-gray-800/80 hover:border-brand-teal/30 bg-surface-100/60 backdrop-blur-xl transition-all duration-200 space-y-4 shadow-lg">
      
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal font-extrabold text-xs shrink-0">
            #{index + 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight leading-none">
                {medicine.brandName}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold capitalize ${badgeStyle}`}>
                {medicine.unit}
              </span>
            </div>

            {medicine.genericName && (
              <p className="text-xs text-foreground/60 font-medium mt-1">
                Generic: <span className="text-foreground font-semibold">{medicine.genericName}</span>
              </p>
            )}

            {medicine.manufacturer && (
              <p className="text-[11px] text-brand-teal font-semibold mt-0.5">
                {medicine.manufacturer}
              </p>
            )}
          </div>
        </div>

        {/* Pricing Chips */}
        <div className="flex flex-col items-end gap-1 self-start">
          {medicine.unitPrice ? (
            <div className="px-3 py-1 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-right">
              <div className="text-xs font-extrabold text-brand-teal">
                {medicine.unitPrice}
              </div>
              <div className="text-[9px] text-foreground/60 font-medium">
                per {medicine.unit}
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-foreground/50 italic bg-surface-200 border border-chestnut-600/20 dark:border-gray-800/80 px-2 py-0.5 rounded-lg">
              Price N/A
            </span>
          )}

          {medicine.stripPrice && (
            <div className="text-[10px] text-foreground/60 font-medium pt-0.5">
              Strip: <strong className="text-foreground font-bold">{medicine.stripPrice}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Dosage, Frequency, Duration Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-200/80 border border-chestnut-600/20 dark:border-gray-800/80 text-xs">
          <Pill className="w-4 h-4 text-brand-teal shrink-0" />
          <div>
            <span className="text-[9px] text-foreground/60 block uppercase font-bold tracking-wider">Dosage</span>
            <span className="text-foreground font-bold">{medicine.dosage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-200/80 border border-chestnut-600/20 dark:border-gray-800/80 text-xs">
          <Clock className="w-4 h-4 text-sky-500 shrink-0" />
          <div>
            <span className="text-[9px] text-foreground/60 block uppercase font-bold tracking-wider">Frequency</span>
            <span className="text-foreground font-bold">{freqInfo.display}</span>
            {freqInfo.detail && (
              <span className="text-[10px] text-brand-teal block font-medium leading-tight pt-0.5">
                {freqInfo.detail}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-200/80 border border-chestnut-600/20 dark:border-gray-800/80 text-xs">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <span className="text-[9px] text-foreground/60 block uppercase font-bold tracking-wider">Duration</span>
            <span className="text-foreground font-bold">{medicine.duration}</span>
          </div>
        </div>
      </div>

      {/* Doctor Notes Callout */}
      {medicine.doctorNotes && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-900 dark:text-sky-200">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sky-800 dark:text-sky-300 block">Doctor Instruction:</span>
            <span>{medicine.doctorNotes}</span>
          </div>
        </div>
      )}

      {/* Side Effects Warning Section */}
      {medicine.sideEffects && medicine.sideEffects.length > 0 && (
        <div className="pt-0.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400 font-semibold mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Common Side Effects:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {medicine.sideEffects.map((effect, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-medium"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives Accordion */}
      <AlternativesAccordion
        alternatives={medicine.alternatives}
        currentBrandName={medicine.brandName}
        currentBrandPriceValue={medicine.unitPriceValue}
        onSwapMedicine={onSwapMedicine}
      />
    </div>
  );
}
