
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
  icebreaker?: string;
  location?: string;
  isVerified?: boolean;
  automationStatus: 'idle' | 'queued' | 'sent' | 'failed' | 'sending'; 
  tags?: string[];
  notes?: string;
  isSaved?: boolean;
  funnelStatus?: 'waiting' | 'contacted' | 'replied';
  sentAt?: string;
  nextAttemptAt?: number;
  healthScore?: number;
  newsTrigger?: string;
  starRating?: number; // 1-5 arası puan
  reviewCount?: number; // Toplam yorum sayısı
  prestigeNote?: string; // Puanlama gerekçesi
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

export interface AutomationConfig {
  minInterval: number; 
  maxInterval: number; 
  isActive: boolean;
  dailyLimit: number;
  sentToday: number;
  isCenterActive: boolean;
}

export interface User {
  username: string;
  password?: string;
  email: string;
  name: string; 
  avatar?: string;
  isPro: boolean;
  role?: 'admin' | 'user';
  provider: 'google' | 'demo' | 'local';
  tokenBalance: number;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogo?: string;
  authorizedPerson?: string;
  officialAddress?: string;
  n8nWebhookUrl?: string;
  isGmailConnected?: boolean;
  googleAccessToken?: string;
  mainActivity?: string;
  targetAudience?: string;
  globalPitch?: string;
  automationConfig?: AutomationConfig;
}

export type ViewState = 'landing' | 'login' | 'dashboard' | 'library';

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  FINDING_DETAILS = 'FINDING_DETAILS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

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
