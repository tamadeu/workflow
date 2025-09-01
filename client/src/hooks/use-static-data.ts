import { usersData } from '../data/users';
import { queuesData } from '../data/queues';
import { labelsData } from '../data/labels';
import { ticketTypesData } from '../data/ticket-types';
import { ticketsData } from '../data/tickets';
import { ticketCommentsData } from '../data/ticket-comments';
import { ticketLabelsData } from '../data/ticket-labels';
import { workSchedulesData } from '../data/work-schedules';
import type { User, Queue, Label, TicketType, Ticket, TicketComment, WorkSchedule } from '../lib/types';

// Simular delay de rede
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Users
export const useUsers = () => {
  const getUsers = async (): Promise<User[]> => {
    await delay();
    return [...usersData];
  };

  const getUser = async (id: string): Promise<User | undefined> => {
    await delay();
    return usersData.find(user => user.id === id);
  };

  const getUserByUsername = async (username: string): Promise<User | undefined> => {
    await delay();
    return usersData.find(user => user.username === username);
  };

  return { getUsers, getUser, getUserByUsername };
};

// Queues
export const useQueues = () => {
  const getQueues = async (): Promise<Queue[]> => {
    await delay();
    return [...queuesData];
  };

  const getQueue = async (id: string): Promise<Queue | undefined> => {
    await delay();
    return queuesData.find(queue => queue.id === id);
  };

  return { getQueues, getQueue };
};

// Labels
export const useLabels = () => {
  const getLabels = async (): Promise<Label[]> => {
    await delay();
    return [...labelsData];
  };

  const getLabel = async (id: string): Promise<Label | undefined> => {
    await delay();
    return labelsData.find(label => label.id === id);
  };

  return { getLabels, getLabel };
};

// Ticket Types
export const useTicketTypes = () => {
  const getTicketTypes = async (): Promise<TicketType[]> => {
    await delay();
    return [...ticketTypesData];
  };

  const getTicketType = async (id: string): Promise<TicketType | undefined> => {
    await delay();
    return ticketTypesData.find(type => type.id === id);
  };

  return { getTicketTypes, getTicketType };
};

// Tickets
export const useTickets = () => {
  const getTickets = async (filters?: any): Promise<Ticket[]> => {
    await delay();
    let filtered = [...ticketsData];
    
    if (filters?.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }
    if (filters?.assigneeId) {
      filtered = filtered.filter(ticket => ticket.assigneeId === filters.assigneeId);
    }
    if (filters?.queueId) {
      filtered = filtered.filter(ticket => ticket.queueId === filters.queueId);
    }
    
    return filtered;
  };

  const getTicket = async (id: string): Promise<Ticket | undefined> => {
    await delay();
    return ticketsData.find(ticket => ticket.id === id);
  };

  const getTicketsByParent = async (parentId: string): Promise<Ticket[]> => {
    await delay();
    return ticketsData.filter(ticket => ticket.parentId === parentId);
  };

  const getTicketsByClient = async (clientId: string): Promise<Ticket[]> => {
    await delay();
    return ticketsData.filter(ticket => ticket.requesterId === clientId);
  };

  const getTicketLabels = async (ticketId: string): Promise<string[]> => {
    await delay();
    return ticketLabelsData
      .filter(tl => tl.ticketId === ticketId)
      .map(tl => tl.labelId);
  };

  return { getTickets, getTicket, getTicketsByParent, getTicketsByClient, getTicketLabels };
};

// Ticket Comments
export const useTicketComments = () => {
  const getTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
    await delay();
    return ticketCommentsData.filter(comment => comment.ticketId === ticketId);
  };

  return { getTicketComments };
};

// Work Schedules
export const useWorkSchedules = () => {
  const getWorkSchedules = async (): Promise<WorkSchedule[]> => {
    await delay();
    return [...workSchedulesData];
  };

  const getWorkSchedule = async (id: string): Promise<WorkSchedule | undefined> => {
    await delay();
    return workSchedulesData.find(schedule => schedule.id === id);
  };

  return { getWorkSchedules, getWorkSchedule };
};

// Dashboard Stats
export const useDashboardStats = () => {
  const getDashboardStats = async () => {
    await delay();
    const openTickets = ticketsData.filter(t => t.status === 'open').length;
    const resolvedToday = ticketsData.filter(t => 
      t.status === 'resolved' && 
      t.resolvedAt && 
      new Date(t.resolvedAt).toDateString() === new Date().toDateString()
    ).length;
    
    return {
      openTickets,
      resolvedToday,
      averageTime: "2h 30m",
      slaCompliance: 94.5
    };
  };

  return { getDashboardStats };
};

// Clients (same as users but filtered)
export const useClients = () => {
  const getClients = async (): Promise<User[]> => {
    await delay();
    return usersData.filter(user => user.role === 'user');
  };

  return { getClients };
};
