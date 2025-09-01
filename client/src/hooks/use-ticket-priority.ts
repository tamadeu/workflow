import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketPriorityApi } from '../lib/ticket-priority-api';

// Query keys
const QUERY_KEYS = {
  ticketPriorities: ['ticketPriorities'] as const,
  ticketPriority: (id: string) => ['ticketPriorities', id] as const,
};

// Hook para buscar todas as prioridades
export const useTicketPrioritiesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketPriorities,
    queryFn: ticketPriorityApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados mais estáticos
  });
};

// Hook para buscar uma prioridade específica
export const useTicketPriorityQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketPriority(id),
    queryFn: () => ticketPriorityApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para criar uma nova prioridade
export const useCreateTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketPriorityApi.create,
    onSuccess: () => {
      // Invalidar a lista de prioridades para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketPriorities });
    },
  });
};

// Hook para atualizar uma prioridade
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: any }) =>
      ticketPriorityApi.update(id, priority),
    onSuccess: (data, variables) => {
      // Invalidar a lista de prioridades
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketPriorities });
      // Atualizar a prioridade específica no cache
      queryClient.setQueryData(QUERY_KEYS.ticketPriority(variables.id), data);
    },
  });
};

// Hook para deletar uma prioridade
export const useDeleteTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketPriorityApi.delete(id),
    onSuccess: () => {
      // Invalidar a lista de prioridades para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketPriorities });
    },
  });
};
