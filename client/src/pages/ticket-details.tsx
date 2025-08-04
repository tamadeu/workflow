import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  MessageCircle, 
  Paperclip, 
  Send, 
  Eye, 
  EyeOff,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Edit3,
  MoreHorizontal,
  Timer,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Ticket, TicketComment, User, Queue, Label as LabelType } from "@shared/schema";

interface TicketWithDetails extends Ticket {
  requester?: User;
  assignee?: User;
  queue?: Queue;
  labels?: LabelType[];
  comments?: (TicketComment & { author?: User })[];
}

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [showInternalComments, setShowInternalComments] = useState(true);
  const [timeSpent, setTimeSpent] = useState("");
  const { toast } = useToast();

  // Queries
  const { data: ticket, isLoading } = useQuery<TicketWithDetails>({
    queryKey: ["/api/tickets", ticketId],
    enabled: !!ticketId,
  });

  const { data: comments = [] } = useQuery<(TicketComment & { author?: User })[]>({
    queryKey: ["/api/tickets", ticketId, "comments"],
    enabled: !!ticketId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; isInternal: boolean }) => {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      setNewComment("");
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Sucesso",
        description: "Chamado atualizado com sucesso!",
      });
    },
  });

  const logTimeMutation = useMutation({
    mutationFn: async (minutes: number) => {
      const response = await fetch(`/api/tickets/${ticketId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      setTimeSpent("");
      toast({
        title: "Sucesso",
        description: "Tempo registrado com sucesso!",
      });
    },
  });

  if (isLoading || !ticket) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando detalhes do chamado...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateTicketMutation.mutate({ 
      status: newStatus,
      ...(newStatus === "resolved" && { resolvedAt: new Date().toISOString() }),
      ...(newStatus === "closed" && { closedAt: new Date().toISOString() }),
    });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTicketMutation.mutate({ assigneeId: assigneeId === "unassigned" ? null : assigneeId });
  };

  const handlePriorityChange = (priority: string) => {
    updateTicketMutation.mutate({ priority });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      content: newComment,
      isInternal,
    });
  };

  const handleLogTime = () => {
    const minutes = parseInt(timeSpent);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Erro",
        description: "Digite um tempo válido em minutos.",
        variant: "destructive",
      });
      return;
    }

    logTimeMutation.mutate(minutes);
  };

  const filteredComments = showInternalComments 
    ? comments 
    : comments.filter(c => !c.isInternal);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical": return "Crítica";
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Aberto";
      case "in_progress": return "Em Andamento";
      case "resolved": return "Resolvido";
      case "closed": return "Fechado";
      default: return status;
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

  const slaProgress = getSLAProgress();
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                data-testid="button-back"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/my-tickets")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <h1 
                  data-testid="ticket-number"
                  className="text-2xl font-bold text-gray-900"
                >
                  #{ticket.number}
                </h1>
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
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleStatusChange(ticket.isPaused ? "in_progress" : "open")}>
                    {ticket.isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Ticket Details & Comments */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            {/* Ticket Title & Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle data-testid="ticket-title" className="text-xl">
                  {ticket.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
                
                {/* Labels */}
                {ticket.labels && ticket.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
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
                        <Tag className="w-3 h-3 mr-1" />
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Conversação ({filteredComments.length})</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      <Switch
                        checked={showInternalComments}
                        onCheckedChange={setShowInternalComments}
                      />
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Notas internas</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "flex space-x-3 p-4 rounded-lg border",
                      comment.isInternal 
                        ? "bg-yellow-50 border-yellow-200" 
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className="text-sm">
                        {getInitials(comment.author?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author?.name || "Usuário"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Interno
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredComments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum comentário ainda.</p>
                    <p className="text-sm">Seja o primeiro a comentar!</p>
                  </div>
                )}
              </div>
              
              {/* Add Comment */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="space-y-3">
                  <Textarea
                    data-testid="textarea-comment"
                    placeholder="Digite seu comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={isInternal}
                          onCheckedChange={setIsInternal}
                        />
                        <label className="text-sm text-gray-600">
                          Comentário interno
                        </label>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Anexar
                      </Button>
                    </div>
                    
                    <Button
                      data-testid="button-send-comment"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {addCommentMutation.isPending ? "Enviando..." : "Enviar"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={ticket.assigneeId || "unassigned"} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger data-testid="select-assignee">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {users.filter(u => u.role === "agent" || u.role === "admin").map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* SLA Progress */}
            {ticket.slaDeadline && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Progresso SLA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span className={cn(
                        "font-medium",
                        slaProgress >= 90 ? "text-red-600" :
                        slaProgress >= 70 ? "text-yellow-600" : "text-green-600"
                      )}>
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
                    <div className="text-xs text-gray-500">
                      Prazo: {formatDate(ticket.slaDeadline)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo gasto:</span>
                  <span className="font-medium">{formatTimeSpent(ticket.timeSpent)}</span>
                </div>
                
                <Separator />
                
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Minutos"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    size="sm"
                    onClick={handleLogTime}
                    disabled={logTimeMutation.isPending}
                  >
                    <Timer className="w-3 h-3 mr-1" />
                    Log
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-gray-600">Solicitante:</div>
                    <div className="font-medium">
                      {ticket.requester?.name || `Usuário ${ticket.requesterId.slice(0, 8)}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-gray-600">Criado em:</div>
                    <div className="font-medium">{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>
                
                {ticket.queue && (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ticket.queue.color }}
                    />
                    <div>
                      <div className="text-gray-600">Fila:</div>
                      <div className="font-medium">{ticket.queue.name}</div>
                    </div>
                  </div>
                )}
                
                {ticket.assignee && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="text-xs">
                        {getInitials(ticket.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-gray-600">Responsável:</div>
                      <div className="font-medium">{ticket.assignee.name}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}