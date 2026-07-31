'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, RefreshCw, Lightbulb, Camera } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  isRateLimited?: boolean;
  cooldownSeconds?: number;
  unreadable?: boolean;
  onRetry: () => void;
}

export default function ErrorDisplay({
  error,
  isRateLimited,
  cooldownSeconds = 30,
  unreadable,
  onRetry,
}: ErrorDisplayProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);

  useEffect(() => {
    if (isRateLimited && secondsLeft > 0) {
      const timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, secondsLeft]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 text-center space-y-5"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
        {isRateLimited ? (
          <Clock className="w-8 h-8 animate-pulse text-amber-400" />
        ) : (
          <AlertCircle className="w-8 h-8" />
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">
          {isRateLimited
            ? 'Rate Limit Reached'
            : unreadable
            ? 'Unreadable Prescription'
            : 'Decoding Failed'}
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
          {error}
        </p>
      </div>

      {/* Rate Limit Cooldown Display */}
      {isRateLimited && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-semibold flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>
            {secondsLeft > 0
              ? `Please wait ${secondsLeft}s before retrying`
              : 'Cooldown complete! You can retry now.'}
          </span>
        </div>
      )}

      {/* Blurry Image Tips */}
      {unreadable && (
        <div className="p-4 rounded-xl bg-surface-100 text-left text-xs space-y-2 border border-gray-800">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Lightbulb className="w-4 h-4" />
            <span>Tips for best AI prescription decoding:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Ensure bright lighting without shadows across the paper</li>
            <li>Keep the text fully in focus and hold the camera steady</li>
            <li>Include the doctor details and medication table clearly</li>
          </ul>
        </div>
      )}

      {/* Retry Action Button */}
      <button
        onClick={onRetry}
        disabled={isRateLimited && secondsLeft > 0}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand-teal to-brand-emerald text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-brand-teal/20 transition-all disabled:opacity-50"
      >
        <RefreshCw className="w-4 h-4" />
        <span>
          {unreadable
            ? 'Try Another Prescription Photo'
            : isRateLimited && secondsLeft > 0
            ? `Retry in ${secondsLeft}s`
            : 'Try Again'}
        </span>
      </button>
    </motion.div>
  );
}
