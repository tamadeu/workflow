import { useState } from "react";
import { Link } from "wouter";
import { Eye, Check, X, Filter, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import AdvancedFilter from "./advanced-filter";
import MobileTicketCard from "./mobile-ticket-card";
import SLAIndicator from "./sla-indicator";
import { 
  useTicketsQuery, 
  useUpdateTicketStatus,
  useAssignTicket 
} from "@/hooks/use-tickets-api";
import type { LocalTicket } from "@/lib/tickets-api";
import type { TicketFilters } from "@/lib/types";

export default function TicketsTable() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Usar a nova API de tickets
  const { data: tickets = [], isLoading, error } = useTicketsQuery();
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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          {isMobile ? (
            /* Mobile Header - Compact */
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Chamados da API</h3>
                <p className="text-xs text-gray-500">Chamados carregados da API externa</p>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  data-testid="button-advanced-filter"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilter(true)}
                  className="text-xs px-3 py-2 h-8"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Filtro Avançado
                </Button>
                <Button
                  data-testid="button-export"
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
                <h3 className="text-lg font-semibold text-gray-900">Chamados da API</h3>
                <p className="text-sm text-gray-500">
                  {totalItems} chamados carregados da API externa
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  data-testid="button-advanced-filter"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilter(true)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filtro Avançado
                </Button>
                <Button
                  data-testid="button-export"
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket) => {
                return (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <span data-testid={`ticket-code-${ticket.id}`}>
                        {formatTicketCode(ticket.code)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div 
                          data-testid={`ticket-title-${ticket.id}`}
                          className="text-sm font-medium text-gray-900 truncate"
                        >
                          {ticket.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: ticket.requestType.color }}
                        />
                        <span className="text-sm text-gray-900">
                          {ticket.requestType.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {getResponsibleUserName(ticket)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getPriorityVariant(ticket.priority.name)}
                        style={{ 
                          backgroundColor: ticket.priority.color + '20',
                          color: ticket.priority.color,
                          borderColor: ticket.priority.color + '40'
                        }}
                      >
                        {getPriorityLabel(ticket.priority.name)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(ticket.status.name)}
                        style={{ 
                          backgroundColor: ticket.status.color + '20',
                          color: ticket.status.color,
                          borderColor: ticket.status.color + '40'
                        }}
                      >
                        {getStatusLabel(ticket.status.name)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SLAIndicator ticket={ticket} variant="table" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/ticket/${ticket.id}`}>
                          <Button
                            data-testid={`button-view-${ticket.id}`}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {ticket.status.name.toLowerCase() !== "resolvido" && (
                          <Button
                            data-testid={`button-approve-${ticket.id}`}
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
                        <Button
                          data-testid={`button-reject-${ticket.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(ticket.id, "rejected-status-id")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(currentPage - 1 + i, totalPages));
                    return (
                      <Button 
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => goToPage(pageNum)}
                        className={`text-xs w-8 h-8 p-0 ${currentPage === pageNum ? "bg-primary" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
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
                  const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                  return (
                    <Button 
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"} 
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={currentPage === pageNum ? "bg-primary" : ""}
                    >
                      {pageNum}
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

      <AdvancedFilter
        open={showAdvancedFilter}
        onOpenChange={setShowAdvancedFilter}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </>
  );
}
