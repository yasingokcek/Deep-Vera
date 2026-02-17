
export interface SenderAccount {
  id: string;
  email: string;
  password?: string;
  status: 'active' | 'cooldown' | 'failed';
  usageCount: number;
}

export interface Participant {
  id: string;
  name: string;
  website: string;
  phone: string;
  email: string;
  linkedin?: string;
  industry?: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  emailSubject?: string;
  emailDraft?: string;
  automationStatus: 'idle' | 'queued' | 'sent' | 'failed' | 'sending'; 
  location?: string;
  isSaved?: boolean;
  funnelStatus?: 'waiting' | 'contacted' | 'replied';
  sentAt?: string;
  starRating?: number;
  competitors?: string[];
  painPoints?: string[];
  strategicValue?: string;
}

export interface User {
  username: string;
  email: string;
  name: string; 
  avatar?: string;
  isPro: boolean;
  role?: 'admin' | 'user';
  provider: 'google' | 'demo' | 'local';
  tokenBalance: number;
  companyName?: string;
  companyWebsite?: string;
  authorizedPerson?: string;
  officialAddress?: string;
  isGmailConnected?: boolean;
  googleAccessToken?: string;
  senderAccounts: SenderAccount[];
  currentSenderIndex: number;
  // Added globalPitch to resolve property error in geminiService.ts
  globalPitch?: string;
}

export type ViewState = 'landing' | 'login' | 'dashboard' | 'library';

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  FINDING_DETAILS = 'FINDING_DETAILS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Added SavedSearch to resolve import error in App.tsx
export interface SavedSearch {
  id: string;
  name: string;
  date: string;
  city: string;
  sector: string;
  count: number;
  participants: Participant[];
}

// Added Sector to resolve import error in IntelligenceCenter.tsx
export interface Sector {
  id: string;
  label: string;
  icon: string;
}

// Added SearchMode to resolve import error in IntelligenceCenter.tsx
export type SearchMode = 'db' | 'live';

// Added ActivityPoint to resolve import error in UserActivityChart.tsx
export interface ActivityPoint {
  date: string;
  tokensSpent: number;
  analyses: number;
  logins: number;
}
