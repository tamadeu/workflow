import { 
  type User, 
  type InsertUser, 
  type Queue, 
  type InsertQueue,
  type Label,
  type InsertLabel,
  type TicketType,
  type InsertTicketType,
  type Ticket,
  type InsertTicket,
  type TicketComment,
  type InsertTicketComment,
  type WorkSchedule,
  type InsertWorkSchedule,
  type InventoryItem,
  type InsertInventoryItem
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Queues
  getQueues(): Promise<Queue[]>;
  getQueue(id: string): Promise<Queue | undefined>;
  createQueue(queue: InsertQueue): Promise<Queue>;
  updateQueue(id: string, queue: Partial<Queue>): Promise<Queue | undefined>;
  deleteQueue(id: string): Promise<boolean>;
  
  // Labels
  getLabels(): Promise<Label[]>;
  getLabel(id: string): Promise<Label | undefined>;
  createLabel(label: InsertLabel): Promise<Label>;
  updateLabel(id: string, label: Partial<Label>): Promise<Label | undefined>;
  deleteLabel(id: string): Promise<boolean>;
  
  // Ticket Types
  getTicketTypes(): Promise<TicketType[]>;
  getTicketType(id: string): Promise<TicketType | undefined>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  updateTicketType(id: string, ticketType: Partial<TicketType>): Promise<TicketType | undefined>;
  
  // Tickets
  getTickets(filters?: any): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  getTicketsByParent(parentId: string): Promise<Ticket[]>;
  
  // Ticket Comments
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  
  // Work Schedules
  getWorkSchedules(): Promise<WorkSchedule[]>;
  getWorkSchedule(id: string): Promise<WorkSchedule | undefined>;
  createWorkSchedule(schedule: InsertWorkSchedule): Promise<WorkSchedule>;
  updateWorkSchedule(id: string, schedule: Partial<WorkSchedule>): Promise<WorkSchedule | undefined>;
  
  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    openTickets: number;
    resolvedToday: number;
    averageTime: string;
    slaCompliance: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private queues: Map<string, Queue>;
  private labels: Map<string, Label>;
  private ticketTypes: Map<string, TicketType>;
  private tickets: Map<string, Ticket>;
  private ticketComments: Map<string, TicketComment>;
  private workSchedules: Map<string, WorkSchedule>;
  private inventoryItems: Map<string, InventoryItem>;
  private ticketCounter: number;

  constructor() {
    this.users = new Map();
    this.queues = new Map();
    this.labels = new Map();
    this.ticketTypes = new Map();
    this.tickets = new Map();
    this.ticketComments = new Map();
    this.workSchedules = new Map();
    this.inventoryItems = new Map();
    this.ticketCounter = 2847;
    
    this.initializeData();
  }
  
  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@empresa.com",
      password: "admin123",
      role: "admin",
      name: "João Silva",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Create default queues
    const queues = [
      { name: "TI - Infraestrutura", description: "Problemas de infraestrutura", color: "#3B82F6" },
      { name: "TI - Suporte", description: "Suporte técnico geral", color: "#10B981" },
      { name: "RH - Recursos Humanos", description: "Questões de RH", color: "#F59E0B" },
      { name: "Facilities", description: "Infraestrutura física", color: "#8B5CF6" },
      { name: "Financeiro", description: "Questões financeiras", color: "#EF4444" },
    ];
    
    queues.forEach(q => {
      const queue: Queue = {
        id: randomUUID(),
        name: q.name,
        description: q.description,
        color: q.color,
        isActive: true,
        createdAt: new Date(),
      };
      this.queues.set(queue.id, queue);
    });
    
    // Create default labels
    const labels = [
      { name: "urgente", color: "#EF4444" },
      { name: "hardware", color: "#10B981" },
      { name: "rede", color: "#3B82F6" },
      { name: "software", color: "#8B5CF6" },
      { name: "acesso", color: "#F59E0B" },
      { name: "rotina", color: "#6B7280" },
    ];
    
    labels.forEach(l => {
      const label: Label = {
        id: randomUUID(),
        name: l.name,
        color: l.color,
        description: null,
        createdAt: new Date(),
      };
      this.labels.set(label.id, label);
    });
    
    // Create default ticket types
    const ticketTypes = [
      { name: "Incidente", description: "Problema que afeta o serviço" },
      { name: "Solicitação", description: "Solicitação de serviço" },
      { name: "Problema", description: "Causa raiz de incidentes" },
      { name: "Mudança", description: "Solicitação de mudança" },
    ];
    
    ticketTypes.forEach(t => {
      const type: TicketType = {
        id: randomUUID(),
        name: t.name,
        description: t.description,
        formConfig: null,
        isActive: true,
        createdAt: new Date(),
      };
      this.ticketTypes.set(type.id, type);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      avatar: insertUser.avatar || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async getQueues(): Promise<Queue[]> {
    return Array.from(this.queues.values());
  }
  
  async getQueue(id: string): Promise<Queue | undefined> {
    return this.queues.get(id);
  }
  
  async createQueue(insertQueue: InsertQueue): Promise<Queue> {
    const id = randomUUID();
    const queue: Queue = {
      ...insertQueue,
      id,
      color: insertQueue.color || "#3B82F6",
      description: insertQueue.description || null,
      isActive: insertQueue.isActive !== undefined ? insertQueue.isActive : true,
      createdAt: new Date()
    };
    this.queues.set(id, queue);
    return queue;
  }
  
  async updateQueue(id: string, updates: Partial<Queue>): Promise<Queue | undefined> {
    const queue = this.queues.get(id);
    if (!queue) return undefined;
    
    const updated = { ...queue, ...updates };
    this.queues.set(id, updated);
    return updated;
  }
  
  async deleteQueue(id: string): Promise<boolean> {
    return this.queues.delete(id);
  }
  
  async getLabels(): Promise<Label[]> {
    return Array.from(this.labels.values());
  }
  
  async getLabel(id: string): Promise<Label | undefined> {
    return this.labels.get(id);
  }
  
  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const id = randomUUID();
    const label: Label = {
      ...insertLabel,
      id,
      color: insertLabel.color || "#3B82F6",
      description: insertLabel.description || null,
      createdAt: new Date()
    };
    this.labels.set(id, label);
    return label;
  }
  
  async updateLabel(id: string, updates: Partial<Label>): Promise<Label | undefined> {
    const label = this.labels.get(id);
    if (!label) return undefined;
    
    const updated = { ...label, ...updates };
    this.labels.set(id, updated);
    return updated;
  }
  
  async deleteLabel(id: string): Promise<boolean> {
    return this.labels.delete(id);
  }
  
  async getTicketTypes(): Promise<TicketType[]> {
    return Array.from(this.ticketTypes.values());
  }
  
  async getTicketType(id: string): Promise<TicketType | undefined> {
    return this.ticketTypes.get(id);
  }
  
  async createTicketType(insertTicketType: InsertTicketType): Promise<TicketType> {
    const id = randomUUID();
    const ticketType: TicketType = {
      ...insertTicketType,
      id,
      description: insertTicketType.description || null,
      formConfig: insertTicketType.formConfig || null,
      isActive: insertTicketType.isActive !== undefined ? insertTicketType.isActive : true,
      createdAt: new Date()
    };
    this.ticketTypes.set(id, ticketType);
    return ticketType;
  }
  
  async updateTicketType(id: string, updates: Partial<TicketType>): Promise<TicketType | undefined> {
    const ticketType = this.ticketTypes.get(id);
    if (!ticketType) return undefined;
    
    const updated = { ...ticketType, ...updates };
    this.ticketTypes.set(id, updated);
    return updated;
  }
  
  async getTickets(filters?: any): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());
    
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(t => filters.status.includes(t.status));
      }
      if (filters.priority) {
        tickets = tickets.filter(t => filters.priority.includes(t.priority));
      }
      if (filters.queueId) {
        tickets = tickets.filter(t => filters.queueId.includes(t.queueId));
      }
    }
    
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }
  
  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      ...insertTicket,
      id,
      number: ++this.ticketCounter,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      typeId: insertTicket.typeId || null,
      queueId: insertTicket.queueId || null,
      assigneeId: insertTicket.assigneeId || null,
      parentId: insertTicket.parentId || null,
      customFields: insertTicket.customFields || null,
      slaDeadline: insertTicket.slaDeadline || null,
      timeSpent: insertTicket.timeSpent || 0,
      isPaused: insertTicket.isPaused || false,
      pauseReason: insertTicket.pauseReason || null,
      resolvedAt: insertTicket.resolvedAt || null,
      closedAt: insertTicket.closedAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }
  
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updated = { 
      ...ticket, 
      ...updates, 
      updatedAt: new Date()
    };
    this.tickets.set(id, updated);
    return updated;
  }
  
  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }
  
  async getTicketsByParent(parentId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(t => t.parentId === parentId);
  }
  
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return Array.from(this.ticketComments.values())
      .filter(c => c.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const id = randomUUID();
    const comment: TicketComment = {
      ...insertComment,
      id,
      isInternal: insertComment.isInternal || null,
      createdAt: new Date()
    };
    this.ticketComments.set(id, comment);
    return comment;
  }
  
  async getWorkSchedules(): Promise<WorkSchedule[]> {
    return Array.from(this.workSchedules.values());
  }
  
  async getWorkSchedule(id: string): Promise<WorkSchedule | undefined> {
    return this.workSchedules.get(id);
  }
  
  async createWorkSchedule(insertSchedule: InsertWorkSchedule): Promise<WorkSchedule> {
    const id = randomUUID();
    const schedule: WorkSchedule = {
      ...insertSchedule,
      id,
      description: insertSchedule.description || null,
      isActive: insertSchedule.isActive !== undefined ? insertSchedule.isActive : true,
      timezone: insertSchedule.timezone || "America/Sao_Paulo",
      createdAt: new Date()
    };
    this.workSchedules.set(id, schedule);
    return schedule;
  }
  
  async updateWorkSchedule(id: string, updates: Partial<WorkSchedule>): Promise<WorkSchedule | undefined> {
    const schedule = this.workSchedules.get(id);
    if (!schedule) return undefined;
    
    const updated = { ...schedule, ...updates };
    this.workSchedules.set(id, updated);
    return updated;
  }
  
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }
  
  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = {
      ...insertItem,
      id,
      status: insertItem.status || "available",
      description: insertItem.description || null,
      customFields: insertItem.customFields || null,
      serialNumber: insertItem.serialNumber || null,
      assignedToId: insertItem.assignedToId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventoryItems.set(id, item);
    return item;
  }
  
  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updated = { 
      ...item, 
      ...updates, 
      updatedAt: new Date()
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }
  
  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
  
  async getDashboardStats(): Promise<{
    openTickets: number;
    resolvedToday: number;
    averageTime: string;
    slaCompliance: number;
  }> {
    const allTickets = Array.from(this.tickets.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const openTickets = allTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
    const resolvedToday = allTickets.filter(t => 
      t.resolvedAt && 
      t.resolvedAt >= today
    ).length;
    
    return {
      openTickets,
      resolvedToday,
      averageTime: "2.4h",
      slaCompliance: 94.2
    };
  }
}

export const storage = new MemStorage();
