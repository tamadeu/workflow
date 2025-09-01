const API_URL = "https://integra.cellarvinhos.com/webhook/906a0d81-b9af-4dde-a9ac-e806cd7400be";

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

// Interface para o tipo de solicitação da API (seguindo a estrutura da API)
interface ApiRequestType {
  id?: string;
  name: string;
  description?: string;
  sla: number; // Em minutos (valor direto)
  status: number; // 1 para ativo, 0 para inativo
  department_id?: string[]; // Array de IDs de departamentos
  color: string;
}

// Interface para tipo de solicitação vindo da API (readAll/read)
interface ApiRequestTypeResponse {
  id: string;
  name: string;
  description?: string;
  sla: number; // Em minutos (valor direto)
  is_active: number; // 1 para ativo, 0 para inativo
  department_id?: string[]; // Array de IDs de departamentos
  color: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para o tipo de solicitação local (seguindo a estrutura do schema)
interface LocalRequestType {
  id: string;
  name: string;
  description?: string;
  sla: number; // Em minutos no frontend
  isActive: boolean;
  departmentIds?: string[]; // Array de IDs de departamentos
  color: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

// Funções de conversão entre formatos
function apiToLocal(apiReqType: ApiRequestTypeResponse): LocalRequestType {
  return {
    id: apiReqType.id,
    name: apiReqType.name,
    description: apiReqType.description,
    sla: apiReqType.sla, // Valor direto em minutos, sem conversão
    isActive: apiReqType.is_active === 1,
    departmentIds: apiReqType.department_id,
    color: apiReqType.color,
    createdAt: new Date(apiReqType.created_at),
    updatedAt: new Date(apiReqType.updated_at),
    createdBy: apiReqType.created_by,
    updatedBy: apiReqType.updated_by,
  };
}

function localToApi(localReqType: Partial<LocalRequestType>): ApiRequestType {
  return {
    id: localReqType.id,
    name: localReqType.name || '',
    description: localReqType.description,
    sla: localReqType.sla || 480, // Valor direto em minutos, sem conversão
    status: localReqType.isActive ? 1 : 0,
    department_id: localReqType.departmentIds,
    color: localReqType.color || '#3B82F6',
  };
}

// Serviços da API
export const requestTypesApi = {
  // Buscar todos os tipos de solicitação
  async getAll(): Promise<LocalRequestType[]> {
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

  // Buscar um tipo de solicitação específico
  async getById(id: string): Promise<LocalRequestType> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo tipo de solicitação
  async create(requestType: Omit<LocalRequestType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalRequestType> {
    const apiReqType = localToApi(requestType);
    const payload = {
      operation: "create",
      name: apiReqType.name,
      description: apiReqType.description,
      sla: apiReqType.sla,
      status: apiReqType.status,
      department_id: apiReqType.department_id,
      color: apiReqType.color
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar tipo de solicitação existente
  async update(id: string, requestType: Partial<LocalRequestType>): Promise<LocalRequestType> {
    const apiReqType = localToApi(requestType);
    const payload = {
      operation: "update",
      id: id,
      name: apiReqType.name,
      description: apiReqType.description,
      sla: apiReqType.sla,
      status: apiReqType.status,
      department_id: apiReqType.department_id,
      color: apiReqType.color
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir tipo de solicitação
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
