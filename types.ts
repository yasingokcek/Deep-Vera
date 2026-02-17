
export interface Participant {
  id: string;
  name: string;
  website: string;
  phone: string;
  email: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  industry?: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  emailSubject?: string;
  emailDraft?: string;
  icebreaker?: string;
  competitors?: string[];
  healthScore?: number;
  location?: string;
  isVerified?: boolean;
  automationStatus: 'idle' | 'queued' | 'sent' | 'failed' | 'sending'; 
  neuralLogs?: string[];
  newsTrigger?: string;
  sentAt?: string;
}

export interface AutomationConfig {
  minInterval: number; // Dakika
  maxInterval: number; // Dakika
  isActive: boolean;
  dailyLimit: number;
  sentToday: number;
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
  n8nWebhookUrl?: string;
  isGmailConnected?: boolean;
  googleAccessToken?: string;
  mainActivity?: string;
  competitorsInfo?: string;
  targetAudience?: string;
  globalPitch?: string;
  automationConfig?: AutomationConfig;
}

export type ViewState = 'landing' | 'login' | 'dashboard' | 'admin' | 'gmail_center';

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
