export type UserPlan = "FREE" | "PREMIUM";

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  preferred_language: string;
  analyses_this_month: number;
  chats_today: number;
  created_at: string;
}

export type AnalysisStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface FlagItem {
  clause: string;
  issue: string;
  law_reference?: string;
  recommendation: string;
}

export interface GreenFlag {
  clause: string;
  positive: string;
}

export interface Analysis {
  id: string;
  file_name: string;
  file_url?: string;
  property_type?: string;
  emirate?: string;
  area?: string;
  annual_rent?: number;
  contract_start?: string;
  contract_end?: string;
  status: AnalysisStatus;
  overall_score?: number;
  summary?: string;
  red_flags?: FlagItem[];
  yellow_flags?: FlagItem[];
  green_flags?: GreenFlag[];
  fair_rent_min?: number;
  fair_rent_max?: number;
  rent_verdict?: string;
  language: string;
  created_at: string;
}

export type MessageRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  language: string;
  analysis_id?: string;
  created_at: string;
}

export interface GeneratedDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  file_url?: string;
  language: string;
  created_at: string;
}

export interface UsageInfo {
  plan: UserPlan;
  analyses_this_month: number;
  analyses_limit: number;
  chats_today: number;
  chats_limit: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
