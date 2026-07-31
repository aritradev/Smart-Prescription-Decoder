'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pill, FileCheck2, Info, ArrowLeft } from 'lucide-react';
import { PrescriptionDecodeResult } from '@/types/prescription';
import DoctorInfoCard from './DoctorInfoCard';
import MedicineCard from './MedicineCard';
import TreatmentCostSummary from './TreatmentCostSummary';
import ExportActions from './ExportActions';
import { useLanguage } from '@/context/LanguageContext';

interface ResultsPanelProps {
  result: PrescriptionDecodeResult;
  onReset: () => void;
}

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const { t } = useLanguage();
  const medicineCount = result.medicines?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Top Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-chestnut-600/20 dark:border-gray-800/80 print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-semibold text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-brand-teal" />
          <span>{t('decodeAnother')}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-foreground/80 font-semibold hidden sm:flex">
            <FileCheck2 className="w-4 h-4 text-brand-emerald" />
            <span>{t('foundMedicines', { count: medicineCount })}</span>
          </div>

          <ExportActions result={result} />
        </div>
      </div>

      {/* Doctor & Patient Info Header Card */}
      <DoctorInfoCard
        doctorInfo={result.doctorInfo}
        patientInfo={result.patientInfo}
      />

      {/* Medicines List Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <Pill className="w-5 h-5 text-brand-teal" />
          <span>{t('alternatives')}</span>
        </h3>
        <span className="text-xs text-foreground/60">
          Medex.bd Live Prices
        </span>
      </div>

      {/* Medicine Cards List */}
      <div className="space-y-4">
        {result.medicines.map((medicine, index) => (
          <MedicineCard
            key={index}
            medicine={medicine}
            index={index}
          />
        ))}
      </div>

      {/* Intelligent Treatment Cost Summary */}
      <TreatmentCostSummary medicines={result.medicines} />

      {/* General Doctor Advice / Instructions (if available) */}
      {result.generalInstructions && (
        <div className="glass-panel p-5 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              {t('doctorAdvice')}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {result.generalInstructions}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
