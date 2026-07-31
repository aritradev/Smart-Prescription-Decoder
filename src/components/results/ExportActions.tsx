'use client';

import React from 'react';
import { Printer, Copy, Share2, Check } from 'lucide-react';
import { PrescriptionDecodeResult } from '@/types/prescription';
import { calculateTreatmentCost } from '@/lib/costCalculator';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

interface ExportActionsProps {
  result: PrescriptionDecodeResult;
}

export default function ExportActions({ result }: ExportActionsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generateTextSummary = () => {
    const doctor = result.doctorInfo?.name ? `Doctor: ${result.doctorInfo.name}\n` : '';
    const patient = result.patientInfo?.name ? `Patient: ${result.patientInfo.name}\n` : '';
    const date = result.doctorInfo?.date ? `Date: ${result.doctorInfo.date}\n` : '';

    let text = `📋 SMART RX DECODER REPORT\n${doctor}${patient}${date}\n━━━ MEDICATIONS ━━━\n`;

    result.medicines.forEach((med, i) => {
      text += `\n${i + 1}. ${med.brandName} (${med.unit.toUpperCase()})\n`;
      if (med.genericName) text += `   Generic: ${med.genericName}\n`;
      text += `   Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}\n`;
      if (med.unitPrice) text += `   Price: ${med.unitPrice}\n`;

      if (med.alternatives && med.alternatives.length > 0) {
        const validAlts = med.alternatives.filter((a) => a.brandName);
        if (validAlts.length > 0) {
          text += `   Alternatives: ${validAlts.map((a) => a.brandName).join(', ')}\n`;
        }
      }
    });

    const costInputs = result.medicines.map((m) => ({
      brandName: m.brandName,
      unit: m.unit,
      unitPriceValue: m.unitPriceValue,
      tabletsPerDose: m.tabletsPerDose,
      frequencyPerDay: m.frequencyPerDay,
      durationDays: m.durationDays,
    }));
    const costSummary = calculateTreatmentCost(costInputs);

    if (costSummary.totals.fullDuration !== null) {
      text += `\n━━━ ESTIMATED COST ━━━\nFull Duration: ৳ ${costSummary.totals.fullDuration.toFixed(2)}\n`;
    }

    text += `\nGenerated via Smart Rx Decoder (Medex.bd Grounded)`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      const summaryText = generateTextSummary();
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast.success(t('copiedSuccess'));
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Failed to copy text.');
    }
  };

  const handleShare = async () => {
    const summaryText = generateTextSummary();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Smart Rx Prescription Report',
          text: summaryText,
        });
      } catch (err) {
        // User cancelled share or unsupported
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 print:hidden">
      <button
        onClick={handleCopyText}
        className="px-3.5 py-1.5 rounded-xl bg-surface-200/80 hover:bg-surface-300/80 border border-chestnut-600/20 dark:border-gray-800/80 hover:border-brand-teal/40 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer focus-ring"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-brand-teal" /> : <Copy className="w-3.5 h-3.5 text-brand-teal" />}
        <span>{copied ? 'Copied!' : t('copyText')}</span>
      </button>

      <button
        onClick={handleShare}
        className="px-3.5 py-1.5 rounded-xl bg-surface-200/80 hover:bg-surface-300/80 border border-chestnut-600/20 dark:border-gray-800/80 hover:border-brand-teal/40 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer focus-ring"
      >
        <Share2 className="w-3.5 h-3.5 text-brand-teal" />
        <span>{t('share')}</span>
      </button>

      <button
        onClick={handlePrint}
        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-emerald hover:brightness-110 text-white text-xs font-bold shadow-md shadow-brand-teal/20 transition-all flex items-center gap-1.5 cursor-pointer focus-ring"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>{t('printPdf')}</span>
      </button>
    </div>
  );
}
