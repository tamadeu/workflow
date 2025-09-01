const API_URL = "https://integra.cellarvinhos.com/webhook/bddf6639-fa3f-43d2-949c-babc44fd13c6";

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

// Interface para o usuário da API (seguindo a estrutura da API)
interface ApiUser {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string;
  department_id: string;
}

// Interface para usuário vindo da API (readAll/read)
interface ApiUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string;
  department_id: string;
  demartment_name: string; // Note: typo no original mantido por compatibilidade
  created_at: string;
  updated_at: string;
  last_access: string;
}

// Interface para o usuário local (seguindo a estrutura do schema)
interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccess: Date;
  fullName: string;
  password?: string;
}

// Interface com estatísticas (para exibição na lista)
export interface UserWithStats extends LocalUser {
  openTickets: number;
  totalTickets: number;
  lastTicketDate?: string;
}

// Funções de conversão entre formatos
function apiToLocal(apiUser: ApiUserResponse): LocalUser {
  return {
    id: apiUser.id,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    email: apiUser.email,
    role: apiUser.role,
    phone: apiUser.phone,
    departmentId: apiUser.department_id,
    departmentName: apiUser.demartment_name, // Mantém o typo original
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
    lastAccess: new Date(apiUser.last_access),
    fullName: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
  };
}

function localToApi(localUser: Partial<LocalUser>): ApiUser {
  return {
    id: localUser.id,
    first_name: localUser.firstName || '',
    last_name: localUser.lastName || '',
    email: localUser.email || '',
    role: localUser.role || 'user',
    phone: localUser.phone || '',
    department_id: localUser.departmentId || '',
  };
}

// Serviços da API
export const usersApi = {
  // Buscar todos os usuários
  async getAll(): Promise<LocalUser[]> {
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

  // Buscar um usuário específico
  async getById(id: string): Promise<LocalUser> {
    const payload = {
      operation: "read",
      id: id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Criar novo usuário
  async create(user: Omit<LocalUser, 'id' | 'createdAt' | 'updatedAt' | 'lastAccess' | 'fullName' | 'departmentName'> & { password: string }): Promise<LocalUser> {
    const apiUser = localToApi(user);
    const payload = {
      operation: "create",
      first_name: apiUser.first_name,
      last_name: apiUser.last_name,
      email: apiUser.email,
      role: apiUser.role,
      phone: apiUser.phone,
      department_id: apiUser.department_id,
      password: user.password
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Atualizar usuário existente
  async update(id: string, user: Partial<LocalUser>): Promise<LocalUser> {
    const apiUser = localToApi(user);
    const payload = {
      operation: "update",
      id: id,
      first_name: apiUser.first_name,
      last_name: apiUser.last_name,
      email: apiUser.email,
      role: apiUser.role,
      phone: apiUser.phone,
      department_id: apiUser.department_id
    };
    
    const response = await makeApiRequest(payload);
    return apiToLocal(response);
  },

  // Excluir usuário
  async delete(id: string): Promise<void> {
    const payload = {
      operation: "delete",
      id: id
    };
    
    await makeApiRequest(payload);
  },

  // Atualizar senha do usuário
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const payload = {
      operation: "updatePassword",
      id: id,
      password: newPassword
    };
    
    await makeApiRequest(payload);
  },

  // Alterar senha do usuário (com validação da senha atual)
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const payload = {
      operation: "changePassword",
      id: id,
      currentPassword: currentPassword,
      newPassword: newPassword
    };
    
    await makeApiRequest(payload);
  }
};

// Funções auxiliares mantidas para compatibilidade
export const fetchUsers = async (): Promise<LocalUser[]> => {
  return usersApi.getAll();
};

export const fetchUserById = async (userId: string): Promise<LocalUser | null> => {
  try {
    return await usersApi.getById(userId);
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Função para transformar usuários em usuários com estatísticas
// Por enquanto retorna dados mock para as estatísticas até que tenhamos endpoints para tickets por usuário
export const transformToUserWithStats = (users: LocalUser[]): UserWithStats[] => {
  return users.map(user => ({
    ...user,
    openTickets: Math.floor(Math.random() * 10), // Mock - será substituído por dados reais
    totalTickets: Math.floor(Math.random() * 50) + 10, // Mock - será substituído por dados reais
    lastTicketDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock - últimos 30 dias
  }));
};

export const getRoleLabel = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "Administrador";
    case "agent":
      return "Agente";
    case "user":
      return "Usuário";
    case "manager":
      return "Gerente";
    default:
      return role;
  }
};

export const getRoleVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "destructive";
    case "agent":
      return "default";
    case "manager":
      return "secondary";
    case "user":
      return "outline";
    default:
      return "outline";
  }
};
