import { ChatMessage } from '@/types/chat';

export interface ChatSessionEntry {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
  pinned?: boolean;
}

const CHAT_STORAGE_PREFIX = 'smart_rx_chat_history_v1';
const CHAT_SESSIONS_PREFIX = 'smart_rx_chat_sessions_v1';
const CURRENT_SESSION_PREFIX = 'smart_rx_current_session_id';
const MAX_SAVED_MESSAGES = 15;
const MAX_SAVED_SESSIONS = 25;

/**
 * Build a user-scoped localStorage key.
 * If no email is provided, falls back to a shared "anonymous" namespace.
 */
function userKey(prefix: string, userEmail?: string): string {
  const scope = userEmail ? userEmail.toLowerCase().trim() : '_anonymous_';
  return `${prefix}::${scope}`;
}

/**
 * Generates a unique session ID
 */
export function createSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Gets or sets the current active session ID (scoped by user email)
 */
export function getCurrentSessionId(userEmail?: string): string {
  if (typeof window === 'undefined') return 'session_default';
  try {
    const key = userKey(CURRENT_SESSION_PREFIX, userEmail);
    let id = localStorage.getItem(key);
    if (!id) {
      id = createSessionId();
      localStorage.setItem(key, id);
    }
    return id;
  } catch (err) {
    return 'session_default';
  }
}

export function setCurrentSessionId(id: string, userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(userKey(CURRENT_SESSION_PREFIX, userEmail), id);
  } catch (err) {
    console.error('Failed to set current session id:', err);
  }
}

/**
 * Gets the active chat messages for a specific session (or current session)
 */
export function getActiveChatMessages(sessionId?: string, userEmail?: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const idToFetch = sessionId || getCurrentSessionId(userEmail);
    const sessions = getSavedChatSessions(userEmail);
    const found = sessions.find((s) => s.id === idToFetch);
    if (found && Array.isArray(found.messages)) {
      return found.messages;
    }
    return [];
  } catch (err) {
    console.error('Failed to read active chat history:', err);
    return [];
  }
}

/**
 * Saves active chat messages to localStorage under current session ID
 * ONLY saves to the sidebar session history if there is at least 1 user message!
 */
export function saveActiveChatMessages(messages: ChatMessage[], customSessionId?: string, userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sessionId = customSessionId || getCurrentSessionId(userEmail);
    const filtered = messages.filter((m) => !m.isDecoding);
    const toSave = filtered.slice(-MAX_SAVED_MESSAGES);

    localStorage.setItem(userKey(CHAT_STORAGE_PREFIX, userEmail), JSON.stringify(toSave));

    // ONLY save to sidebar list if the session has at least 1 user message
    const hasUserMsg = toSave.some((m) => m.role === 'user');
    if (hasUserMsg) {
      saveSessionToList(sessionId, toSave, userEmail);
    }
  } catch (err) {
    console.error('Failed to save active chat history:', err);
  }
}

/**
 * Clears active chat messages for a session (or current session)
 */
export function clearActiveChatMessages(customSessionId?: string, userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sessionId = customSessionId || getCurrentSessionId(userEmail);
    deleteChatSession(sessionId, userEmail);
    localStorage.removeItem(userKey(CHAT_STORAGE_PREFIX, userEmail));
  } catch (err) {
    console.error('Failed to clear active chat history:', err);
  }
}

/**
 * Gets all saved chat sessions for Gemini/ChatGPT style history sidebar
 * Automatically filters out any empty sessions that have no user messages and deduplicates entries
 */
export function getSavedChatSessions(userEmail?: string): ChatSessionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(userKey(CHAT_SESSIONS_PREFIX, userEmail));
    if (!raw) return [];
    const parsed: ChatSessionEntry[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out empty sessions with no user messages
    const validSessions = parsed.filter(
      (s) => Array.isArray(s.messages) && s.messages.some((m) => m.role === 'user')
    );

    // Deduplicate sessions by ID and by title + first user message content
    const seenIds = new Set<string>();
    const seenContents = new Set<string>();
    const uniqueSessions: ChatSessionEntry[] = [];

    for (const session of validSessions) {
      if (seenIds.has(session.id)) continue;
      seenIds.add(session.id);

      const firstUserMsg = session.messages.find((m) => m.role === 'user')?.content || '';
      const contentKey = `${session.title.trim()}:::${firstUserMsg.trim()}`;

      if (seenContents.has(contentKey)) {
        continue;
      }
      seenContents.add(contentKey);
      uniqueSessions.push(session);
    }

    return uniqueSessions.sort(
      (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp
    );
  } catch (err) {
    console.error('Failed to read chat sessions history:', err);
    return [];
  }
}

/**
 * Internal helper to save/update a session entry in the session list
 */
function saveSessionToList(sessionId: string, messages: ChatMessage[], userEmail?: string): ChatSessionEntry[] {
  const sessions = getSavedChatSessions(userEmail);
  const firstUserMsg = messages.find((m) => m.role === 'user');

  // DO NOT add empty sessions without user messages to the sidebar list
  if (!firstUserMsg) {
    return getSavedChatSessions(userEmail);
  }
  
  let title = firstUserMsg.content.substring(0, 45).trim();
  if (firstUserMsg.content.length > 45) title += '...';

  const existingIndex = sessions.findIndex((s) => s.id === sessionId);
  const existingPinned = existingIndex >= 0 ? sessions[existingIndex].pinned : false;

  const newOrUpdatedSession: ChatSessionEntry = {
    id: sessionId,
    title,
    timestamp: Date.now(),
    messages,
    pinned: existingPinned,
  };

  let updatedList: ChatSessionEntry[];
  if (existingIndex >= 0) {
    updatedList = [newOrUpdatedSession, ...sessions.filter((_, i) => i !== existingIndex)];
  } else {
    updatedList = [newOrUpdatedSession, ...sessions];
  }

  updatedList = updatedList.slice(0, MAX_SAVED_SESSIONS);
  localStorage.setItem(userKey(CHAT_SESSIONS_PREFIX, userEmail), JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Toggles pin status for a chat session
 */
export function togglePinChatSession(id: string, userEmail?: string): ChatSessionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedChatSessions(userEmail);
    const updated = current.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s));
    localStorage.setItem(userKey(CHAT_SESSIONS_PREFIX, userEmail), JSON.stringify(updated));
    return updated;
  } catch (err) {
    return getSavedChatSessions(userEmail);
  }
}

/**
 * Deletes a chat session from history
 */
export function deleteChatSession(id: string, userEmail?: string): ChatSessionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedChatSessions(userEmail);
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(userKey(CHAT_SESSIONS_PREFIX, userEmail), JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete chat session:', err);
    return getSavedChatSessions(userEmail);
  }
}

/**
 * Resets in-memory session pointer (used on logout).
 * Does NOT delete stored chat data — it stays in localStorage keyed by email.
 */
export function resetCurrentSession(userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(userKey(CURRENT_SESSION_PREFIX, userEmail));
  } catch (err) {
    console.error('Failed to reset current session:', err);
  }
}
