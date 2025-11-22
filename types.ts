export enum AppMode {
  INVESTOR = 'INVESTOR',
  COMPANY = 'COMPANY'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  sources?: Array<{
    title?: string;
    uri: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  mode: AppMode;
  createdAt: number;
}