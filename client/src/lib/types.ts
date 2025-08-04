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
