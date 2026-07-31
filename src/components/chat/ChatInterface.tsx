'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Camera, X, Sparkles, MessageSquare, Languages, Pill, Plus } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import ChatMessageItem from './ChatMessageItem';
import CameraModal from '@/components/upload/CameraModal';
import { useAuth } from '@/context/AuthContext';
import { getActiveChatMessages, saveActiveChatMessages } from '@/lib/chatHistory';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  sessionId?: string;
  initialMessages?: ChatMessage[] | null;
  onNewChat?: () => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage[] = [
  {
    id: 'welcome_initial',
    role: 'assistant',
    content:
      'Hello! I am your AI Medical Prescription Assistant. Upload a prescription photo or ask me any question about medication dosages, BDT market prices, and generic alternatives!',
    timestamp: 1700000000000,
  },
];

export default function ChatInterface({ sessionId, initialMessages, onNewChat }: ChatInterfaceProps) {
  const { user, setShowAuthModal } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize with deterministic static state for SSR hydration match
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    return DEFAULT_WELCOME_MESSAGE;
  });

  const [hasMounted, setHasMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingImagePayload, setPendingImagePayload] = useState<{ base64: string; mimeType: string } | null>(null);
  const [pendingUserText, setPendingUserText] = useState<string>('');

  // Load saved chat messages from LocalStorage after client-side mount if user is logged in
  useEffect(() => {
    setHasMounted(true);
    if (!user) {
      setMessages(DEFAULT_WELCOME_MESSAGE);
      return;
    }
    const email = user.email;
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      saveActiveChatMessages(initialMessages, sessionId, email);
    } else {
      const saved = getActiveChatMessages(sessionId, email);
      if (saved && saved.length > 0) {
        setMessages(saved);
      }
    }
  }, [sessionId, initialMessages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasMounted) {
      scrollToBottom();
    }
  }, [messages, isSending, hasMounted]);

  // Persist messages to LocalStorage whenever they change after mount (only for logged in user)
  useEffect(() => {
    if (hasMounted && user && messages.length > 0) {
      saveActiveChatMessages(messages, sessionId, user.email);
    }
  }, [messages, sessionId, hasMounted, user]);

  // Client-side image compression
  const compressImage = (file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1280;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const base64 = compressedDataUrl.split(',')[1];
          resolve({
            base64,
            mimeType: 'image/jpeg',
            previewUrl: compressedDataUrl,
          });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
    } catch (err) {
      console.error('Image compression error:', err);
      toast.error('Failed to process image file.');
    }
  };

  const handleCameraCapture = (base64: string, mimeType: string) => {
    const dataUrl = `data:${mimeType};base64,${base64}`;
    setSelectedImage({
      base64,
      mimeType,
      previewUrl: dataUrl,
    });
  };

  /**
   * Triggers main AI message processing
   */
  const executeSendMessage = async (
    textToSend: string,
    imageObj: { base64: string; mimeType: string } | null,
    targetLang?: 'bn' | 'en'
  ) => {
    const userMessageId = 'msg_' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend || (imageObj ? 'Attached Prescription Photo' : ''),
      imageBase64: imageObj?.base64,
      mimeType: imageObj?.mimeType,
      timestamp: Date.now(),
      selectedLanguage: targetLang,
    };

    const assistantPlaceholderId = 'asst_' + (Date.now() + 1);
    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isDecoding: true,
    };

    setMessages((prev) => [...prev, newUserMessage, assistantPlaceholder]);
    setInputText('');
    setSelectedImage(null);
    setPendingImagePayload(null);
    setPendingUserText('');
    setIsSending(true);

    try {
      const latestRxData = messages.slice().reverse().find((m) => m.prescriptionData)?.prescriptionData || null;

      const historyContext = messages
        .filter((m) => !m.isDecoding && !m.isLanguagePoll)
        .slice(-15)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: imageObj?.base64,
          mimeType: imageObj?.mimeType,
          history: historyContext,
          targetLanguage: targetLang,
          activePrescriptionData: latestRxData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                ...msg,
                content: data.error || 'Failed to get response. Please try again.',
                isDecoding: false,
              }
              : msg
          )
        );
        toast.error(data.error || 'Request failed');
      } else {
        if (data.prescriptionData) {
          toast.success('Prescription JSON updated with confirmed medicine swap!');
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                ...msg,
                content: data.chatReply,
                prescriptionData: data.prescriptionData,
                isDecoding: false,
              }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
              ...msg,
              content: 'Network error or server unavailable. Please try again.',
              isDecoding: false,
            }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Send button click
   */
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!text.trim() && !selectedImage && !pendingImagePayload) {
      return;
    }

    const imagePayload = selectedImage || pendingImagePayload;
    const lowerText = text.toLowerCase();
    const hasLanguageSpecified = lowerText.includes('bangla') || lowerText.includes('english') || lowerText.includes('বাংলা') || lowerText.includes('ইংশলিশ');

    if (imagePayload && !hasLanguageSpecified) {
      setPendingImagePayload(imagePayload);
      setPendingUserText(text.trim());

      const pollCardId = 'poll_' + Date.now();
      const pollCard: ChatMessage = {
        id: pollCardId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isLanguagePoll: true,
        imageBase64: imagePayload.base64,
        mimeType: imagePayload.mimeType,
      };

      setMessages((prev) => [...prev, pollCard]);
      setSelectedImage(null);
      setInputText('');
      return;
    }

    executeSendMessage(text, imagePayload, undefined);
  };

  const handleSelectLanguagePoll = (pollMsgId: string, lang: 'bn' | 'en') => {
    const pollMsg = messages.find((m) => m.id === pollMsgId || m.isLanguagePoll);
    const imgPayload = pollMsg ? { base64: pollMsg.imageBase64!, mimeType: pollMsg.mimeType! } : pendingImagePayload;

    setMessages((prev) =>
      prev.map((m) =>
        m.isLanguagePoll
          ? { ...m, selectedLanguage: lang }
          : m
      )
    );

    let langPrompt = '';
    if (pendingUserText && pendingUserText.trim()) {
      langPrompt = `${pendingUserText.trim()} (Please answer and decode in ${lang === 'bn' ? 'Bangla/বাংলা' : 'English'}).`;
    } else {
      langPrompt = lang === 'bn' ? 'Please decode this prescription in Bangla (বাংলা).' : 'Please decode this prescription in English.';
    }

    executeSendMessage(langPrompt, imgPayload, lang);
  };

  const handleSwapMedicine = (currentBrandName: string, newBrand: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const swapPrompt = `Yes, please change ${currentBrandName || 'the medicine'} to ${newBrand.brandName}. Update my prescription data with its price and details.`;
    toast.success(`Requesting swap to ${newBrand.brandName}...`);
    executeSendMessage(swapPrompt, null, undefined);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[80vh] glass-panel rounded-3xl border border-chestnut-600/20 dark:border-gray-800/80 shadow-2xl overflow-hidden">

      {/* Chat Thread Header */}
      <div className="px-6 py-4 border-b border-chestnut-600/20 dark:border-gray-800/80 bg-surface-100/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-brand-emerald flex items-center justify-center text-white shadow-md shadow-brand-teal/20 shrink-0">
            <Pill className="w-4.5 h-4.5 -rotate-45 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 leading-none">
              Smart Rx Decoder
            </h3>
            <p className="text-[11px] text-foreground/60 pt-0.5 font-medium">
              AI Prescription Intelligence · Medex.bd Grounded
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        {onNewChat && (
          <button
            onClick={onNewChat}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/30 text-xs font-bold text-brand-teal transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onSelectLanguagePoll={(lang) => handleSelectLanguagePoll(msg.id, lang)}
            onSwapMedicine={handleSwapMedicine}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (if chat has only 1 message) */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-gray-800/60 dark:border-gray-800/60 light:border-chestnut-600/20 bg-surface-100/30 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!user) setShowAuthModal(true);
              else {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                };
                input.click();
              }
            }}
            className="px-3 py-1.5 rounded-xl glass-card text-xs text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-all flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-brand-teal" />
            <span>📷 Attach Rx Photo</span>
          </button>

          <button
            onClick={() => handleSendMessage('What is Napa 500mg used for and what is its dosage in Bangladesh?')}
            className="px-3 py-1.5 rounded-xl glass-card text-xs text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>💊 Napa 500mg uses & price</span>
          </button>

          <button
            onClick={() => handleSendMessage('Find cheaper generic alternatives for Sergel 20mg capsule')}
            className="px-3 py-1.5 rounded-xl glass-card text-xs text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-light" />
            <span>🏷️ Cheaper options for Sergel 20mg</span>
          </button>
        </div>
      )}

      {/* Image Preview Chip inside Input */}
      {selectedImage && (
        <div className="px-6 pt-3 flex items-center gap-3 bg-surface-100/80 border-t border-chestnut-600/20 dark:border-gray-800/80">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-teal/40 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage.previewUrl} alt="Attached Rx" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white hover:bg-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-foreground/80">
            <span className="font-semibold text-brand-teal flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              Prescription Attached — Will prompt for Bangla/English Poll
            </span>
            <span>Click Send or select output language below.</span>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-2.5 sm:p-4 border-t border-chestnut-600/20 dark:border-gray-800/80 bg-surface-100/80 flex items-center gap-1.5 sm:gap-2">
        {/* Attach File Button */}
        <button
          type="button"
          onClick={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              };
              input.click();
            }
          }}
          disabled={isSending}
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-card text-foreground/60 hover:text-foreground hover:border-brand-teal/40 transition-colors shrink-0"
          title="Attach Image"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal" />
        </button>

        {/* Camera Capture Button */}
        <button
          type="button"
          onClick={() => {
            if (!user) setShowAuthModal(true);
            else setIsCameraOpen(true);
          }}
          disabled={isSending}
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-card text-foreground/60 hover:text-foreground hover:border-brand-teal/40 transition-colors shrink-0"
          title="Use Camera"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isSending}
          placeholder={
            selectedImage
              ? 'Ask question or Send...'
              : 'Ask about prescription, prices...'
          }
          className="min-w-0 flex-1 bg-surface-50 border border-chestnut-600/20 dark:border-gray-800/80 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-brand-teal/60 transition-colors"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isSending || (!inputText.trim() && !selectedImage)}
          className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-teal to-brand-emerald text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50 shrink-0 flex items-center justify-center min-w-[38px] sm:min-w-[44px]"
          title="Send Message"
        >
          {isSending ? (
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white border-t-transparent animate-spin block" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
