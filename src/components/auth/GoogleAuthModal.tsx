'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function GoogleAuthModal() {
  const { showAuthModal, setShowAuthModal, signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!showAuthModal) return null;

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md p-6 sm:p-8 glass-panel rounded-3xl border border-brand-teal/40 shadow-2xl overflow-hidden bg-background"
        >
          {/* Close button */}
          <button
            onClick={() => setShowAuthModal(false)}
            disabled={isLoggingIn}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-foreground/60 hover:text-foreground hover:bg-surface-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal/20 to-brand-emerald/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal mb-4 glow-teal shadow-lg">
              <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              Sign In to Smart Rx AI
            </h3>
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed max-w-xs">
              Access AI prescription decoding, real-time BDT pricing from Medex.bd, and save your chat history securely.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-7">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-surface-100 border border-chestnut-600/20 dark:border-gray-800/80 text-foreground font-bold hover:bg-surface-200 active:scale-98 transition-all duration-200 shadow-xl disabled:opacity-75"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-teal" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-foreground/50">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
            <span>End-to-End Private &amp; Serverless Encryption</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
