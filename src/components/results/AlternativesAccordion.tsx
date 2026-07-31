'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, TrendingDown, Building2 } from 'lucide-react';
import { AlternativeMedicine } from '@/types/prescription';

interface AlternativesAccordionProps {
  alternatives: AlternativeMedicine[];
  currentBrandName?: string;
  currentBrandPriceValue?: number | null;
  onSwapMedicine?: (currentBrandName: string, newBrand: AlternativeMedicine) => void;
}

export default function AlternativesAccordion({
  alternatives,
  currentBrandName,
  currentBrandPriceValue,
  onSwapMedicine,
}: AlternativesAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out completely null alternatives if any
  const validAlternatives = alternatives.filter(
    (alt) => alt.brandName || alt.genericName || alt.manufacturer
  );

  if (validAlternatives.length === 0) return null;

  return (
    <div className="w-full mt-4 rounded-xl border border-chestnut-600/20 dark:border-gray-800/80 bg-surface-50/50 overflow-hidden">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-100/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span className="text-xs font-semibold text-foreground/90 uppercase tracking-wide">
            Generic & Brand Alternatives ({validAlternatives.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-light font-medium hidden sm:inline">
            {isOpen ? 'Hide Options' : 'View Best & Cheaper Brands'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-foreground/40 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-teal' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 border-t border-chestnut-600/20 dark:border-gray-800/80 space-y-3 bg-surface-100/30">
          {validAlternatives.map((alt, index) => {
            const isCheaperType = alt.type === 'cheaper' || index === 2;

            // Calculate price difference percentage if prices available
            let savingsPercent: number | null = null;
            if (
              currentBrandPriceValue &&
              alt.unitPriceValue &&
              alt.unitPriceValue < currentBrandPriceValue
            ) {
              savingsPercent = Math.round(
                ((currentBrandPriceValue - alt.unitPriceValue) / currentBrandPriceValue) * 100
              );
            }

            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl glass-card border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCheaperType
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-brand-teal/20 bg-brand-teal/5'
                }`}
              >
                {/* Brand & Manufacturer Info */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {alt.brandName || 'Alternative Brand'}
                    </span>

                    {/* Badge */}
                    {isCheaperType ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Cheapest Option
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-brand-teal/20 border border-brand-teal/40 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                        Best Match
                      </span>
                    )}
                  </div>

                  {alt.manufacturer && (
                    <p className="text-xs text-foreground/60 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-foreground/40" />
                      <span>{alt.manufacturer}</span>
                    </p>
                  )}
                  {alt.genericName && (
                    <p className="text-[11px] text-foreground/60 italic">
                      Generic: {alt.genericName}
                    </p>
                  )}
                </div>

                {/* Price Display & Swap Action */}
                <div className="flex items-center gap-3 text-right self-end sm:self-center shrink-0">
                  {alt.unitPrice ? (
                    <div>
                      <div className="text-sm font-extrabold text-foreground">
                        {alt.unitPrice}
                      </div>
                      {alt.stripPrice && (
                        <div className="text-[11px] text-foreground/60">
                          {alt.stripPrice} / strip
                        </div>
                      )}
                      {savingsPercent !== null && savingsPercent > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Save ~{savingsPercent}%
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/40 italic">Price N/A</span>
                  )}

                  {onSwapMedicine && alt.brandName && (
                    <button
                      type="button"
                      onClick={() => onSwapMedicine(currentBrandName || '', alt)}
                      className="px-3 py-1.5 rounded-xl bg-brand-teal/15 hover:bg-brand-teal/30 border border-brand-teal/40 text-brand-light font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                      title={`Swap to ${alt.brandName}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Swap</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
