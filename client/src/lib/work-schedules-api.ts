const API_URL = "https://integra.cellarvinhos.com/webhook/ef7ef6cc-d0ea-4970-8078-44b1d9b35407";

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

// Interface para a jornada de trabalho da API (seguindo a estrutura da API)
interface ApiWorkSchedule {
  id?: string;
  name: string;
  is_active: number; // 1 para ativo, 0 para inativo
  "24_7": number; // 1 para 24/7, 0 para não
  is_default: number; // 1 para padrão, 0 para não
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
}

// Interface para jornada de trabalho vindo da API (readAll/read)
interface ApiWorkScheduleResponse {
  id: string;
  name: string;
  is_active: number; // 1 para ativo, 0 para inativo
  "24_7": number; // 1 para 24/7, 0 para não
  is_default: number; // 1 para padrão, 0 para não
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
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para a jornada de trabalho local (seguindo a estrutura do schema)
interface LocalWorkSchedule {
  id: string;
  name: string;
  isActive: boolean;
  is24x7: boolean;
  isDefault: boolean;
  mondayStart: string | null;
  mondayEnd: string | null;
  tuesdayStart: string | null;
  tuesdayEnd: string | null;
  wednesdayStart: string | null;
  wednesdayEnd: string | null;
  thursdayStart: string | null;
  thursdayEnd: string | null;
  fridayStart: string | null;
  fridayEnd: string | null;
  saturdayStart: string | null;
  saturdayEnd: string | null;
  sundayStart: string | null;
  sundayEnd: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

// Funções de conversão entre formatos
function apiToLocal(apiSchedule: ApiWorkScheduleResponse): LocalWorkSchedule {
  return {
    id: apiSchedule.id,
    name: apiSchedule.name,
    isActive: apiSchedule.is_active === 1,
    is24x7: apiSchedule["24_7"] === 1,
    isDefault: apiSchedule.is_default === 1,
    mondayStart: apiSchedule.mon_start,
    mondayEnd: apiSchedule.mon_end,
    tuesdayStart: apiSchedule.tue_start,
    tuesdayEnd: apiSchedule.tue_end,
    wednesdayStart: apiSchedule.wed_start,
    wednesdayEnd: apiSchedule.wed_end,
    thursdayStart: apiSchedule.thu_start,
    thursdayEnd: apiSchedule.thu_end,
    fridayStart: apiSchedule.fri_start,
    fridayEnd: apiSchedule.fri_end,
    saturdayStart: apiSchedule.sat_start,
    saturdayEnd: apiSchedule.sat_end,
    sundayStart: apiSchedule.sun_start,
    sundayEnd: apiSchedule.sun_end,
    createdAt: new Date(apiSchedule.created_at),
    updatedAt: new Date(apiSchedule.updated_at),
    createdBy: apiSchedule.created_by,
    updatedBy: apiSchedule.updated_by,
  };
}

function localToApi(localSchedule: Partial<LocalWorkSchedule>): ApiWorkSchedule {
  return {
    id: localSchedule.id,
    name: localSchedule.name || '',
    is_active: localSchedule.isActive ? 1 : 0,
    "24_7": localSchedule.is24x7 ? 1 : 0,
    is_default: localSchedule.isDefault ? 1 : 0,
    mon_start: localSchedule.mondayStart || null,
    mon_end: localSchedule.mondayEnd || null,
    tue_start: localSchedule.tuesdayStart || null,
    tue_end: localSchedule.tuesdayEnd || null,
    wed_start: localSchedule.wednesdayStart || null,
    wed_end: localSchedule.wednesdayEnd || null,
    thu_start: localSchedule.thursdayStart || null,
    thu_end: localSchedule.thursdayEnd || null,
    fri_start: localSchedule.fridayStart || null,
    fri_end: localSchedule.fridayEnd || null,
    sat_start: localSchedule.saturdayStart || null,
    sat_end: localSchedule.saturdayEnd || null,
    sun_start: localSchedule.sundayStart || null,
    sun_end: localSchedule.sundayEnd || null,
  };
}

// Serviços da API
export const workSchedulesApi = {
  // Buscar todas as jornadas de trabalho
  async getAll(): Promise<LocalWorkSchedule[]> {
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

  // Buscar uma jornada de trabalho específica
  async getById(id: string): Promise<LocalWorkSchedule> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar nova jornada de trabalho
  async create(schedule: Omit<LocalWorkSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalWorkSchedule> {
    const apiSchedule = localToApi(schedule);
    const payload = {
      operation: "create",
      name: apiSchedule.name,
      is_active: apiSchedule.is_active,
      "24_7": apiSchedule["24_7"],
      is_default: apiSchedule.is_default,
      mon_start: apiSchedule.mon_start,
      mon_end: apiSchedule.mon_end,
      tue_start: apiSchedule.tue_start,
      tue_end: apiSchedule.tue_end,
      wed_start: apiSchedule.wed_start,
      wed_end: apiSchedule.wed_end,
      thu_start: apiSchedule.thu_start,
      thu_end: apiSchedule.thu_end,
      fri_start: apiSchedule.fri_start,
      fri_end: apiSchedule.fri_end,
      sat_start: apiSchedule.sat_start,
      sat_end: apiSchedule.sat_end,
      sun_start: apiSchedule.sun_start,
      sun_end: apiSchedule.sun_end
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar jornada de trabalho existente
  async update(id: string, schedule: Partial<LocalWorkSchedule>): Promise<LocalWorkSchedule> {
    const apiSchedule = localToApi(schedule);
    const payload = {
      operation: "update",
      id: id,
      name: apiSchedule.name,
      is_active: apiSchedule.is_active,
      "24_7": apiSchedule["24_7"],
      is_default: apiSchedule.is_default,
      mon_start: apiSchedule.mon_start,
      mon_end: apiSchedule.mon_end,
      tue_start: apiSchedule.tue_start,
      tue_end: apiSchedule.tue_end,
      wed_start: apiSchedule.wed_start,
      wed_end: apiSchedule.wed_end,
      thu_start: apiSchedule.thu_start,
      thu_end: apiSchedule.thu_end,
      fri_start: apiSchedule.fri_start,
      fri_end: apiSchedule.fri_end,
      sat_start: apiSchedule.sat_start,
      sat_end: apiSchedule.sat_end,
      sun_start: apiSchedule.sun_start,
      sun_end: apiSchedule.sun_end
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir jornada de trabalho
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  }
};

export type { LocalWorkSchedule };
