const API_URL = "https://integra.cellarvinhos.com/webhook/6beff3e0-8d27-458f-84dc-6c3a2114d8e0";

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

// Interface para o departamento da API (seguindo a estrutura da API)
interface ApiDepartment {
  id?: string;
  nome: string;
  sla_id: string | null; // ID do nível SLA
  work_hour_id: string | null; // ID da jornada de trabalho
  status: number; // 1 para ativo, 0 para inativo
}

// Interface para departamento vindo da API (readAll/read)
interface ApiDepartmentResponse {
  id: string;
  name: string;
  sla_id: string | null; // ID do nível SLA
  work_hour_id: string | null; // ID da jornada de trabalho
  is_active: number; // 1 para ativo, 0 para inativo
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  sla_name?: string; // Nome do SLA (opcional, vem do JOIN)
  sla?: number; // Tempo SLA em minutos (opcional, vem do JOIN)
  work_hour_name?: string; // Nome da jornada de trabalho (opcional, vem do JOIN)
}

// Interface para o departamento local (seguindo a estrutura do schema)
interface LocalDepartment {
  id: string;
  name: string;
  slaLevelId: string | null; // ID do nível SLA
  workHourId: string | null; // ID da jornada de trabalho
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  // Campos extras do JOIN com SLA
  slaName?: string; // Nome do SLA
  slaTime?: number; // Tempo SLA em minutos
  // Campos extras do JOIN com jornada de trabalho
  workHourName?: string; // Nome da jornada de trabalho
}

// Funções de conversão entre formatos
function apiToLocal(apiDept: ApiDepartmentResponse): LocalDepartment {
  return {
    id: apiDept.id,
    name: apiDept.name,
    slaLevelId: apiDept.sla_id, // ID do nível SLA
    workHourId: apiDept.work_hour_id, // ID da jornada de trabalho
    isActive: apiDept.is_active === 1,
    createdAt: new Date(apiDept.created_at),
    updatedAt: new Date(apiDept.updated_at),
    createdBy: apiDept.created_by,
    updatedBy: apiDept.updated_by,
    slaName: apiDept.sla_name, // Nome do SLA do JOIN
    slaTime: apiDept.sla, // Tempo SLA em minutos do JOIN
    workHourName: apiDept.work_hour_name, // Nome da jornada de trabalho do JOIN
  };
}

function localToApi(localDept: Partial<LocalDepartment>): ApiDepartment {
  return {
    id: localDept.id,
    nome: localDept.name || '',
    sla_id: localDept.slaLevelId || null, // ID do nível SLA
    work_hour_id: localDept.workHourId || null, // ID da jornada de trabalho
    status: localDept.isActive ? 1 : 0,
  };
}

// Serviços da API
export const departmentsApi = {
  // Buscar todos os departamentos
  async getAll(): Promise<LocalDepartment[]> {
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

  // Buscar um departamento específico
  async getById(id: string): Promise<LocalDepartment> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo departamento
  async create(department: Omit<LocalDepartment, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalDepartment> {
    const apiDept = localToApi(department);
    const payload = {
      operation: "create",
      nome: apiDept.nome,
      sla_id: apiDept.sla_id,
      work_hour_id: apiDept.work_hour_id,
      status: apiDept.status
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar departamento existente
  async update(id: string, department: Partial<LocalDepartment>): Promise<LocalDepartment> {
    const apiDept = localToApi(department);
    const payload = {
      operation: "update",
      id: id,
      nome: apiDept.nome,
      sla_id: apiDept.sla_id,
      work_hour_id: apiDept.work_hour_id,
      status: apiDept.status
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir departamento
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};
