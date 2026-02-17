
export interface SenderAccount {
  id: string;
  email: string;
  accessToken: string; // OAuth2'den gelen yetki anahtarı
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
  instagram?: string;
  facebook?: string;
  twitter?: string;
  industry?: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  emailSubject?: string;
  emailDraft?: string;
  automationStatus: 'idle' | 'queued' | 'sent' | 'failed' | 'sending'; 
  location?: string;
  isSaved?: boolean;
  funnelStatus?: 'waiting' | 'contacted' | 'replied' | 'meeting_scheduled';
  sentAt?: string;
  repliedAt?: string;
  sentFromEmail?: string; // Hangi hesaptan gönderildiği
  starRating?: number;
  competitors?: string[];
  painPoints?: string[];
  strategicValue?: string;
  prestigeNote?: string;
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

export interface SavedSearch {
  id: string;
  name: string;
  date: string;
  city: string;
  sector: string;
  count: number;
  participants: Participant[];
}

// Fixed missing types for IntelligenceCenter and UserActivityChart
export interface Sector {
  id: string;
  label: string;
  icon: string;
}

export type SearchMode = 'db' | 'live';

export interface ActivityPoint {
  date: string;
  tokensSpent: number;
  analyses: number;
  logins: number;
}
