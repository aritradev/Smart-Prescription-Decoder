'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Pill, Languages, Globe } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import DoctorInfoCard from '@/components/results/DoctorInfoCard';
import MedicineCard from '@/components/results/MedicineCard';
import TreatmentCostSummary from '@/components/results/TreatmentCostSummary';
import RichMarkdownContent from './RichMarkdownContent';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectLanguagePoll?: (lang: 'bn' | 'en') => void;
  onSwapMedicine?: (currentBrandName: string, newBrand: any) => void;
}

export default function ChatMessageItem({ message, onSelectLanguagePoll, onSwapMedicine }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  const rxData = message.prescriptionData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-brand-teal to-brand-emerald shadow-brand-teal/20'
            : 'bg-gradient-to-br from-brand-teal to-brand-emerald shadow-brand-teal/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Pill className="w-4 h-4 -rotate-45 text-white" />}
      </div>

      {/* Message Body */}
      <div className={`space-y-3 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Chat Text Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${isUser
              ? 'bg-gradient-to-r from-brand-teal to-brand-emerald text-white font-medium rounded-tr-none shadow-lg'
              : 'glass-panel border border-chestnut-600/20 dark:border-gray-800/80 text-foreground rounded-tl-none shadow-xl'
            }`}
        >
          {/* User Image Attachment Preview */}
          {message.imageBase64 && (
            <div className="mb-3 overflow-hidden rounded-xl border border-white/20 max-w-xs bg-black/40 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${message.mimeType || 'image/jpeg'};base64,${message.imageBase64}`}
                alt="Prescription Upload"
                className="max-h-56 w-auto object-contain rounded-lg"
              />
            </div>
          )}

          {/* Decoding Indicator */}
          {message.isDecoding ? (
            <div className="flex items-center gap-2 text-brand-light font-medium py-1">
              <span className="w-4 h-4 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
              <span>Analyzing prescription & fetching Medex.bd prices...</span>
            </div>
          ) : message.isLanguagePoll ? (
            /* Interactive Language Selection Poll Card */
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Languages className="w-4 h-4 text-amber-500" />
                <span>Choose Preferred Output Language</span>
              </div>
              <p className="text-xs text-foreground/70">
                Which language would you like the prescription summary and notes decoded in?
              </p>

              {message.selectedLanguage ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-teal/20 border border-brand-teal/40 text-brand-light text-xs font-semibold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Selected: {message.selectedLanguage === 'bn' ? '🇧🇩 বাংলা (Bangla)' : '🇬🇧 English'}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => onSelectLanguagePoll?.('bn')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-base">🇧🇩</span>
                    <span>বাংলা (Bangla)</span>
                  </button>

                  <button
                    onClick={() => onSelectLanguagePoll?.('en')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-teal/20 to-emerald-500/20 hover:from-brand-teal/40 hover:to-emerald-500/40 border border-brand-teal/40 text-brand-light font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <RichMarkdownContent content={message.content} />
          )}
        </div>

        {/* Prescription Structured Data Display (if decoded inside this assistant turn) */}
        {!isUser && rxData && rxData.medicines && rxData.medicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pt-2 w-full"
          >
            {/* Doctor Info Card */}
            {rxData.doctorInfo && (
              <DoctorInfoCard
                doctorInfo={rxData.doctorInfo}
                patientInfo={rxData.patientInfo}
              />
            )}

            {/* Medicines List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-light flex items-center gap-1.5 pt-1">
                <Pill className="w-4 h-4 text-brand-teal" />
                <span>Decoded Medications ({rxData.medicines.length})</span>
              </h4>

              {rxData.medicines.map((med, idx) => (
                <MedicineCard key={idx} medicine={med} index={idx} onSwapMedicine={onSwapMedicine} />
              ))}
            </div>

            {/* Cost Summary Engine */}
            <TreatmentCostSummary medicines={rxData.medicines} />
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
