const API_URL = "https://integra.cellarvinhos.com/webhook/b6d4247b-cb53-4c56-8659-d8976100ba3d";

// Função para obter o token de autorização dos cookies
function getAuthToken(): string | null {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('workflow_auth_token='))
    ?.split('=')[1];
  return token || null;
}

// Função base para fazer requisições à API
async function makeApiRequest(payload: any) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Token de autorização não encontrado');
  }

  const response = await fetch(API_URL, {
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

// Interface para a prioridade da API (seguindo a estrutura da API)
interface ApiTicketPriority {
  id?: string;
  name: string;
  color?: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by?: string;
  updated_by?: string;
}

// Interface para prioridade vindo da API (readAll/read)
interface ApiTicketPriorityResponse {
  id: string;
  name: string;
  color: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para a prioridade local (seguindo a estrutura do schema)
interface LocalTicketPriority {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

// Funções de conversão entre formatos
function apiToLocal(apiPriority: ApiTicketPriorityResponse): LocalTicketPriority {
  return {
    id: apiPriority.id,
    name: apiPriority.name,
    color: apiPriority.color || "#3B82F6", // Usar cor da API ou padrão
    isActive: apiPriority.is_active === 1,
    createdAt: new Date(apiPriority.created_at),
    updatedAt: new Date(apiPriority.updated_at),
    createdBy: apiPriority.created_by,
    updatedBy: apiPriority.updated_by,
  };
}

function localToApi(localPriority: Partial<LocalTicketPriority>): ApiTicketPriority {
  return {
    id: localPriority.id,
    name: localPriority.name || '',
    color: localPriority.color,
    is_active: localPriority.isActive ? 1 : 0,
    created_by: localPriority.createdBy || undefined,
    updated_by: localPriority.updatedBy || undefined,
  };
}

// Serviços da API
export const ticketPriorityApi = {
  // Buscar todas as prioridades
  async getAll(): Promise<LocalTicketPriority[]> {
    const payload = {
      operation: "readAll"
    };
    
    const response = await makeApiRequest(payload);
    
    // A resposta deve ser um array direto
    if (Array.isArray(response)) {
      return response.map(apiToLocal);
    }
    
    // Fallback para resposta vazia
    return [];
  },

  // Buscar uma prioridade específica
  async getById(id: string): Promise<LocalTicketPriority> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar nova prioridade
  async create(priority: Omit<LocalTicketPriority, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalTicketPriority> {
    const apiPriority = localToApi(priority);
    const payload = {
      operation: "create",
      name: apiPriority.name,
      color: apiPriority.color,
      is_active: apiPriority.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar prioridade existente
  async update(id: string, priority: Partial<LocalTicketPriority>): Promise<LocalTicketPriority> {
    const apiPriority = localToApi(priority);
    const payload = {
      operation: "update",
      id: id,
      name: apiPriority.name,
      color: apiPriority.color,
      is_active: apiPriority.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir prioridade
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
