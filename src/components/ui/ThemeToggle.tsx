'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl glass-card text-gray-300 hover:text-white dark:hover:text-white dark:text-gray-300 light:text-amber-950 hover:border-brand-teal/40 transition-all duration-200 group active:scale-95 ${className}`}
      title={isDark ? 'Switch to Cream Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Color Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-amber-900 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </motion.div>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? 'Light Mood' : 'Dark Mood'}
        </span>
      )}
    </button>
  );
}
