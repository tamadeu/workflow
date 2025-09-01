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
  getUsers(): Promise<User[]>;
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
  
  // Clients  
  getClients(): Promise<User[]>;
  getTicketsByClient(clientId: string): Promise<Ticket[]>;
  
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

  private ticketCounter: number;

  constructor() {
    this.users = new Map();
    this.queues = new Map();
    this.labels = new Map();
    this.ticketTypes = new Map();
    this.tickets = new Map();
    this.ticketComments = new Map();
    this.workSchedules = new Map();

    this.ticketCounter = 2847;
    
    this.initializeData();
  }
  
  private initializeData() {
    // Create default user
    const adminUserId = "admin-user-id";
    const defaultUser: User = {
      id: adminUserId,
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
    
    // Create additional users for testing
    const users = [
      { username: "ana.costa", email: "ana.costa@empresa.com", name: "Ana Costa", role: "agent" },
      { username: "carlos.santos", email: "carlos.santos@empresa.com", name: "Carlos Santos", role: "user" },
      { username: "maria.silva", email: "maria.silva@empresa.com", name: "Maria Silva", role: "user" },
      { username: "pedro.oliveira", email: "pedro.oliveira@empresa.com", name: "Pedro Oliveira", role: "agent" },
    ];
    
    users.forEach(u => {
      const user: User = {
        id: randomUUID(),
        username: u.username,
        email: u.email,
        password: "123456",
        name: u.name,
        role: u.role,
        avatar: null,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });
    
    // Create sample tickets with realistic data
    this.createSampleTickets();
  }
  
  private createSampleTickets() {
    const allUsers = Array.from(this.users.values());
    const allQueues = Array.from(this.queues.values());
    const allTypes = Array.from(this.ticketTypes.values());
    const allLabels = Array.from(this.labels.values());
    
    const adminUser = allUsers.find(u => u.role === "admin");
    const agentUsers = allUsers.filter(u => u.role === "agent");
    const regularUsers = allUsers.filter(u => u.role === "user");
    
    const sampleTickets = [
      {
        title: "Problema de conectividade VPN - Home Office",
        description: "Não consigo me conectar à VPN da empresa. O erro aparece logo após inserir as credenciais. Preciso acessar urgentemente os arquivos do servidor para finalizar o projeto.",
        status: "in_progress",
        priority: "high",
        queueId: allQueues[0]?.id, // TI - Infraestrutura
        typeId: allTypes[0]?.id, // Incidente
        requesterId: regularUsers[0]?.id,
        assigneeId: agentUsers[0]?.id,
        labels: [allLabels.find(l => l.name === "urgente")?.id, allLabels.find(l => l.name === "rede")?.id],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
      },
      {
        title: "Solicitação de novo notebook para desenvolvedor",
        description: "Preciso de um novo notebook com as seguintes especificações mínimas: 16GB RAM, SSD 512GB, processador i7. O atual está apresentando lentidão e travamentos frequentes.",
        status: "open",
        priority: "medium",
        queueId: allQueues[0]?.id,
        typeId: allTypes[1]?.id, // Solicitação
        requesterId: regularUsers[1]?.id,
        labels: [allLabels.find(l => l.name === "hardware")?.id],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        slaDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
      },
      {
        title: "Sistema de email fora do ar",
        description: "O sistema de email corporativo está apresentando instabilidade. Mensagens não estão sendo enviadas nem recebidas. Isso está impactando toda a equipe comercial.",
        status: "resolved",
        priority: "critical",
        queueId: allQueues[0]?.id,
        typeId: allTypes[0]?.id,
        requesterId: adminUser?.id,
        assigneeId: agentUsers[1]?.id,
        labels: [allLabels.find(l => l.name === "urgente")?.id, allLabels.find(l => l.name === "software")?.id],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
      },
      {
        title: "Redefinição de senha - Sistema financeiro",
        description: "Não consigo acessar o sistema financeiro após a última atualização. Minha senha não está sendo aceita.",
        status: "open",
        priority: "medium",
        queueId: allQueues[4]?.id, // Financeiro
        typeId: allTypes[1]?.id,
        requesterId: regularUsers[0]?.id,
        labels: [allLabels.find(l => l.name === "acesso")?.id],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
        slaDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 horas
      },
      {
        title: "Instalação de software AutoCAD",
        description: "Solicitação de instalação do AutoCAD 2024 na máquina da equipe de engenharia. Licença já foi adquirida pelo departamento.",
        status: "in_progress",
        priority: "low",
        queueId: allQueues[1]?.id, // TI - Suporte
        typeId: allTypes[1]?.id,
        requesterId: regularUsers[1]?.id,
        assigneeId: agentUsers[0]?.id,
        labels: [allLabels.find(l => l.name === "software")?.id, allLabels.find(l => l.name === "rotina")?.id],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 horas
      }
    ];
    
    sampleTickets.forEach((ticketData, index) => {
      const ticketId = randomUUID();
      const ticket: Ticket = {
        id: ticketId,
        number: ++this.ticketCounter,
        title: ticketData.title,
        description: ticketData.description,
        status: ticketData.status,
        priority: ticketData.priority,
        typeId: ticketData.typeId || null,
        queueId: ticketData.queueId || null,
        requesterId: ticketData.requesterId || adminUser?.id || "",
        assigneeId: ticketData.assigneeId || null,
        parentId: null,
        customFields: null,
        labels: ticketData.labels ? ticketData.labels.filter(Boolean) : null,
        slaDeadline: ticketData.slaDeadline || null,
        timeSpent: 0,
        isPaused: false,
        pauseReason: null,
        createdAt: ticketData.createdAt,
        updatedAt: ticketData.createdAt,
        resolvedAt: ticketData.resolvedAt || null,
        closedAt: null,
      };
      
      this.tickets.set(ticketId, ticket);
      
      // Create comments for each ticket
      this.createTicketComments(ticketId, ticketData, allUsers);
    });
  }
  
  private createTicketComments(ticketId: string, ticketData: any, users: User[]) {
    const requester = users.find(u => u.id === ticketData.requesterId);
    const assignee = users.find(u => u.id === ticketData.assigneeId);
    const admin = users.find(u => u.role === "admin");
    
    // Comment from requester (initial)
    const initialComment: TicketComment = {
      id: randomUUID(),
      ticketId,
      authorId: requester?.id || admin?.id || "",
      content: "Chamado criado. Aguardando análise da equipe técnica.",
      isInternal: false,
      createdAt: ticketData.createdAt,
    };
    this.ticketComments.set(initialComment.id, initialComment);
    
    // Response from agent (if assigned)
    if (assignee && ticketData.status !== "open") {
      const agentResponse: TicketComment = {
        id: randomUUID(),
        ticketId,
        authorId: assignee.id,
        content: `Chamado atribuído para mim. Analisando o problema reportado. ${
          ticketData.priority === "critical" ? "Iniciando investigação imediata devido à criticidade." : 
          ticketData.priority === "high" ? "Priorizando este chamado devido à alta prioridade." :
          "Investigação iniciada conforme procedimento padrão."
        }`,
        isInternal: false,
        createdAt: new Date(ticketData.createdAt.getTime() + 30 * 60 * 1000), // 30 min depois
      };
      this.ticketComments.set(agentResponse.id, agentResponse);
      
      // Internal note from agent
      const internalNote: TicketComment = {
        id: randomUUID(),
        ticketId,
        authorId: assignee.id,
        content: `Nota interna: ${
          ticketData.title.includes("VPN") ? "Verificando logs do servidor VPN. Possível problema de certificado." :
          ticketData.title.includes("notebook") ? "Consultando catálogo de equipamentos aprovados. Verificando orçamento disponível." :
          ticketData.title.includes("email") ? "Problema identificado no servidor de email. Aplicando correção." :
          ticketData.title.includes("senha") ? "Verificando políticas de segurança antes de redefinir credenciais." :
          "Analisando requisitos técnicos e dependências."
        }`,
        isInternal: true,
        createdAt: new Date(ticketData.createdAt.getTime() + 45 * 60 * 1000), // 45 min depois
      };
      this.ticketComments.set(internalNote.id, internalNote);
      
      // Progress update
      if (ticketData.status === "in_progress") {
        const progressUpdate: TicketComment = {
          id: randomUUID(),
          ticketId,
          authorId: assignee.id,
          content: `Atualização: ${
            ticketData.title.includes("VPN") ? "Identificamos que o certificado do servidor VPN expirou. Renovando o certificado e testando a conectividade." :
            ticketData.title.includes("AutoCAD") ? "Software baixado. Iniciando processo de instalação. Tempo estimado: 1 hora." :
            "Progresso da análise em andamento. Mais detalhes em breve."
          }`,
          isInternal: false,
          createdAt: new Date(ticketData.createdAt.getTime() + 2 * 60 * 60 * 1000), // 2 horas depois
        };
        this.ticketComments.set(progressUpdate.id, progressUpdate);
      }
      
      // Resolution comment for resolved tickets
      if (ticketData.status === "resolved") {
        const resolutionComment: TicketComment = {
          id: randomUUID(),
          ticketId,
          authorId: assignee.id,
          content: `✅ Chamado resolvido! ${
            ticketData.title.includes("email") ? "Problema no servidor de email foi corrigido. Aplicamos patch de segurança e reiniciamos os serviços. Sistema funcionando normalmente." :
            "Solução aplicada com sucesso."
          }\n\nPor favor, teste e confirme se o problema foi solucionado. Caso persista, reabra o chamado.`,
          isInternal: false,
          createdAt: ticketData.resolvedAt || new Date(ticketData.createdAt.getTime() + 4 * 60 * 60 * 1000),
        };
        this.ticketComments.set(resolutionComment.id, resolutionComment);
        
        // User confirmation
        const userConfirmation: TicketComment = {
          id: randomUUID(),
          ticketId,
          authorId: requester?.id || admin?.id || "",
          content: "Confirmado! O problema foi resolvido. Muito obrigado pela agilidade e eficiência da equipe! 👍",
          isInternal: false,
          createdAt: new Date((ticketData.resolvedAt || ticketData.createdAt).getTime() + 30 * 60 * 1000),
        };
        this.ticketComments.set(userConfirmation.id, userConfirmation);
      }
    }
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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
  
  async getTicket(id: string): Promise<any> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    // Get related data
    const requester = await this.getUser(ticket.requesterId);
    const assignee = ticket.assigneeId ? await this.getUser(ticket.assigneeId) : undefined;
    const queue = ticket.queueId ? await this.getQueue(ticket.queueId) : undefined;
    
    // Get labels - ticket.labels contains label IDs
    const labels = ticket.labels ? 
      (await Promise.all(ticket.labels.map(labelId => this.getLabel(labelId)))).filter(Boolean) : 
      [];

    return {
      ...ticket,
      requester,
      assignee,
      queue,
      labels
    };
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
      isInternal: insertComment.isInternal || false,
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
  
  async getClients(): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    const allTickets = Array.from(this.tickets.values());
    
    // Calculate ticket statistics for each user
    return allUsers.map(user => {
      const userTickets = allTickets.filter(ticket => ticket.requesterId === user.id);
      const openTickets = userTickets.filter(ticket => 
        ticket.status === "open" || ticket.status === "in_progress"
      ).length;
      const lastTicket = userTickets
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      return {
        ...user,
        openTickets,
        totalTickets: userTickets.length,
        lastTicketDate: lastTicket ? lastTicket.createdAt.toISOString() : undefined
      };
    }).filter(user => user.totalTickets > 0); // Only show users with tickets
  }
  
  async getTicketsByClient(clientId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .filter(ticket => ticket.requesterId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
