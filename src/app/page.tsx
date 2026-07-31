'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chat/ChatInterface';
import GeminiSidebar from '@/components/history/GeminiSidebar';
import { createSessionId, getCurrentSessionId, setCurrentSessionId, getActiveChatMessages } from '@/lib/chatHistory';
import { ChatMessage } from '@/types/chat';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ShieldCheck, Search, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userEmail = user?.email;

  // Sidebar & History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSessionId, setActiveSessionIdState] = useState<string>('session_default');
  const [restoredChatMessages, setRestoredChatMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    // Start on a fresh New Chat interface upon login / mount (like Gemini / ChatGPT)
    const freshId = createSessionId();
    setCurrentSessionId(freshId, userEmail);
    setActiveSessionIdState(freshId);
    setRestoredChatMessages(null);
  }, [userEmail]);

  const handleNewChat = () => {
    // Check if active chat session already has 0 user messages
    const currentMsgs = getActiveChatMessages(activeSessionId, userEmail);
    const hasUserMessage = currentMsgs.some((m) => m.role === 'user');

    if (!hasUserMessage && restoredChatMessages === null) {
      toast('Already in a new chat thread', { icon: 'ℹ️' });
      return;
    }

    const newId = createSessionId();
    setCurrentSessionId(newId, userEmail);
    setActiveSessionIdState(newId);

    const welcomeMsg: ChatMessage[] = [
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content:
          'Hello! I am your AI Medical Prescription Assistant. Upload a prescription photo or ask me any question about medication dosages, BDT market prices, and generic alternatives!',
        timestamp: Date.now(),
      },
    ];

    setRestoredChatMessages(welcomeMsg);
    toast.success('Started new chat session');
  };

  const handleSelectChatSession = (sessionId: string, messages: ChatMessage[]) => {
    setCurrentSessionId(sessionId, userEmail);
    setActiveSessionIdState(sessionId);
    setRestoredChatMessages(messages);
    toast.success('Loaded recent chat thread');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 max-w-3xl mx-auto pt-2"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-brand-light text-xs font-semibold glow-teal">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Google Gemini Flash AI Chat Assistant · Medex.bd Grounded</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            AI Prescription Chat & <span className="text-gradient-teal">Live BDT Price Finder</span>
          </h1>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foreground/60 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> 15-Msg LocalStorage Memory
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-brand-teal" /> Medex.com.bd Real-Time Grounding
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" /> Private & Serverless
            </span>
          </div>
        </motion.div>

        {/* AI Medical Chat Interface */}
        <ChatInterface
          key={activeSessionId}
          sessionId={activeSessionId}
          initialMessages={restoredChatMessages}
          onNewChat={handleNewChat}
        />

      </main>

      <Footer />

      {/* Google Gemini / ChatGPT Style Left History Sidebar */}
      <GeminiSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChatSession={handleSelectChatSession}
      />
    </div>
  );
}
