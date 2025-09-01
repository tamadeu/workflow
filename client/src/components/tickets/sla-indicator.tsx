import React from "react";
import { Clock, AlertTriangle, CheckCircle, Timer, Building, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LocalTicket } from "@/lib/tickets-api";

interface SLAIndicatorProps {
  ticket: LocalTicket;
  variant?: "compact" | "full" | "table";
  className?: string;
}

interface SLAInfo {
  responseProgress: number;
  resolutionProgress: number;
  responseStatus: "ok" | "warning" | "critical" | "overdue";
  resolutionStatus: "ok" | "warning" | "critical" | "overdue";
  responseTimeRemaining: string;
  resolutionTimeRemaining: string;
  responseDeadline?: Date;
  resolutionDeadline?: Date;
}

export default function SLAIndicator({ ticket, variant = "compact", className }: SLAIndicatorProps) {
  const calculateSLAInfo = (ticket: LocalTicket): SLAInfo => {
    const now = new Date();
    
    // Função auxiliar para calcular progresso baseado em timestamps
    const calculateProgress = (createdAt: Date, deadline?: Date, completedAt?: Date): number => {
      if (!deadline) return 0;
      
      const totalTime = deadline.getTime() - createdAt.getTime();
      const elapsedTime = (completedAt || now).getTime() - createdAt.getTime();
      
      if (totalTime <= 0) return 100;
      return Math.min(100, (elapsedTime / totalTime) * 100);
    };
    
    // Função auxiliar para determinar status baseado no progresso
    const getStatus = (progress: number): "ok" | "warning" | "critical" | "overdue" => {
      if (progress >= 100) return "overdue";
      if (progress >= 85) return "critical";
      if (progress >= 70) return "warning";
      return "ok";
    };
    
    // Função auxiliar para formatar tempo restante
    const formatTimeRemaining = (deadline?: Date, completedAt?: Date): string => {
      if (!deadline) return "N/A";
      if (completedAt) return "Concluído";
      
      const remaining = deadline.getTime() - now.getTime();
      if (remaining <= 0) return "Vencido";
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };
    
    // Calcular SLA de Primeira Resposta
    const responseProgress = Math.round(calculateProgress(
      ticket.createdAt, 
      ticket.firstResponseDeadline, 
      ticket.firstResponseAt
    ) * 10) / 10; // Arredondar para 1 casa decimal
    const responseStatus = getStatus(responseProgress);
    const responseTimeRemaining = formatTimeRemaining(ticket.firstResponseDeadline, ticket.firstResponseAt);
    
    // Calcular SLA de Resolução
    const resolutionProgress = Math.round(calculateProgress(
      ticket.createdAt, 
      ticket.closingDeadline, 
      ticket.closedAt
    ) * 10) / 10; // Arredondar para 1 casa decimal
    const resolutionStatus = getStatus(resolutionProgress);
    const resolutionTimeRemaining = formatTimeRemaining(ticket.closingDeadline, ticket.closedAt);
    
    return {
      responseProgress,
      resolutionProgress,
      responseStatus,
      resolutionStatus,
      responseTimeRemaining,
      resolutionTimeRemaining,
      responseDeadline: ticket.firstResponseDeadline,
      resolutionDeadline: ticket.closingDeadline,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok": return "text-green-600 bg-green-50 border-green-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical": return "text-orange-600 bg-orange-50 border-orange-200";
      case "overdue": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "ok": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-orange-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const ProgressWithColor = ({ value, status, className }: { value: number; status: string; className?: string }) => (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div 
        className={cn("h-full transition-all", getProgressColor(status))}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  const slaInfo = calculateSLAInfo(ticket);

  if (variant === "table") {
    // Versão compacta para tabela
    const criticalSLA = (!ticket.closedAt && slaInfo.resolutionStatus === "overdue") || (!ticket.firstResponseAt && slaInfo.responseStatus === "overdue");
    const warningSLA = (!ticket.closedAt && slaInfo.resolutionStatus === "critical") || (!ticket.firstResponseAt && slaInfo.responseStatus === "critical");
    
    return (
      <div className={cn("space-y-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <div className="w-16 space-y-1">
                <ProgressWithColor 
                  value={slaInfo.resolutionProgress} 
                  status={slaInfo.resolutionStatus}
                  className="h-1.5"
                />
                <div className="text-xs text-center">
                  <span className={cn(
                    "font-medium",
                    slaInfo.resolutionStatus === "overdue" ? "text-red-600" :
                    slaInfo.resolutionStatus === "critical" ? "text-orange-600" :
                    slaInfo.resolutionStatus === "warning" ? "text-yellow-600" :
                    "text-green-600"
                  )}>
                    {slaInfo.resolutionProgress}%
                  </span>
                </div>
              </div>
              {(criticalSLA || warningSLA) && (
                <AlertTriangle className={cn(
                  "w-3 h-3",
                  criticalSLA ? "text-red-500" : "text-orange-500"
                )} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-64">
            <div className="space-y-2">
              <div className="font-medium">Status dos SLAs</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    Primeira Resposta:
                  </span>
                  <span className={cn(
                    "font-medium",
                    ticket.firstResponseAt ? "text-green-600" :
                    slaInfo.responseStatus === "overdue" ? "text-red-600" : "text-yellow-600"
                  )}>
                    {ticket.firstResponseAt ? "✓ Respondido" : slaInfo.responseTimeRemaining}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    Resolução:
                  </span>
                  <span className={cn(
                    "font-medium",
                    ticket.closedAt ? "text-green-600" :
                    slaInfo.resolutionStatus === "overdue" ? "text-red-600" : "text-yellow-600"
                  )}>
                    {ticket.closedAt ? "✓ Resolvido" : slaInfo.resolutionTimeRemaining}
                  </span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (variant === "compact") {
    // Versão compacta para cards móveis
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="flex items-center space-x-1">
          <Timer className="w-3 h-3 text-gray-500" />
          <Badge 
            variant="outline" 
            className={cn("text-xs", getStatusColor(slaInfo.resolutionStatus))}
          >
            {slaInfo.resolutionProgress}%
          </Badge>
        </div>
        {((!ticket.closedAt && slaInfo.resolutionStatus === "overdue") || (!ticket.firstResponseAt && slaInfo.responseStatus === "overdue")) && (
          <AlertTriangle className="w-3 h-3 text-red-500" />
        )}
      </div>
    );
  }

  // Versão completa para detalhes do ticket
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2">
        <Timer className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Status dos SLAs</h4>
      </div>
      
      <div className="space-y-4">
        {/* SLA de Primeira Resposta */}
        <div className="p-3 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                SLA de Primeira Resposta
              </span>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-xs", getStatusColor(slaInfo.responseStatus))}
            >
              {ticket.firstResponseAt ? "✓ Respondido" : slaInfo.responseTimeRemaining}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <ProgressWithColor 
              value={slaInfo.responseProgress} 
              status={ticket.firstResponseAt ? "ok" : slaInfo.responseStatus}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Prazo: 4 horas {ticket.workHours ? `(${ticket.workHours.is24x7 ? '24x7' : 'Horário Comercial'})` : '(Departamento)'}</span>
              <span className={cn(
                "font-medium",
                ticket.firstResponseAt ? "text-green-600" :
                slaInfo.responseStatus === "overdue" ? "text-red-600" :
                slaInfo.responseStatus === "critical" ? "text-orange-600" :
                slaInfo.responseStatus === "warning" ? "text-yellow-600" :
                "text-green-600"
              )}>
                {slaInfo.responseProgress}%
              </span>
            </div>
            {ticket.firstResponseAt ? (
              <div className="text-xs text-green-600 font-medium">
                Respondido em: {ticket.firstResponseAt.toLocaleDateString('pt-BR')} às {ticket.firstResponseAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Prazo final: {slaInfo.responseDeadline ? 
                  `${slaInfo.responseDeadline.toLocaleDateString('pt-BR')} às ${slaInfo.responseDeadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` :
                  'N/A'
                }
              </div>
            )}
          </div>
        </div>

        {/* SLA de Resolução */}
        <div className="p-3 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                SLA de Resolução
              </span>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-xs", getStatusColor(slaInfo.resolutionStatus))}
            >
              {ticket.closedAt ? "✓ Resolvido" : slaInfo.resolutionTimeRemaining}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <ProgressWithColor 
              value={slaInfo.resolutionProgress} 
              status={ticket.closedAt ? "ok" : slaInfo.resolutionStatus}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Prazo: {ticket.requestType.sla}min {ticket.workHours ? `(${ticket.workHours.is24x7 ? '24x7' : 'Horário Comercial'})` : '(Tipo de Solicitação)'}</span>
              <span className={cn(
                "font-medium",
                ticket.closedAt ? "text-green-600" :
                slaInfo.resolutionStatus === "overdue" ? "text-red-600" :
                slaInfo.resolutionStatus === "critical" ? "text-orange-600" :
                slaInfo.resolutionStatus === "warning" ? "text-yellow-600" :
                "text-green-600"
              )}>
                {slaInfo.resolutionProgress}%
              </span>
            </div>
            {ticket.closedAt ? (
              <div className="text-xs text-green-600 font-medium">
                Resolvido em: {ticket.closedAt.toLocaleDateString('pt-BR')} às {ticket.closedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Prazo final: {slaInfo.resolutionDeadline ? 
                  `${slaInfo.resolutionDeadline.toLocaleDateString('pt-BR')} às ${slaInfo.resolutionDeadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` :
                  'N/A'
                }
              </div>
            )}
          </div>
        </div>

        {/* Status Geral */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            {((!ticket.closedAt && slaInfo.resolutionStatus === "overdue") || (!ticket.firstResponseAt && slaInfo.responseStatus === "overdue")) ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : ((!ticket.closedAt && slaInfo.resolutionStatus === "critical") || (!ticket.firstResponseAt && slaInfo.responseStatus === "critical")) ? (
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {((!ticket.closedAt && slaInfo.resolutionStatus === "overdue") || (!ticket.firstResponseAt && slaInfo.responseStatus === "overdue")) ? 
                "SLA Vencido" :
                ((!ticket.closedAt && slaInfo.resolutionStatus === "critical") || (!ticket.firstResponseAt && slaInfo.responseStatus === "critical")) ?
                "SLA Crítico" :
                "SLA em Dia"
              }
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {ticket.workHours && !ticket.workHours.is24x7 && (
              <div className="mt-1">Jornada: {ticket.workHours.name}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
