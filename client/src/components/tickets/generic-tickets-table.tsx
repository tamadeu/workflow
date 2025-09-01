import { useState } from "react";
import { Link } from "wouter";
import { Eye, Check, X, Loader2, ChevronLeft, ChevronRight, Filter, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SLAIndicator from "./sla-indicator";
import MobileTicketCard from "./mobile-ticket-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTicketStatus, useAssignTicket } from "@/hooks/use-tickets-api";
import type { LocalTicket } from "@/lib/tickets-api";

interface GenericTicketsTableProps {
  tickets: LocalTicket[];
  title: string;
  subtitle: string;
  isLoading?: boolean;
  error?: Error | null;
  showActions?: boolean;
  itemsPerPage?: number;
}

export default function GenericTicketsTable({
  tickets = [],
  title,
  subtitle,
  isLoading = false,
  error = null,
  showActions = true,
  itemsPerPage = 5
}: GenericTicketsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const updateStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignTicket();

  const getPriorityVariant = (priorityName: string) => {
    switch (priorityName.toLowerCase()) {
      case "crítica":
        return "destructive";
      case "alta":
        return "destructive";
      case "média":
        return "default";
      case "baixa":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusVariant = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "aberto":
        return "default";
      case "em andamento":
        return "default";
      case "resolvido":
        return "secondary";
      case "fechado":
        return "outline";
      case "pendente":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priorityName: string) => {
    return priorityName; // A API já retorna os nomes em português
  };

  const getStatusLabel = (statusName: string) => {
    return statusName; // A API já retorna os nomes em português
  };

  const getResponsibleUserName = (ticket: LocalTicket) => {
    if (ticket.responsibleUser) {
      return ticket.responsibleUser.name;
    }
    return "Não atribuído";
  };

  const formatTicketCode = (code: string) => {
    return `TKT-${code}`;
  };

  const handleStatusUpdate = async (ticketId: string, newStatusId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: ticketId, statusId: newStatusId });
      toast({
        title: "Status atualizado",
        description: "O status do ticket foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do ticket.",
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const totalItems = tickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = tickets.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2 py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando tickets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar tickets: {error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        {isMobile ? (
          /* Mobile Header - Compact */
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-3 py-2 h-8"
              >
                <Filter className="w-3 h-3 mr-1" />
                Filtro Avançado
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-3 py-2 h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Header */
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">
                {totalItems} {subtitle}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtro Avançado
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile View */}
      {isMobile ? (
        <div className="p-4">
          {paginatedTickets.map((ticket) => (
            <MobileTicketCard
              key={ticket.id}
              ticket={ticket}
              getPriorityLabel={(name: string) => getPriorityLabel(name)}
              getPriorityVariant={(name: string) => getPriorityVariant(name)}
              getStatusLabel={(name: string) => getStatusLabel(name)}
              getStatusVariant={(name: string) => getStatusVariant(name)}
            />
          ))}
        </div>
      ) : (
        /* Desktop View */
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo de Solicitação</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                {showActions && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket) => {
                return (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <span>
                        {formatTicketCode(ticket.code)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: ticket.requestType?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-900">
                          {ticket.requestType?.name || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {getResponsibleUserName(ticket)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getPriorityVariant(ticket.priority?.name || '')}
                        style={{ 
                          backgroundColor: ticket.priority?.color ? ticket.priority.color + '20' : undefined,
                          color: ticket.priority?.color || undefined,
                          borderColor: ticket.priority?.color ? ticket.priority.color + '40' : undefined
                        }}
                      >
                        {getPriorityLabel(ticket.priority?.name || 'N/A')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(ticket.status?.name || '')}
                        style={{ 
                          backgroundColor: ticket.status?.color ? ticket.status.color + '20' : undefined,
                          color: ticket.status?.color || undefined,
                          borderColor: ticket.status?.color ? ticket.status.color + '40' : undefined
                        }}
                      >
                        {getStatusLabel(ticket.status?.name || 'N/A')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.firstResponseDeadline && ticket.closingDeadline ? (
                        <SLAIndicator ticket={ticket} variant="table" />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/ticket/${ticket.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {ticket.status?.name?.toLowerCase() !== "resolvido" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusUpdate(ticket.id, "resolved-status-id")}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {ticket.status?.name?.toLowerCase() === "aberto" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusUpdate(ticket.id, "closed-status-id")}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="px-6 py-4 border-t border-gray-200">
        {isMobile ? (
          /* Mobile Pagination - Compact */
          <div className="flex flex-col space-y-3">
            <div className="text-sm text-gray-500 text-center">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="text-xs px-3"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Ant
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">{currentPage}</span>
                <span className="text-sm text-gray-500">de {totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="text-xs px-3"
              >
                Prox
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Pagination */
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} chamados
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNumber)}
                    className="w-8"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
