const API_URL = "https://integra.cellarvinhos.com/webhook/ea6be20a-7df5-4782-9e69-69e530d2cc68";

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

// Interface para o rótulo da API (seguindo a estrutura da API)
interface ApiLabel {
  id?: string;
  name: string;
  color?: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by?: string;
  updated_by?: string;
}

// Interface para rótulo vindo da API (readAll/read)
interface ApiLabelResponse {
  id: string;
  name: string;
  color: string;
  is_active: number; // 1 para ativo, 0 para inativo
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para o rótulo local (seguindo a estrutura do schema)
interface LocalLabel {
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
function apiToLocal(apiLabel: ApiLabelResponse): LocalLabel {
  return {
    id: apiLabel.id,
    name: apiLabel.name,
    color: apiLabel.color || "#3B82F6", // Usar cor da API ou padrão
    isActive: apiLabel.is_active === 1,
    createdAt: new Date(apiLabel.created_at),
    updatedAt: new Date(apiLabel.updated_at),
    createdBy: apiLabel.created_by,
    updatedBy: apiLabel.updated_by,
  };
}

function localToApi(localLabel: Partial<LocalLabel>): ApiLabel {
  return {
    id: localLabel.id,
    name: localLabel.name || '',
    color: localLabel.color,
    is_active: localLabel.isActive ? 1 : 0,
    created_by: localLabel.createdBy || undefined,
    updated_by: localLabel.updatedBy || undefined,
  };
}

// Serviços da API
export const labelsApi = {
  // Buscar todos os rótulos
  async getAll(): Promise<LocalLabel[]> {
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

  // Buscar um rótulo específico
  async getById(id: string): Promise<LocalLabel> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo rótulo
  async create(label: Omit<LocalLabel, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalLabel> {
    const apiLabel = localToApi(label);
    const payload = {
      operation: "create",
      name: apiLabel.name,
      color: apiLabel.color,
      is_active: apiLabel.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar rótulo existente
  async update(id: string, label: Partial<LocalLabel>): Promise<LocalLabel> {
    const apiLabel = localToApi(label);
    const payload = {
      operation: "update",
      id: id,
      name: apiLabel.name,
      color: apiLabel.color,
      is_active: apiLabel.is_active
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir rótulo
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
