'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Search, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DecodingLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Pill, text: 'Scanning handwriting & medical shorthand...' },
    { icon: Search, text: 'Grounding live pricing & alternatives on Medex.bd...' },
    { icon: Sparkles, text: 'Structuring clinical dosages & cost estimates...' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 2500);
    const timer2 = setTimeout(() => setCurrentStep(2), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl border border-brand-teal/40 text-center space-y-8 animate-pulse-glow">
      {/* Animated Center Pill Icon */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-brand-teal/60"
        />
        <div className="w-16 h-16 rounded-2xl bg-brand-teal/20 border border-brand-teal/50 flex items-center justify-center text-brand-light glow-teal">
          <Pill className="w-8 h-8 -rotate-45 animate-bounce" />
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          Decoding Prescription...
        </h3>
        <p className="text-xs text-gray-400">
          Google Gemini Flash is analyzing your document in real-time.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="space-y-3 text-left max-w-md mx-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-brand-teal/15 border border-brand-teal/30 text-white'
                  : isDone
                  ? 'bg-surface-100/50 text-gray-300'
                  : 'opacity-40 text-gray-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
              ) : isCurrent ? (
                <Icon className="w-5 h-5 text-brand-light animate-spin shrink-0" />
              ) : (
                <Icon className="w-5 h-5 text-gray-500 shrink-0" />
              )}
              <span className="text-xs font-medium">{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
