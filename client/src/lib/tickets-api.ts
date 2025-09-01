const API_URL = "https://integra.cellarvinhos.com/webhook/b7480ab6-1243-45b0-90c1-70d09ea850ca";
const THREADS_API_URL = "https://integra.cellarvinhos.com/webhook/11523780-fdec-4d87-b75e-37e123569591";

// Função para obter o token de autorização dos cookies
function getAuthToken(): string | null {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('workflow_auth_token='))
    ?.split('=')[1];
  return token || null;
}

// Função base para fazer requisições à API
async function makeApiRequest(payload: any, useThreadsApi: boolean = false) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Token de autorização não encontrado');
  }

  const apiUrl = useThreadsApi ? THREADS_API_URL : API_URL;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Interface para resposta da API de criação
export interface ApiCreateTicketResponse {
  success: boolean;
  ticket_id: string;
}

// Interface para o ticket da API (seguindo a estrutura fornecida)
export interface ApiTicket {
  id?: string;
  title: string;
  description?: string;
  status_id: string;
  priority_id: string;
  responsible_user_id?: string;
  request_type_id: string;
  department_id?: string;
}

// Interface para ticket vindo da API (readAll/read)
export interface ApiTicketResponse {
  id: string;
  code: string;
  title: string;
  status_id: string;
  status_name: string;
  status_color: string;
  priority_id: string;
  priority_name: string;
  priority_color: string;
  responsible_user_id: string;
  responsible_user_name: string;
  responsible_user_email: string;
  responsible_user_department_id?: string;
  request_type_id: string;
  request_type_name: string;
  request_type_sla: number;
  request_type_color: string;
  created_by: string;
  created_by_name: string;
  updated_by: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
  first_response?: string;
  closed_at?: string;
  work_hours_id?: string;
  first_response_deadline?: string;
  closing_deadline?: string;
}

// Interface para jornada de trabalho da API
export interface ApiWorkHours {
  id: string;
  name: string;
  is_active: number;
  "24_7": number;
  is_default: number;
  mon_start: string | null;
  mon_end: string | null;
  tue_start: string | null;
  tue_end: string | null;
  wed_start: string | null;
  wed_end: string | null;
  thu_start: string | null;
  thu_end: string | null;
  fri_start: string | null;
  fri_end: string | null;
  sat_start: string | null;
  sat_end: string | null;
  sun_start: string | null;
  sun_end: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// Interface para jornada de trabalho local
export interface LocalWorkHours {
  id: string;
  name: string;
  isActive: boolean;
  is24x7: boolean;
  isDefault: boolean;
  schedule: {
    monday: { start: string | null; end: string | null };
    tuesday: { start: string | null; end: string | null };
    wednesday: { start: string | null; end: string | null };
    thursday: { start: string | null; end: string | null };
    friday: { start: string | null; end: string | null };
    saturday: { start: string | null; end: string | null };
    sunday: { start: string | null; end: string | null };
  };
}

// Interface para thread/comentário da API
export interface ApiThread {
  id: string;
  content: string;
  internal: number; // 0 ou 1
  ticket_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  updated_by_name: string;
}

// Interface para status da API
export interface ApiStatus {
  id: string;
  name: string;
  is_active: number;
  color: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// Interface para prioridade da API
export interface ApiPriority {
  id: string;
  name: string;
  is_active: number;
  color: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// Interface para usuário da API
export interface ApiUser {
  id: string;
  first_name: string;
  last_name: string;
}

// Interface para resposta completa da API (nova estrutura)
export interface ApiTicketFullResponse {
  ticket: ApiTicketResponse;
  threads: Array<{
    json: ApiThread;
    pairedItem: { item: number };
  }>;
  status: Array<{
    json: ApiStatus;
    pairedItem: { item: number };
  }>;
  priorities: Array<{
    json: ApiPriority;
    pairedItem: { item: number };
  }>;
  users: Array<{
    json: ApiUser;
    pairedItem: { item: number };
  }>;
}

// Interface para resposta completa da API (com ticket e threads) - manter compatibilidade
export interface ApiTicketWithThreadsResponse {
  ticket: ApiTicketResponse;
  threads: Array<{
    json: ApiThread;
    pairedItem: {
      item: number;
    };
  }>;
}

// Interface para comentário local
export interface LocalComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  createdById: string;
  updatedById: string;
  createdByName: string;
  updatedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para o ticket local (seguindo a estrutura do types.ts)
export interface LocalTicket {
  id: string;
  code: string;
  title: string;
  description?: string;
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
  responsible_user_department_id?: string;
  requestType: {
    id: string;
    name: string;
    sla: number;
    color: string;
  };
  department?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;
  closedAt?: Date;
  firstResponseDeadline?: Date;
  closingDeadline?: Date;
  workHours?: LocalWorkHours;
  comments?: LocalComment[];
}

// Função para converter jornada de trabalho da API para local
function convertApiWorkHoursToLocal(apiWorkHours: ApiWorkHours): LocalWorkHours {
  return {
    id: apiWorkHours.id,
    name: apiWorkHours.name,
    isActive: apiWorkHours.is_active === 1,
    is24x7: apiWorkHours["24_7"] === 1,
    isDefault: apiWorkHours.is_default === 1,
    schedule: {
      monday: { start: apiWorkHours.mon_start, end: apiWorkHours.mon_end },
      tuesday: { start: apiWorkHours.tue_start, end: apiWorkHours.tue_end },
      wednesday: { start: apiWorkHours.wed_start, end: apiWorkHours.wed_end },
      thursday: { start: apiWorkHours.thu_start, end: apiWorkHours.thu_end },
      friday: { start: apiWorkHours.fri_start, end: apiWorkHours.fri_end },
      saturday: { start: apiWorkHours.sat_start, end: apiWorkHours.sat_end },
      sunday: { start: apiWorkHours.sun_start, end: apiWorkHours.sun_end },
    },
  };
}

// Função para calcular minutos úteis entre duas datas considerando jornada de trabalho
export function calculateBusinessMinutes(
  startDate: Date, 
  endDate: Date, 
  workHours?: LocalWorkHours
): number {
  if (!workHours || workHours.is24x7) {
    // Se não há jornada ou é 24x7, calcular tempo corrido
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  }

  let totalMinutes = 0;
  const current = new Date(startDate);
  
  // Se a data de início é fora do horário de trabalho, ajustar para o próximo horário útil
  const adjustedStart = getNextBusinessTime(current, workHours);
  current.setTime(adjustedStart.getTime());
  
  while (current < endDate) {
    const dayOfWeek = current.getDay(); // 0 = domingo, 1 = segunda, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof typeof workHours.schedule;
    
    const daySchedule = workHours.schedule[dayName];
    
    if (daySchedule.start && daySchedule.end) {
      // Criar datas para início e fim do expediente do dia atual
      const workStart = new Date(current);
      const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
      workStart.setHours(startHour, startMinute, 0, 0);
      
      const workEnd = new Date(current);
      const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
      workEnd.setHours(endHour, endMinute, 0, 0);
      
      // Determinar período efetivo dentro do horário de trabalho
      const effectiveStart = new Date(Math.max(current.getTime(), workStart.getTime()));
      const effectiveEnd = new Date(Math.min(endDate.getTime(), workEnd.getTime()));
      
      if (effectiveStart < effectiveEnd) {
        totalMinutes += Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60));
      }
    }
    
    // Avançar para o próximo dia
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  
  return totalMinutes;
}

// Função auxiliar para encontrar o próximo horário útil
function getNextBusinessTime(date: Date, workHours: LocalWorkHours): Date {
  const result = new Date(date);
  
  // Verificar até 14 dias para encontrar o próximo horário útil (evita loop infinito)
  for (let i = 0; i < 14; i++) {
    const dayOfWeek = result.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof typeof workHours.schedule;
    const daySchedule = workHours.schedule[dayName];
    
    if (daySchedule.start && daySchedule.end) {
      const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
      const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
      
      const workStart = new Date(result);
      workStart.setHours(startHour, startMinute, 0, 0);
      
      const workEnd = new Date(result);
      workEnd.setHours(endHour, endMinute, 0, 0);
      
      // Se é o mesmo dia e ainda está dentro ou antes do horário de trabalho
      if (i === 0) {
        if (result <= workEnd) {
          // Se está antes do início do expediente, retornar o início
          if (result < workStart) {
            return workStart;
          }
          // Se está dentro do expediente, retornar a hora atual
          return result;
        }
        // Se está após o expediente, tentar o próximo dia
      } else {
        // Para outros dias, retornar o início do expediente
        return workStart;
      }
    }
    
    // Avançar para o próximo dia
    result.setDate(result.getDate() + 1);
    result.setHours(0, 0, 0, 0);
  }
  
  // Fallback: retornar a data original se não encontrar horário útil
  return date;
}

// Função para calcular deadline considerando jornada de trabalho
export function calculateBusinessDeadline(
  startDate: Date, 
  minutesToAdd: number, 
  workHours?: LocalWorkHours
): Date {
  if (!workHours || workHours.is24x7) {
    // Se não há jornada ou é 24x7, adicionar tempo corrido
    return new Date(startDate.getTime() + minutesToAdd * 60 * 1000);
  }

  let remainingMinutes = minutesToAdd;
  
  // Ajustar a data de início para o próximo horário útil se necessário
  const current = getNextBusinessTime(new Date(startDate), workHours);
  
  while (remainingMinutes > 0) {
    const dayOfWeek = current.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof typeof workHours.schedule;
    
    const daySchedule = workHours.schedule[dayName];
    
    if (daySchedule.start && daySchedule.end) {
      // Criar datas para início e fim do expediente do dia atual
      const workStart = new Date(current);
      const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
      workStart.setHours(startHour, startMinute, 0, 0);
      
      const workEnd = new Date(current);
      const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
      workEnd.setHours(endHour, endMinute, 0, 0);
      
      // Determinar quando começar a contar no dia atual
      const effectiveStart = new Date(Math.max(current.getTime(), workStart.getTime()));
      
      if (effectiveStart < workEnd) {
        const availableMinutes = Math.floor((workEnd.getTime() - effectiveStart.getTime()) / (1000 * 60));
        
        if (remainingMinutes <= availableMinutes) {
          // Pode completar hoje
          return new Date(effectiveStart.getTime() + remainingMinutes * 60 * 1000);
        } else {
          // Usar todo o tempo disponível hoje e continuar no próximo dia útil
          remainingMinutes -= availableMinutes;
        }
      }
    }
    
    // Avançar para o próximo dia
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  
  return current;
}

// Funções de conversão entre formatos
function convertApiThreadToLocal(apiThread: ApiThread): LocalComment {
  // Função auxiliar para validar e converter datas
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date(); // Fallback para data atual se vazio
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Data inválida recebida no comentário: ${dateString}`);
      return new Date(); // Fallback para data atual se inválida
    }
    return date;
  };

  return {
    id: apiThread.id,
    content: apiThread.content,
    isInternal: apiThread.internal === 1,
    ticketId: apiThread.ticket_id,
    createdById: apiThread.created_by,
    updatedById: apiThread.updated_by,
    createdByName: apiThread.created_by_name,
    updatedByName: apiThread.updated_by_name,
    createdAt: parseDate(apiThread.created_at),
    updatedAt: parseDate(apiThread.updated_at),
  };
}

function apiToLocal(apiTicket: ApiTicketResponse, apiThreads?: ApiThread[], workHours?: LocalWorkHours): LocalTicket {
  // Função auxiliar para validar e converter datas
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date(); // Fallback para data atual se vazio
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Data inválida recebida: ${dateString}`);
      return new Date(); // Fallback para data atual se inválida
    }
    return date;
  };

  return {
    id: apiTicket.id,
    code: apiTicket.code,
    title: apiTicket.title,
    status: {
      id: apiTicket.status_id,
      name: apiTicket.status_name,
      color: apiTicket.status_color,
    },
    priority: {
      id: apiTicket.priority_id,
      name: apiTicket.priority_name,
      color: apiTicket.priority_color,
    },
    responsibleUser: apiTicket.responsible_user_id ? {
      id: apiTicket.responsible_user_id,
      name: apiTicket.responsible_user_name,
      email: apiTicket.responsible_user_email,
    } : undefined,
    responsible_user_department_id: apiTicket.responsible_user_department_id,
    requestType: {
      id: apiTicket.request_type_id,
      name: apiTicket.request_type_name,
      sla: apiTicket.request_type_sla,
      color: apiTicket.request_type_color,
    },
    createdBy: {
      id: apiTicket.created_by,
      name: apiTicket.created_by_name,
    },
    updatedBy: {
      id: apiTicket.updated_by,
      name: apiTicket.updated_by_name,
    },
    createdAt: parseDate(apiTicket.created_at),
    updatedAt: parseDate(apiTicket.updated_at),
    firstResponseAt: apiTicket.first_response ? parseDate(apiTicket.first_response) : undefined,
    closedAt: apiTicket.closed_at ? parseDate(apiTicket.closed_at) : undefined,
    firstResponseDeadline: apiTicket.first_response_deadline ? parseDate(apiTicket.first_response_deadline) : undefined,
    closingDeadline: apiTicket.closing_deadline ? parseDate(apiTicket.closing_deadline) : undefined,
    workHours: workHours,
    comments: apiThreads ? apiThreads.map(convertApiThreadToLocal) : [],
  };
}

function localToApi(localTicket: Partial<LocalTicket>): ApiTicket {
  return {
    id: localTicket.id,
    title: localTicket.title || '',
    description: localTicket.description,
    status_id: localTicket.status?.id || '',
    priority_id: localTicket.priority?.id || '',
    responsible_user_id: localTicket.responsibleUser?.id,
    request_type_id: localTicket.requestType?.id || '',
    department_id: localTicket.department?.id,
  };
}

// Serviços da API
export const ticketsApi = {
  // Buscar todos os tickets
  async getAll(): Promise<LocalTicket[]> {
    const payload = {
      operation: "readAll"
    };
    
    const response = await makeApiRequest(payload);
    
    // A resposta deve ser um array direto
    if (Array.isArray(response)) {
      return response.map((apiTicket: ApiTicketResponse) => apiToLocal(apiTicket, undefined, undefined));
    }
    
    // Fallback para resposta vazia
    return [];
  },

  // Buscar tickets do usuário atual
  async getMy(): Promise<LocalTicket[]> {
    const payload = {
      operation: "readMy"
    };
    
    const response = await makeApiRequest(payload);
    
    // A resposta deve ser um array direto
    if (Array.isArray(response)) {
      return response.map((apiTicket: ApiTicketResponse) => apiToLocal(apiTicket, undefined, undefined));
    }
    
    // Fallback para resposta vazia
    return [];
  },

  // Buscar tickets do departamento
  async getDepartment(): Promise<LocalTicket[]> {
    const payload = {
      operation: "readDepartment"
    };
    
    const response = await makeApiRequest(payload);
    
    // A resposta deve ser um array direto
    if (Array.isArray(response)) {
      return response.map((apiTicket: ApiTicketResponse) => apiToLocal(apiTicket, undefined, undefined));
    }
    
    // Fallback para resposta vazia
    return [];
  },

  // Buscar um ticket específico
  async getById(id: string): Promise<LocalTicket> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    
    // Verificar se a resposta tem a nova estrutura com ticket e threads
    if (response && response.ticket && response.threads) {
      const data = response as ApiTicketWithThreadsResponse;
      const threads = data.threads.map(thread => thread.json);
      return apiToLocal(data.ticket, threads, undefined);
    }
    
    // Fallback para estrutura antiga (sem threads)
    return apiToLocal(response, undefined, undefined);
  },

  // Buscar um ticket específico com dados completos (status, priorities, users)
  async getByIdWithFullData(id: string): Promise<{
    ticket: LocalTicket;
    statuses: Array<{ id: string; name: string; color: string; isActive: boolean }>;
    priorities: Array<{ id: string; name: string; color: string; isActive: boolean }>;
    users: Array<{ id: string; name: string; firstName: string; lastName: string }>;
  }> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    
    // Verificar se a resposta tem a nova estrutura completa
    if (response && response.ticket && response.threads && response.status && response.priorities && response.users) {
      const data = response as ApiTicketFullResponse;
      
      // Converter ticket
      const threads = data.threads.map(thread => thread.json);
      const ticket = apiToLocal(data.ticket, threads, undefined);
      
      // Converter status
      const statuses = data.status.map(statusItem => ({
        id: statusItem.json.id,
        name: statusItem.json.name,
        color: statusItem.json.color,
        isActive: statusItem.json.is_active === 1,
      }));
      
      // Converter prioridades
      const priorities = data.priorities.map(priorityItem => ({
        id: priorityItem.json.id,
        name: priorityItem.json.name,
        color: priorityItem.json.color,
        isActive: priorityItem.json.is_active === 1,
      }));
      
      // Converter usuários
      const users = data.users.map(userItem => ({
        id: userItem.json.id,
        name: `${userItem.json.first_name} ${userItem.json.last_name}`,
        firstName: userItem.json.first_name,
        lastName: userItem.json.last_name,
      }));
      
      return { ticket, statuses, priorities, users };
    }
    
    // Fallback para estrutura antiga
    const ticket = response && response.ticket && response.threads 
      ? apiToLocal((response as ApiTicketWithThreadsResponse).ticket, (response as ApiTicketWithThreadsResponse).threads.map(t => t.json), undefined)
      : apiToLocal(response, undefined, undefined);
    
    return { 
      ticket, 
      statuses: [], 
      priorities: [], 
      users: [] 
    };
  },

  // Criar novo ticket
  async create(ticket: Omit<LocalTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalTicket> {
    const apiTicket = localToApi(ticket);
    const payload = {
      operation: "create",
      title: apiTicket.title,
      description: apiTicket.description,
      status_id: apiTicket.status_id,
      priority_id: apiTicket.priority_id,
      responsible_user_id: apiTicket.responsible_user_id,
      request_type_id: apiTicket.request_type_id,
      department_id: apiTicket.department_id
    };
    
    const response: ApiCreateTicketResponse = await makeApiRequest(payload);
    
    // A resposta é do tipo { success: true, ticket_id: "xxx" }
    if (response.success && response.ticket_id) {
      // Retornar o ticket com os dados que temos, incluindo o ID gerado
      return {
        ...ticket,
        id: response.ticket_id,
        code: '', // Será preenchido quando buscar o ticket completo
        createdAt: new Date(),
        updatedAt: new Date(),
      } as LocalTicket;
    }
    
    throw new Error('Erro ao criar ticket: resposta inválida da API');
  },

  // Atualizar ticket existente
  async update(id: string, ticket: Partial<LocalTicket>): Promise<LocalTicket> {
    const apiTicket = localToApi(ticket);
    const payload = {
      operation: "update",
      id: id,
      title: apiTicket.title,
      status_id: apiTicket.status_id,
      priority_id: apiTicket.priority_id,
      responsible_user_id: apiTicket.responsible_user_id,
      request_type_id: apiTicket.request_type_id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Excluir ticket
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  },

  // Atualizar apenas o status do ticket
  async updateStatus(id: string, statusId: string): Promise<LocalTicket> {
    const payload = {
      operation: "update",
      id: id,
      status_id: statusId
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Atender chamado (atualiza status e popula first_response)
  async attendTicket(id: string, statusId: string, userId: string): Promise<LocalTicket> {
    const payload = {
      operation: "update",
      id: id,
      status_id: statusId,
      first_response: new Date().toISOString(),
      user_id: userId
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Atualizar apenas a prioridade do ticket
  async updatePriority(id: string, priorityId: string): Promise<LocalTicket> {
    const payload = {
      operation: "update",
      id: id,
      priority_id: priorityId
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Atribuir ticket a um usuário
  async assignTicket(id: string, userId: string): Promise<LocalTicket> {
    const payload = {
      operation: "update",
      id: id,
      responsible_user_id: userId
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Remover atribuição do ticket
  async unassignTicket(id: string): Promise<LocalTicket> {
    const payload = {
      operation: "update",
      id: id,
      responsible_user_id: null
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response, undefined, undefined);
  },

  // Adicionar comentário a um ticket
  async addComment(ticketId: string, content: string, isInternal: boolean = false): Promise<LocalComment> {
    const payload = {
      operation: "create", // Assumindo que a API suporta esta operação
      ticket_id: ticketId,
      content: content,
      internal: isInternal ? 1 : 0
    };
    
    const response = await makeApiRequest(payload, true); // Usar API de threads
    return convertApiThreadToLocal(response);
  },

  // Editar comentário de um ticket
  async updateComment(commentId: string, content: string, isInternal: boolean = false): Promise<LocalComment> {
    const payload = {
      operation: "update",
      id: commentId,
      content: content,
      internal: isInternal ? 1 : 0
    };
    
    const response = await makeApiRequest(payload, true); // Usar API de threads
    return convertApiThreadToLocal(response);
  },

  // Excluir comentário de um ticket
  async deleteComment(commentId: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: commentId
    };
    
    await makeApiRequest(payload, true); // Usar API de threads
  }
};
