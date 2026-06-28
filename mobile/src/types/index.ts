export type UserPlan = 'FREE' | 'PREMIUM';
export type AnalysisStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type MessageRole = 'USER' | 'ASSISTANT';

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

export interface FlagItem {
  clause: string;
  issue: string;
  law_reference?: string;
  recommendation: string;
}

export interface AnalysisListItem {
  id: string;
  file_name: string;
  status: AnalysisStatus;
  overall_score: number | null;
  emirate: string | null;
  annual_rent: number | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  file_name: string;
  file_url: string | null;
  property_type: string | null;
  emirate: string | null;
  area: string | null;
  annual_rent: number | null;
  contract_start: string | null;
  contract_end: string | null;
  status: AnalysisStatus;
  overall_score: number | null;
  summary: string | null;
  red_flags: FlagItem[] | null;
  yellow_flags: FlagItem[] | null;
  green_flags: FlagItem[] | null;
  fair_rent_min: number | null;
  fair_rent_max: number | null;
  rent_verdict: string | null;
  language: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  language: string;
  analysis_id: string | null;
  created_at: string;
}

export interface GeneratedDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  file_url: string | null;
  language: string;
  created_at: string;
}

export interface DocumentField {
  key: string;
  label: string;
}

export interface DocumentTemplate {
  type: string;
  label: string;
  desc: string;
  fields: DocumentField[];
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    type: 'rent_reduction',
    label: 'Rent Reduction Request',
    desc: 'Challenge a rent increase using the RERA Smart Rental Index.',
    fields: [
      { key: 'tenant_name', label: 'Your Full Name' },
      { key: 'landlord_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'current_rent', label: 'Current Annual Rent (AED)' },
      { key: 'requested_rent', label: 'Requested Annual Rent (AED)' },
      { key: 'reason', label: 'Reason (RERA index, market rates, etc.)' },
    ],
  },
  {
    type: 'deposit_refund',
    label: 'Security Deposit Refund Demand',
    desc: 'Formally demand the return of your security deposit.',
    fields: [
      { key: 'tenant_name', label: 'Your Full Name' },
      { key: 'landlord_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'deposit_amount', label: 'Deposit Amount (AED)' },
      { key: 'move_out_date', label: 'Move-Out Date' },
      { key: 'disputed_deductions', label: 'Disputed Deductions (if any)' },
    ],
  },
  {
    type: 'maintenance_complaint',
    label: 'Maintenance Complaint',
    desc: 'Request landlord to fix maintenance issues in writing.',
    fields: [
      { key: 'tenant_name', label: 'Your Full Name' },
      { key: 'landlord_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'issues', label: 'Issues (AC, plumbing, electric, etc.)' },
      { key: 'dates_reported', label: 'Dates Previously Reported' },
    ],
  },
  {
    type: 'notice_to_vacate',
    label: 'Notice to Vacate',
    desc: 'Formally notify your landlord you are moving out.',
    fields: [
      { key: 'tenant_name', label: 'Your Full Name' },
      { key: 'landlord_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'move_out_date', label: 'Intended Move-Out Date' },
      { key: 'contract_end_date', label: 'Contract End Date' },
    ],
  },
  {
    type: 'counter_eviction',
    label: 'Counter-Eviction Response',
    desc: 'Challenge an illegal or improper eviction notice.',
    fields: [
      { key: 'tenant_name', label: 'Your Full Name' },
      { key: 'landlord_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'eviction_reason', label: 'Stated Eviction Reason' },
      { key: 'notice_date', label: 'Notice Date' },
      { key: 'your_counter', label: 'Your Counter Argument' },
    ],
  },
  {
    type: 'rdsc_complaint',
    label: 'RDSC Complaint Letter',
    desc: 'File a complaint with the Rental Disputes Settlement Centre.',
    fields: [
      { key: 'complainant_name', label: 'Your Full Name' },
      { key: 'respondent_name', label: 'Landlord / Agent Name' },
      { key: 'property_address', label: 'Property Address' },
      { key: 'dispute_type', label: 'Type of Dispute' },
      { key: 'dispute_details', label: 'Full Details of Dispute' },
      { key: 'amount_claimed', label: 'Amount Claimed (AED, if any)' },
    ],
  },
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
  { code: 'hi', label: 'हिंदी' },
];
