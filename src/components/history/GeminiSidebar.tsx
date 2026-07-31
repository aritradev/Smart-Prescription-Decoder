'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Pill,
  PanelLeftClose,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import {
  ChatSessionEntry,
  getSavedChatSessions,
  deleteChatSession,
  togglePinChatSession,
} from '@/lib/chatHistory';
import { ChatMessage } from '@/types/chat';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface GeminiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId?: string;
  onNewChat: () => void;
  onSelectChatSession: (sessionId: string, messages: ChatMessage[]) => void;
}

export default function GeminiSidebar({
  isOpen,
  onClose,
  activeSessionId,
  onNewChat,
  onSelectChatSession,
}: GeminiSidebarProps) {
  const { user, setShowAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSessionEntry[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      setChatSessions(getSavedChatSessions(user.email));
    } else {
      setChatSessions([]);
    }
  }, [isOpen, user]);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteChatSession(id, user?.email);
    setChatSessions(updated);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = togglePinChatSession(id, user?.email);
    setChatSessions(updated);
  };

  const filteredSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Gemini Left Sidebar Drawer */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative z-10 w-80 sm:w-84 h-full bg-background border-r border-chestnut-600/20 dark:border-gray-800/80 shadow-2xl flex flex-col justify-between"
        >
          {/* Top Brand Header */}
          <div className="p-4 border-b border-chestnut-600/20 dark:border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-teal to-brand-emerald flex items-center justify-center text-white shadow-md shadow-brand-teal/20 shrink-0">
                <Pill className="w-4 h-4 -rotate-45 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-foreground text-sm tracking-tight leading-none">
                  Smart Rx Decoder
                </span>
                <span className="text-[10px] text-foreground/60 font-medium tracking-tight pt-0.5">
                  AI Prescription Intelligence · Medex.bd
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-foreground/60 hover:text-foreground hover:bg-surface-100 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">

            {/* + New Chat Button (Google Gemini Style) */}
            <button
              onClick={() => {
                if (!user) {
                  onClose();
                  setShowAuthModal(true);
                  return;
                }
                onNewChat();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-surface-100/90 hover:bg-brand-teal/20 border border-chestnut-600/20 dark:border-gray-800/80 hover:border-brand-teal/50 text-foreground font-bold text-sm flex items-center gap-3 transition-all active:scale-98 shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-teal/20 text-brand-light flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span>New chat</span>
            </button>

            {!user ? (
              /* LOGGED OUT STATE (Professional privacy banner) */
              <div className="text-center py-10 px-3 space-y-4 bg-surface-50/50 rounded-2xl border border-chestnut-600/20 dark:border-gray-800/80 my-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto glow-teal">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Sign In Required</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Sign in to save and manage your medical prescription chat history across devices.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-brand-emerald text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-brand-teal/20 transition-all"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              /* LOGGED IN USER CHAT HISTORY LIST */
              <>
                {/* Search Chats Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full bg-surface-50 border border-chestnut-600/20 dark:border-gray-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-foreground/40 focus:outline-none focus:border-brand-teal/50 transition-colors"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50 px-2 block mb-1">
                    Recent Chats
                  </span>

                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <MessageSquare className="w-6 h-6 text-foreground/30 mx-auto" />
                      <p className="text-xs text-foreground/50 font-medium">No recent chats found</p>
                    </div>
                  ) : (
                    filteredSessions.map((session) => {
                      const isActive = session.id === activeSessionId;
                      return (
                        <div
                          key={session.id}
                          onClick={() => {
                            onSelectChatSession(session.id, session.messages);
                            onClose();
                          }}
                          className={`group relative px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${isActive
                            ? 'bg-brand-teal/20 border-brand-teal/50 text-foreground font-bold'
                            : 'bg-transparent border-transparent hover:bg-surface-100/70 text-foreground/70 hover:text-foreground'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-teal' : 'text-foreground/40 group-hover:text-foreground/70'
                                }`}
                            />
                            <span className="truncate">{session.title}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => handleTogglePin(session.id, e)}
                              className={`p-1 rounded hover:bg-surface-200 ${session.pinned ? 'text-amber-500' : 'text-foreground/40 hover:text-foreground'
                                }`}
                              title={session.pinned ? 'Unpin chat' : 'Pin chat'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="p-1 rounded text-foreground/40 hover:text-red-500 hover:bg-red-500/10"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

          </div>

          {/* User Account / Profile & Theme Toggle Footer */}
          <div className="p-3 border-t border-chestnut-600/20 dark:border-gray-800/80 bg-surface-100/40 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-2.5 truncate">
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                    alt={user.user_metadata?.full_name || 'Profile'}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-brand-teal/50 shadow-md shrink-0 transition-transform duration-200 hover:scale-105"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-brand-teal/20 border-2 border-brand-teal/50 flex items-center justify-center text-brand-light font-bold text-xs md:text-sm shrink-0 shadow-md">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <div className="truncate">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-foreground/60 block font-semibold">
                    Pro Plan Active
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span>Signed out</span>
              </div>
            )}

            <ThemeToggle showLabel={false} />
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
