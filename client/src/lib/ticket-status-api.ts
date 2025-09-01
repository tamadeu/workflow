const API_URL = "https://integra.cellarvinhos.com/webhook/edeb369f-15d1-4867-b15f-a84d75ee715f";

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

// Interface para o status da API (seguindo a estrutura da API)
interface ApiTicketStatus {
  id?: string;
  name: string;
  color?: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by?: string;
  updated_by?: string;
}

// Interface para status vindo da API (readAll/read)
interface ApiTicketStatusResponse {
  id: string;
  name: string;
  color: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para o status local (seguindo a estrutura do schema)
interface LocalTicketStatus {
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
function apiToLocal(apiStatus: ApiTicketStatusResponse): LocalTicketStatus {
  return {
    id: apiStatus.id,
    name: apiStatus.name,
    color: apiStatus.color || "#3B82F6", // Usar cor da API ou padrão
    isActive: apiStatus.is_active === 1,
    createdAt: new Date(apiStatus.created_at),
    updatedAt: new Date(apiStatus.updated_at),
    createdBy: apiStatus.created_by,
    updatedBy: apiStatus.updated_by,
  };
}

function localToApi(localStatus: Partial<LocalTicketStatus>): ApiTicketStatus {
  return {
    id: localStatus.id,
    name: localStatus.name || '',
    color: localStatus.color,
    is_active: localStatus.isActive ? 1 : 0,
    created_by: localStatus.createdBy || undefined,
    updated_by: localStatus.updatedBy || undefined,
  };
}

// Serviços da API
export const ticketStatusApi = {
  // Buscar todos os status
  async getAll(): Promise<LocalTicketStatus[]> {
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

  // Buscar um status específico
  async getById(id: string): Promise<LocalTicketStatus> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo status
  async create(status: Omit<LocalTicketStatus, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalTicketStatus> {
    const apiStatus = localToApi(status);
    const payload = {
      operation: "create",
      name: apiStatus.name,
      color: apiStatus.color,
      is_active: apiStatus.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar status existente
  async update(id: string, status: Partial<LocalTicketStatus>): Promise<LocalTicketStatus> {
    const apiStatus = localToApi(status);
    const payload = {
      operation: "update",
      id: id,
      name: apiStatus.name,
      color: apiStatus.color,
      is_active: apiStatus.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir status
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
