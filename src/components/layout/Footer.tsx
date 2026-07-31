'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-chestnut-600/20 dark:border-gray-800/60 bg-background/90 py-8 px-4 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-4">

        {/* Medical Disclaimer Banner */}
        <div className="flex items-start gap-2.5 max-w-2xl px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-amber-800 dark:text-amber-300">Medical Disclaimer:</span> This AI tool is designed strictly for informational and educational assistance in interpreting prescriptions. Never alter medication doses or start/stop treatment without consulting a licensed physician or healthcare professional.
          </p>
        </div>

        {/* Footer Links & Info */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/50">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Gemini 2.0 Multimodal + Search Grounded
          </span>
          <span>•</span>
          <span>Medex.com.bd Pricing Database</span>
          <span>•</span>
          <span>Bangladesh Healthcare Context</span>
        </div>

        <p className="text-[11px] text-foreground/40">
          Smart Rx Decoder © {new Date().getFullYear()} · Zero-Backend AI Architecture
        </p>
      </div>
    </footer>
  );
}
