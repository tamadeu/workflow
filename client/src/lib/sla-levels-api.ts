const API_URL = "https://integra.cellarvinhos.com/webhook/1bdab6c7-088c-4947-950c-69390abd49bd";

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

// Interface para o nível SLA da API (seguindo a estrutura da API)
interface ApiSlaLevel {
  id?: string;
  nome: string;
  sla: number; // Em minutos (valor direto)
  status: number; // 1 para ativo, 0 para inativo
}

// Interface para nível SLA vindo da API (readAll/read)
interface ApiSlaLevelResponse {
  id: string;
  name: string;
  sla: number; // Em minutos (valor direto)
  is_active: number; // 1 para ativo, 0 para inativo
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para o nível SLA local (seguindo a estrutura do schema)
interface LocalSlaLevel {
  id: string;
  name: string;
  sla: number; // Em minutos no frontend
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

// Funções de conversão entre formatos
function apiToLocal(apiSla: ApiSlaLevelResponse): LocalSlaLevel {
  return {
    id: apiSla.id,
    name: apiSla.name,
    sla: apiSla.sla, // Valor direto em minutos, sem conversão
    isActive: apiSla.is_active === 1,
    createdAt: new Date(apiSla.created_at),
    updatedAt: new Date(apiSla.updated_at),
    createdBy: apiSla.created_by,
    updatedBy: apiSla.updated_by,
  };
}

function localToApi(localSla: Partial<LocalSlaLevel>): ApiSlaLevel {
  return {
    id: localSla.id,
    nome: localSla.name || '',
    sla: localSla.sla || 480, // Valor direto em minutos, sem conversão
    status: localSla.isActive ? 1 : 0,
  };
}

// Serviços da API
export const slaLevelsApi = {
  // Buscar todos os níveis SLA
  async getAll(): Promise<LocalSlaLevel[]> {
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

  // Buscar um nível SLA específico
  async getById(id: string): Promise<LocalSlaLevel> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo nível SLA
  async create(slaLevel: Omit<LocalSlaLevel, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalSlaLevel> {
    const apiSla = localToApi(slaLevel);
    const payload = {
      operation: "create",
      nome: apiSla.nome,
      sla: apiSla.sla,
      status: apiSla.status
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar nível SLA existente
  async update(id: string, slaLevel: Partial<LocalSlaLevel>): Promise<LocalSlaLevel> {
    const apiSla = localToApi(slaLevel);
    const payload = {
      operation: "update",
      id: id,
      nome: apiSla.nome,
      sla: apiSla.sla,
      status: apiSla.status
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir nível SLA
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
