import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Eye, 
  MessageCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketWithDetails } from "@/lib/types";

interface TicketCardProps {
  ticket: TicketWithDetails;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
  onPauseToggle?: () => void;
  compact?: boolean;
}

export default function TicketCard({ 
  ticket, 
  onView, 
  onStatusChange, 
  onPauseToggle,
  compact = false 
}: TicketCardProps) {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-3 h-3" />;
      case "in_progress":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
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

  const getSLAProgress = () => {
    if (!ticket.slaDeadline) return 0;
    
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const created = new Date(ticket.createdAt);
    
    const totalTime = deadline.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    
    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  };

  const getSLAStatus = () => {
    const progress = getSLAProgress();
    if (progress >= 90) return { color: "text-red-600", status: "critical" };
    if (progress >= 70) return { color: "text-yellow-600", status: "warning" };
    return { color: "text-green-600", status: "good" };
  };

  const slaProgress = getSLAProgress();
  const slaStatus = getSLAStatus();
  const hasOverdueSLA = ticket.slaDeadline && new Date() > new Date(ticket.slaDeadline);

  const formatTimeSpent = (minutes?: number) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (compact) {
    return (
      <Card 
        data-testid={`ticket-card-${ticket.number}`}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={onView}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-sm font-medium">#{ticket.number}</span>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {getPriorityLabel(ticket.priority)}
                </Badge>
                {hasOverdueSLA && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <h3 className="font-medium text-gray-900 truncate mb-1">
                {ticket.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{ticket.queue?.name || "Sem fila"}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{getStatusLabel(ticket.status)}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      data-testid={`ticket-card-${ticket.number}`}
      className={cn(
        "hover:shadow-lg transition-all duration-200",
        hasOverdueSLA && "border-red-200 bg-red-50"
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span 
              data-testid={`ticket-number-${ticket.number}`}
              className="font-mono text-lg font-bold text-gray-900"
            >
              #{ticket.number}
            </span>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
              {getPriorityLabel(ticket.priority)}
            </Badge>
            {hasOverdueSLA && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                SLA Vencido
              </Badge>
            )}
            {ticket.isPaused && (
              <Badge variant="secondary">
                <Pause className="w-3 h-3 mr-1" />
                Pausado
              </Badge>
            )}
          </div>
          <Badge className={getStatusColor(ticket.status)}>
            {getStatusIcon(ticket.status)}
            <span className="ml-1">{getStatusLabel(ticket.status)}</span>
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 
            data-testid={`ticket-title-${ticket.number}`}
            className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
          >
            {ticket.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {ticket.description}
          </p>
        </div>

        {/* Labels */}
        {ticket.labels && ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {ticket.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                style={{
                  backgroundColor: `${label.color}20`,
                  borderColor: `${label.color}40`,
                  color: label.color,
                }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* SLA Progress */}
        {ticket.slaDeadline && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso SLA</span>
              <span className={cn("font-medium", slaStatus.color)}>
                {Math.round(slaProgress)}%
              </span>
            </div>
            <Progress 
              value={slaProgress} 
              className={cn(
                "h-2",
                slaProgress >= 90 && "bg-red-100",
                slaProgress >= 70 && slaProgress < 90 && "bg-yellow-100"
              )}
            />
          </div>
        )}

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>
              {ticket.requester?.name || `Usuário ${ticket.requesterId.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          {ticket.queue && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ticket.queue.color }}
              />
              <span>{ticket.queue.name}</span>
            </div>
          )}
          {ticket.timeSpent !== undefined && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTimeSpent(ticket.timeSpent)}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {ticket.assignee && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {getInitials(ticket.assignee.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              Atribuído para {ticket.assignee.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>0 comentários</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {ticket.isPaused ? (
              <Button
                data-testid={`button-resume-${ticket.number}`}
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onPauseToggle?.();
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Retomar
              </Button>
            ) : (
              <Button
                data-testid={`button-pause-${ticket.number}`}
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onPauseToggle?.();
                }}
              >
                <Pause className="w-3 h-3 mr-1" />
                Pausar
              </Button>
            )}
            
            <Button
              data-testid={`button-view-${ticket.number}`}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
