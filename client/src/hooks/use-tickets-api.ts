import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, type LocalTicket } from '../lib/tickets-api';

// Query keys
const QUERY_KEYS = {
  tickets: ['tickets'] as const,
  ticketsMy: ['tickets', 'my'] as const,
  ticketsDepartment: ['tickets', 'department'] as const,
  ticket: (id: string) => ['tickets', id] as const,
};

// Hook para buscar todos os tickets
export const useTicketsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tickets,
    queryFn: async () => {
      try {
        const result = await ticketsApi.getAll();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Erro ao buscar todos os tickets:', error);
        return []; // Retorna array vazio em caso de erro
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar tickets do usuário atual
export const useMyTicketsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketsMy,
    queryFn: async () => {
      try {
        const result = await ticketsApi.getMy();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Erro ao buscar meus tickets:', error);
        return []; // Retorna array vazio em caso de erro
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar tickets do departamento
export const useDepartmentTicketsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ticketsDepartment,
    queryFn: async () => {
      try {
        const result = await ticketsApi.getDepartment();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Erro ao buscar tickets do departamento:', error);
        return []; // Retorna array vazio em caso de erro
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar um ticket específico
export const useTicketQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ticket(id),
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar um ticket específico com dados completos (status, priorities, users)
export const useTicketWithFullDataQuery = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ticket(id), 'fullData'],
    queryFn: () => ticketsApi.getByIdWithFullData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar um novo ticket
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: Omit<LocalTicket, 'id' | 'createdAt' | 'updatedAt'>) =>
      ticketsApi.create(ticket),
    onSuccess: () => {
      // Invalidar todas as listas de tickets para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
    },
  });
};

// Hook para atualizar um ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ticket }: { id: string; ticket: Partial<LocalTicket> }) =>
      ticketsApi.update(id, ticket),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables.id), data);
    },
  });
};

// Hook para deletar um ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: () => {
      // Invalidar todas as listas de tickets para recarregar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
    },
  });
};

// Hook para atualizar apenas o status de um ticket
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
      ticketsApi.updateStatus(id, statusId),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables.id), data);
    },
  });
};

// Hook para atender chamado (atualiza status e first_response)
export const useAttendTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId, userId }: { id: string; statusId: string; userId: string }) =>
      ticketsApi.attendTicket(id, statusId, userId),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables.id), data);
    },
  });
};

// Hook para atualizar apenas a prioridade de um ticket
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priorityId }: { id: string; priorityId: string }) =>
      ticketsApi.updatePriority(id, priorityId),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables.id), data);
    },
  });
};

// Hook para atribuir um ticket
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      ticketsApi.assignTicket(id, userId),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables.id), data);
    },
  });
};

// Hook para desatribuir um ticket
export const useUnassignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketsApi.unassignTicket(id),
    onSuccess: (data, variables) => {
      // Invalidar todas as listas de tickets
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
      // Atualizar o ticket específico no cache
      queryClient.setQueryData(QUERY_KEYS.ticket(variables), data);
    },
  });
};

// Hook para invalidar manualmente os dados dos tickets
export const useInvalidateTickets = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
    },
    invalidateTicket: (id: string) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(id) }),
    invalidateMy: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy }),
    invalidateDepartment: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment }),
  };
};

// Hook para adicionar comentário
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, content, isInternal }: { 
      ticketId: string; 
      content: string; 
      isInternal: boolean 
    }) => ticketsApi.addComment(ticketId, content, isInternal),
    onSuccess: (data, variables) => {
      // Invalidar o ticket específico para recarregar com o novo comentário
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.ticketId) });
      // Também invalidar as listas para atualizar contadores ou timestamps
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsMy });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketsDepartment });
    },
  });
};

// Hook para editar comentário
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content, isInternal, ticketId }: { 
      commentId: string; 
      content: string; 
      isInternal: boolean;
      ticketId: string;
    }) => ticketsApi.updateComment(commentId, content, isInternal),
    onSuccess: (data, variables) => {
      // Invalidar o ticket específico para recarregar com o comentário editado
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.ticketId) });
    },
  });
};

// Hook para excluir comentário
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, ticketId }: { 
      commentId: string; 
      ticketId: string;
    }) => ticketsApi.deleteComment(commentId),
    onSuccess: (data, variables) => {
      // Invalidar o ticket específico para recarregar sem o comentário excluído
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.ticketId) });
    },
  });
};
