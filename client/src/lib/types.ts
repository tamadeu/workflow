// Main entity types
// Types for the frontend-only version
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
}

// User profile type from localStorage
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string;
  department_id: string;
  demartment_name: string; // Mantém o typo da API
  created_at: string;
  updated_at: string;
  last_access: string;
}

export interface Queue {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
  createdAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  description: string | null;
  formConfig: any;
  isActive: boolean;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  number: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  typeId: string | null;
  queueId: string | null;
  requesterId: string;
  assigneeId: string | null;
  parentId: string | null;
  customFields: any;
  slaDeadline: Date | null;
  timeSpent: number | null;
  isPaused: boolean | null;
  pauseReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean | null;
  createdAt: Date;
}

export interface TicketLabel {
  id: string;
  ticketId: string;
  labelId: string;
}

export interface WorkSchedule {
  id: string;
  name: string;
  description: string | null;
  schedule: any;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
}

// Re-export for compatibility
export type LabelType = Label;

export interface TicketLabel {
  id: string;
  ticketId: string;
  labelId: string;
}

// Insert types
export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type InsertQueue = Omit<Queue, 'id' | 'createdAt'>;
export type InsertLabel = Omit<Label, 'id' | 'createdAt'>;
export type InsertTicketType = Omit<TicketType, 'id' | 'createdAt'>;
export type InsertTicket = Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt'>;
export type InsertTicketComment = Omit<TicketComment, 'id' | 'createdAt'>;
export type InsertWorkSchedule = Omit<WorkSchedule, 'id' | 'createdAt'>;

export interface DashboardStats {
  openTickets: number;
  resolvedToday: number;
  averageTime: string;
  slaCompliance: number;
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  queueId?: string[];
  labels?: string[];
  startDate?: string;
  endDate?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'date' | 'number' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  mask?: string;
}

export interface TicketWithDetails {
  id: string;
  number: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  typeId?: string;
  queueId?: string;
  requesterId: string;
  assigneeId?: string;
  parentId?: string;
  customFields?: Record<string, any>;
  slaDeadline?: Date;
  timeSpent?: number;
  isPaused?: boolean;
  pauseReason?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  requester?: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
  queue?: {
    id: string;
    name: string;
    color: string;
  };
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

// Interfaces específicas para a API de Tickets
export interface ApiTicket {
  id?: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  responsible_user_id?: string;
  request_type_id: string;
}

export interface ApiTicketResponse {
  id: string;
  title: string;
  description: string;
  status_id: string;
  status_name: string;
  status_color: string;
  priority_id: string;
  priority_name: string;
  priority_color: string;
  responsible_user_id: string;
  responsible_user_name: string;
  responsible_user_email: string;
  request_type_id: string;
  request_type_name: string;
  request_type_sla: number;
  request_type_color: string;
  created_at: string;
  updated_at: string;
}

export interface LocalTicket {
  id: string;
  title: string;
  description: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
  priority: {
    id: string;
    name: string;
    color: string;
  };
  responsibleUser?: {
    id: string;
    name: string;
    email: string;
  };
  requestType: {
    id: string;
    name: string;
    sla: number;
    color: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
