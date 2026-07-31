'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, LogIn, LogOut, PanelLeft, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
}

export default function Header({ onToggleSidebar, onNewChat }: HeaderProps) {
  const { user, signOut, setShowAuthModal } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-chestnut-600/20 dark:border-gray-800/80 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left Section: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Gemini-Style Sidebar Collapse Toggle Icon Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl glass-card text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-colors"
              title="Toggle Recent Chats History Sidebar"
            >
              <PanelLeft className="w-5 h-5 text-brand-teal" />
            </button>
          )}

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-emerald flex items-center justify-center text-white shadow-lg shadow-brand-teal/20 group-hover:scale-105 transition-transform duration-200">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                {t('appTitle')}
              </span>
              <span className="text-[10px] text-foreground/60 font-medium tracking-wide hidden sm:inline">
                {t('appSubtitle')}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full sm:rounded-2xl glass-card border border-brand-teal/30 shadow-sm hover:border-brand-teal/50 transition-all">
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                    alt={user.user_metadata?.full_name || 'Profile'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-brand-teal/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-brand-teal to-brand-emerald text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm shrink-0">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs text-foreground font-semibold hidden md:inline max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-teal to-brand-emerald text-white text-xs font-semibold hover:brightness-110 shadow-lg shadow-brand-teal/20 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('signIn')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
