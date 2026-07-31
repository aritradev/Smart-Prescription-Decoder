import { PrescriptionDecodeResult } from './prescription';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageBase64?: string;
  mimeType?: string;
  prescriptionData?: PrescriptionDecodeResult | null;
  timestamp: number;
  isDecoding?: boolean;
  isLanguagePoll?: boolean;
  selectedLanguage?: 'bn' | 'en';
}
