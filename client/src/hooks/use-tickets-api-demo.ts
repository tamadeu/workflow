import { ticketsApi, type LocalTicket } from '../lib/tickets-api';

// Hook simples para demonstrar o uso da API de tickets
export const useTicketsApiDemo = () => {
  
  // Exemplo de como buscar todos os tickets
  const getAllTickets = async () => {
    try {
      console.log('Buscando todos os tickets...');
      const tickets = await ticketsApi.getAll();
      console.log('Tickets encontrados:', tickets);
      return tickets;
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      throw error;
    }
  };

  // Exemplo de como buscar um ticket específico
  const getTicketById = async (id: string) => {
    try {
      console.log(`Buscando ticket com ID: ${id}`);
      const ticket = await ticketsApi.getById(id);
      console.log('Ticket encontrado:', ticket);
      return ticket;
    } catch (error) {
      console.error(`Erro ao buscar ticket ${id}:`, error);
      throw error;
    }
  };

  // Exemplo de como criar um novo ticket
  const createNewTicket = async (ticketData: {
    title: string;
    description: string;
    statusId: string;
    priorityId: string;
    requestTypeId: string;
    responsibleUserId?: string;
  }) => {
    try {
      console.log('Criando novo ticket:', ticketData);
      
      const newTicket: Omit<LocalTicket, 'id' | 'createdAt' | 'updatedAt'> = {
        title: ticketData.title,
        description: ticketData.description,
        status: {
          id: ticketData.statusId,
          name: 'Pendente', // Valor padrão, será substituído pela resposta da API
          color: '#3B82F6'
        },
        priority: {
          id: ticketData.priorityId,
          name: 'Média', // Valor padrão, será substituído pela resposta da API
          color: '#3B82F6'
        },
        requestType: {
          id: ticketData.requestTypeId,
          name: 'Tipo de Solicitação', // Valor padrão, será substituído pela resposta da API
          sla: 240,
          color: '#3B82F6'
        },
        responsibleUser: ticketData.responsibleUserId ? {
          id: ticketData.responsibleUserId,
          name: 'Usuário Responsável', // Valor padrão, será substituído pela resposta da API
          email: 'usuario@exemplo.com'
        } : undefined
      };

      const createdTicket = await ticketsApi.create(newTicket);
      console.log('Ticket criado com sucesso:', createdTicket);
      return createdTicket;
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      throw error;
    }
  };

  // Exemplo de como atualizar um ticket
  const updateTicket = async (id: string, updates: {
    title?: string;
    description?: string;
    statusId?: string;
    priorityId?: string;
    responsibleUserId?: string;
  }) => {
    try {
      console.log(`Atualizando ticket ${id}:`, updates);
      
      const updateData: Partial<LocalTicket> = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.statusId) {
        updateData.status = {
          id: updates.statusId,
          name: 'Status Atualizado',
          color: '#3B82F6'
        };
      }
      if (updates.priorityId) {
        updateData.priority = {
          id: updates.priorityId,
          name: 'Prioridade Atualizada',
          color: '#3B82F6'
        };
      }
      if (updates.responsibleUserId) {
        updateData.responsibleUser = {
          id: updates.responsibleUserId,
          name: 'Usuário Responsável',
          email: 'usuario@exemplo.com'
        };
      }

      const updatedTicket = await ticketsApi.update(id, updateData);
      console.log('Ticket atualizado com sucesso:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error(`Erro ao atualizar ticket ${id}:`, error);
      throw error;
    }
  };

  // Exemplo de como atualizar apenas o status
  const updateTicketStatus = async (id: string, statusId: string) => {
    try {
      console.log(`Atualizando status do ticket ${id} para: ${statusId}`);
      const updatedTicket = await ticketsApi.updateStatus(id, statusId);
      console.log('Status atualizado com sucesso:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error(`Erro ao atualizar status do ticket ${id}:`, error);
      throw error;
    }
  };

  // Exemplo de como atribuir um ticket
  const assignTicket = async (ticketId: string, userId: string) => {
    try {
      console.log(`Atribuindo ticket ${ticketId} para usuário: ${userId}`);
      const updatedTicket = await ticketsApi.assignTicket(ticketId, userId);
      console.log('Ticket atribuído com sucesso:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error(`Erro ao atribuir ticket ${ticketId}:`, error);
      throw error;
    }
  };

  // Exemplo de como remover atribuição
  const unassignTicket = async (ticketId: string) => {
    try {
      console.log(`Removendo atribuição do ticket: ${ticketId}`);
      const updatedTicket = await ticketsApi.unassignTicket(ticketId);
      console.log('Atribuição removida com sucesso:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error(`Erro ao remover atribuição do ticket ${ticketId}:`, error);
      throw error;
    }
  };

  // Exemplo de como excluir um ticket
  const deleteTicket = async (id: string) => {
    try {
      console.log(`Excluindo ticket: ${id}`);
      await ticketsApi.delete(id);
      console.log('Ticket excluído com sucesso');
    } catch (error) {
      console.error(`Erro ao excluir ticket ${id}:`, error);
      throw error;
    }
  };

  return {
    getAllTickets,
    getTicketById,
    createNewTicket,
    updateTicket,
    updateTicketStatus,
    assignTicket,
    unassignTicket,
    deleteTicket
  };
};
