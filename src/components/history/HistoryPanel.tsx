'use client';

import React from 'react';
import GeminiSidebar from './GeminiSidebar';
import { ChatMessage } from '@/types/chat';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChatSession?: (messages: ChatMessage[]) => void;
}

export default function HistoryPanel(props: HistoryPanelProps) {
  return (
    <GeminiSidebar
      isOpen={props.isOpen}
      onClose={props.onClose}
      onNewChat={() => {}}
      onSelectChatSession={(_, messages) => {
        if (props.onSelectChatSession) props.onSelectChatSession(messages);
      }}
    />
  );
}
