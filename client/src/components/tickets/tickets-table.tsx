import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Eye, Check, X, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import AdvancedFilter from "./advanced-filter";
import MobileTicketCard from "./mobile-ticket-card";
import type { Ticket, Queue, Label } from "@shared/schema";
import type { TicketFilters } from "@/lib/types";

export default function TicketsTable() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const isMobile = useIsMobile();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: queues = [] } = useQuery<Queue[]>({
    queryKey: ["/api/queues"],
  });

  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ["/api/labels"],
  });

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Crítica";
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "in_progress":
        return "Em Andamento";
      case "resolved":
        return "Resolvido";
      case "closed":
        return "Fechado";
      default:
        return status;
    }
  };

  const getQueueName = (queueId?: string) => {
    if (!queueId) return "N/A";
    const queue = queues.find(q => q.id === queueId);
    return queue?.name || "N/A";
  };

  const getSLAProgress = () => {
    // Mock SLA calculation
    return Math.floor(Math.random() * 100);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
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
                <h3 className="text-base font-semibold text-gray-900">Chamados Recentes</h3>
                <p className="text-xs text-gray-500">Últimos chamados abertos no sistema</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Chamados Recentes</h3>
                <p className="text-sm text-gray-500">Últimos chamados abertos no sistema</p>
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
            {tickets.map((ticket) => (
              <MobileTicketCard
                key={ticket.id}
                ticket={ticket}
                getPriorityLabel={getPriorityLabel}
                getPriorityVariant={getPriorityVariant}
                getStatusLabel={getStatusLabel}
                getStatusVariant={getStatusVariant}
              />
            ))}
          </div>
        ) : (
          /* Desktop View */
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fila</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const slaProgress = getSLAProgress();
                return (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <span data-testid={`ticket-id-${ticket.number}`}>
                        #{ticket.number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div 
                          data-testid={`ticket-title-${ticket.number}`}
                          className="text-sm font-medium text-gray-900 truncate"
                        >
                          {ticket.title}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            exemplo
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      Usuário #{ticket.requesterId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {getQueueName(ticket.queueId || "")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={slaProgress} className="w-16 h-2 mr-2" />
                        <span 
                          data-testid={`sla-progress-${ticket.number}`}
                          className={`text-xs ${
                            slaProgress > 80 ? 'text-red-600' : 
                            slaProgress > 60 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}
                        >
                          {slaProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/ticket/${ticket.id}`}>
                          <Button
                            data-testid={`button-view-${ticket.number}`}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          data-testid={`button-approve-${ticket.number}`}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          data-testid={`button-reject-${ticket.number}`}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
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
                Mostrando 1-{tickets.length} de {tickets.length}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="sm" disabled className="text-xs px-3">
                  ‹ Ant
                </Button>
                <div className="flex items-center space-x-1">
                  <Button variant="default" size="sm" className="bg-primary text-xs w-8 h-8 p-0">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs w-8 h-8 p-0">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs w-8 h-8 p-0">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-3">
                  Prox ›
                </Button>
              </div>
            </div>
          ) : (
            /* Desktop Pagination */
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando 1-{tickets.length} de {tickets.length} chamados
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="default" size="sm" className="bg-primary">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Próximo
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
