import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  useUsers, 
  useQueues, 
  useLabels, 
  useTicketTypes, 
  useTickets, 
  useTicketComments, 
  useWorkSchedules, 
  useDashboardStats, 
  useClients 
} from '../hooks/use-static-data';

// Simular delay de rede
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Instanciar os hooks uma vez
const usersHook = useUsers();
const queuesHook = useQueues();
const labelsHook = useLabels();
const ticketTypesHook = useTicketTypes();
const ticketsHook = useTickets();
const ticketCommentsHook = useTicketComments();
const workSchedulesHook = useWorkSchedules();
const dashboardStatsHook = useDashboardStats();
const clientsHook = useClients();

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  await delay();
  
  // Simular resposta baseada na URL e método
  let responseData: any = null;
  
  // Parse da URL para extrair o endpoint
  const endpoint = url.replace('/api', '');
  
  switch (method) {
    case 'GET':
      switch (endpoint) {
        case '/users':
          responseData = await usersHook.getUsers();
          break;
        case '/queues':
          responseData = await queuesHook.getQueues();
          break;
        case '/labels':
          responseData = await labelsHook.getLabels();
          break;
        case '/ticket-types':
          responseData = await ticketTypesHook.getTicketTypes();
          break;
        case '/tickets':
          responseData = await ticketsHook.getTickets();
          break;
        case '/work-schedules':
          responseData = await workSchedulesHook.getWorkSchedules();
          break;
        case '/dashboard/stats':
          responseData = await dashboardStatsHook.getDashboardStats();
          break;
        case '/clients':
          responseData = await clientsHook.getClients();
          break;
        default:
          // Handle dynamic endpoints like /tickets/:id
          if (endpoint.startsWith('/tickets/')) {
            const ticketId = endpoint.split('/')[2];
            if (endpoint.endsWith('/comments')) {
              responseData = await ticketCommentsHook.getTicketComments(ticketId);
            } else {
              responseData = await ticketsHook.getTicket(ticketId);
            }
          } else if (endpoint.startsWith('/users/')) {
            const userId = endpoint.split('/')[2];
            responseData = await usersHook.getUser(userId);
          } else if (endpoint.startsWith('/queues/')) {
            const queueId = endpoint.split('/')[2];
            responseData = await queuesHook.getQueue(queueId);
          } else {
            responseData = null;
          }
      }
      break;
      
    case 'POST':
      // Para criação, retornar o objeto criado com um ID gerado
      if (data) {
        responseData = {
          id: `generated-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
      }
      break;
      
    case 'PUT':
    case 'PATCH':
      // Para atualização, retornar o objeto atualizado
      if (data) {
        responseData = {
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      break;
      
    case 'DELETE':
      // Para deleção, retornar sucesso
      responseData = { success: true };
      break;
  }

  // Simular resposta HTTP
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async <T>({ queryKey }: { queryKey: readonly unknown[] }) => {
    await delay();
    
    const endpoint = (queryKey.join("/") as string).replace('/api', '');
    
    switch (endpoint) {
      case '/users':
        return (await usersHook.getUsers()) as T;
      case '/queues':
        return (await queuesHook.getQueues()) as T;
      case '/labels':
        return (await labelsHook.getLabels()) as T;
      case '/ticket-types':
        return (await ticketTypesHook.getTicketTypes()) as T;
      case '/tickets':
        return (await ticketsHook.getTickets()) as T;
      case '/work-schedules':
        return (await workSchedulesHook.getWorkSchedules()) as T;
      case '/dashboard/stats':
        return (await dashboardStatsHook.getDashboardStats()) as T;
      case '/clients':
        return (await clientsHook.getClients()) as T;
      default:
        // Handle dynamic endpoints
        if (endpoint.startsWith('/tickets/')) {
          const parts = endpoint.split('/');
          const ticketId = parts[2];
          if (endpoint.endsWith('/comments')) {
            return (await ticketCommentsHook.getTicketComments(ticketId)) as T;
          } else {
            return (await ticketsHook.getTicket(ticketId)) as T;
          }
        } else if (endpoint.startsWith('/users/')) {
          const userId = endpoint.split('/')[2];
          return (await usersHook.getUser(userId)) as T;
        } else if (endpoint.startsWith('/queues/')) {
          const queueId = endpoint.split('/')[2];
          return (await queuesHook.getQueue(queueId)) as T;
        }
        return null as T;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
