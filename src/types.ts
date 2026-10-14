export type UserRole = 'admin' | 'sales';
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  department?: string;
  createdAt: string;
}

export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'Advertisement'
  | 'Social Media'
  | 'Email'
  | 'Phone'
  | 'Other';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Converted';

export type Priority = 'Low' | 'Medium' | 'High';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  interest: string;
  status: LeadStatus;
  priority: Priority;
  estimatedValue: number;
  assignedTo: string; // User ID
  assignedUserName?: string;
  notes: string;
  isConverted?: boolean;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = 'Active' | 'Inactive' | 'VIP' | 'Churned';

export interface Customer {
  _id: string;
  leadId?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  assignedTo: string; // User ID
  assignedUserName?: string;
  totalValue: number;
  convertedAt?: string;
  notes?: string;
  address?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  _id: string;
  title: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  value: number;
  stage: DealStage;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  assignedTo: string; // User ID
  assignedUserName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'StatusChange';

export interface Activity {
  _id: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName?: string;
  dealId?: string;
  type: ActivityType;
  title: string;
  description: string;
  performedBy: string; // User ID
  performedByName?: string;
  timestamp: string;
  outcome?: string;
  createdAt: string;
}

export type TaskType = 'Call' | 'Email' | 'Meeting' | 'FollowUp' | 'Proposal' | 'Task';
export type TaskStatus = 'Pending' | 'Completed' | 'Overdue';

export interface Task {
  _id: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  assignedTo: string; // User ID
  assignedUserName?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lead' | 'deal' | 'task' | 'conversion' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  customers: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  pendingFollowups: number;
  pipelineValue: number;
  leadConversionRate: number;
  pipelineStages: {
    stage: LeadStatus;
    count: number;
    value: number;
  }[];
}

export interface AnalyticsData {
  leadStats: {
    total: number;
    new: number;
    qualified: number;
    won: number;
    lost: number;
    converted: number;
    conversionRate: number;
    bySource: { source: string; count: number }[];
  };
  dealStats: {
    total: number;
    won: number;
    lost: number;
    active: number;
    totalRevenue: number;
    expectedRevenue: number;
    byStage: { stage: string; count: number; value: number }[];
    monthlyRevenue: { month: string; revenue: number; dealsCount: number }[];
  };
  employeeStats: {
    userId: string;
    userName: string;
    avatar?: string;
    leadsAssigned: number;
    qualifiedLeads: number;
    dealsWon: number;
    dealsLost: number;
    revenueGenerated: number;
  }[];
}
