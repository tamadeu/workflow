import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketStatusApi } from '../lib/ticket-status-api';

// Query keys
const QUERY_KEYS = {
  ticketStatuses: ['ticketStatuses'] as const,
  ticketStatus: (id: string) => ['ticketStatuses', id] as const,
};

// Hook para buscar todos os status
export const useTicketStatusesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketStatuses,
    queryFn: ticketStatusApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados mais estáticos
  });
};

// Hook para buscar um status específico
export const useTicketStatusQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketStatus(id),
    queryFn: () => ticketStatusApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para criar um novo status
export const useCreateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketStatusApi.create,
    onSuccess: () => {
      // Invalidar a lista de status para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketStatuses });
    },
  });
};

// Hook para atualizar um status
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      ticketStatusApi.update(id, status),
    onSuccess: (data, variables) => {
      // Invalidar a lista de status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketStatuses });
      // Atualizar o status específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticketStatus(variables.id), data);
    },
  });
};

// Hook para deletar um status
export const useDeleteTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketStatusApi.delete(id),
    onSuccess: () => {
      // Invalidar a lista de status para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketStatuses });
    },
  });
};
