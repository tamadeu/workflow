import { useState, useEffect } from "react";
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
  Timer,
  Tag,
  Info,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SLAIndicator from "@/components/tickets/sla-indicator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { 
  useTicketQuery, 
  useTicketWithFullDataQuery,
  useUpdateTicket,
  useUpdateTicketStatus, 
  useUpdateTicketPriority,
  useAssignTicket,
  useUnassignTicket,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
  useAttendTicket
} from "@/hooks/use-tickets-api";
import type { LocalTicket } from "@/lib/tickets-api";
import type { TicketComment, User, Queue, Label as LabelType } from "@shared/schema";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [showInternalComments, setShowInternalComments] = useState(true);
  const [mobileTab, setMobileTab] = useState("thread");
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [editingCommentIsInternal, setEditingCommentIsInternal] = useState(false);
  const isMobile = useIsMobile();

  const { toast } = useToast();
  const { user } = useUser();

  // Usar a nova API de tickets com dados completos
  const { data: ticketData, isLoading, error } = useTicketWithFullDataQuery(ticketId || "");
  const ticket = ticketData?.ticket;
  const ticketStatuses = ticketData?.statuses || [];
  const ticketPriorities = ticketData?.priorities || [];
  const availableUsers = ticketData?.users || [];
  
  const updateStatusMutation = useUpdateTicketStatus();
  const updatePriorityMutation = useUpdateTicketPriority();
  const updateTicketMutation = useUpdateTicket();
  const assignTicketMutation = useAssignTicket();
  const unassignTicketMutation = useUnassignTicket();
  const addCommentMutation = useAddComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const attendTicketMutation = useAttendTicket();

  // Filtrar comentários válidos (remover objetos vazios que podem vir da API)
  const comments = (ticket?.comments || []).filter(comment => 
    comment && 
    typeof comment === 'object' && 
    comment.id && 
    comment.content
  );

  // Inicializar valores de edição quando o ticket carregar
  useEffect(() => {
    if (ticket && !isEditingTicket) {
      setEditTitle(ticket.title);
    }
  }, [ticket, isEditingTicket]);

  // Sair do modo de edição se não há ticket carregado
  useEffect(() => {
    if (!ticket) {
      setIsEditingTicket(false);
    }
  }, [ticket]);

  // Teclas de atalho para edição
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditingTicket) {
        // Ctrl/Cmd + Enter para salvar
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          handleSaveEdit();
        }
        // Escape para cancelar
        if (event.key === 'Escape') {
          event.preventDefault();
          handleCancelEdit();
        }
      }

      // Atalhos para edição de comentários
      if (editingCommentId) {
        // Ctrl/Cmd + Enter para salvar comentário
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          handleSaveEditComment();
        }
        // Escape para cancelar edição de comentário
        if (event.key === 'Escape') {
          event.preventDefault();
          handleCancelEditComment();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingTicket, editTitle, editingCommentId, editingCommentContent]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando detalhes do chamado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar ticket: {error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/my-tickets")}
          >
            Voltar para tickets
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando detalhes do chamado...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatusId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: ticket.id, statusId: newStatusId });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleAttendTicket = async () => {
    if (!user) return;
    
    try {
      await attendTicketMutation.mutateAsync({ 
        id: ticket.id, 
        statusId: "b825f3e4-7591-11f0-8922-42010a800fc2",
        userId: user.id
      });
      toast({
        title: "Sucesso",
        description: "Chamado em atendimento!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atender chamado",
        description: "Ocorreu um erro ao iniciar o atendimento do chamado.",
        variant: "destructive",
      });
    }
  };

  // Verificar se o usuário pode atender o chamado
  const canAttendTicket = () => {
    if (!user || !ticket) return false;
    
    // Para admins, sempre pode atender
    if (user.role === "admin") return true;
    
    // Verificar se o department_id do usuário é igual ao responsible_user_department_id do ticket
    const userProfile = user as any; // Cast temporário para acessar department_id
    
    // A regra deve ser: o department_id do usuário logado deve ser igual ao responsible_user_department_id do ticket
    if (ticket.responsible_user_department_id && userProfile.department_id) {
      const canAttend = userProfile.department_id === ticket.responsible_user_department_id;
      
      return canAttend;
    }
    
    // Se não há informação de departamento do responsável, permitir apenas para admins e agentes
    return user.role === "agent" || user.role === "admin";
  };

  // Verificar se o ticket já foi iniciado (first_response não é null)
  // Verificar se a primeira resposta foi dada (se first_response não é null)
  const hasFirstResponse = () => {
    return ticket?.firstResponseAt !== null && ticket?.firstResponseAt !== undefined;
  };

  // Verificar se pode interagir com o ticket (comentários e controles)
  const canInteractWithTicket = () => {
    return hasFirstResponse() && canAttendTicket();
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      if (userId === "unassigned") {
        await unassignTicketMutation.mutateAsync(ticket.id);
      } else {
        await assignTicketMutation.mutateAsync({ id: ticket.id, userId });
      }
      toast({
        title: "Sucesso",
        description: "Responsável atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar responsável",
        description: "Ocorreu um erro ao atualizar o responsável.",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (priorityId: string) => {
    try {
      await updatePriorityMutation.mutateAsync({ id: ticket.id, priorityId });
      toast({
        title: "Sucesso",
        description: "Prioridade atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar prioridade",
        description: "Ocorreu um erro ao atualizar a prioridade.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    try {
      await addCommentMutation.mutateAsync({
        ticketId: ticket.id,
        content: newComment,
        isInternal,
      });
      
      setNewComment("");
      
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar comentário",
        description: "Ocorreu um erro ao adicionar o comentário.",
        variant: "destructive",
      });
    }
  };

  const handleStartEditComment = (comment: any) => {
    // Se já estiver editando outro comentário, cancelar a edição atual
    if (editingCommentId && editingCommentId !== comment.id) {
      handleCancelEditComment();
    }
    
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
    setEditingCommentIsInternal(comment.isInternal);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
    setEditingCommentIsInternal(false);
  };

  const handleSaveEditComment = async () => {
    if (!editingCommentId || !editingCommentContent.trim() || !ticket) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId: editingCommentId,
        content: editingCommentContent,
        isInternal: editingCommentIsInternal,
        ticketId: ticket.id,
      });
      
      setEditingCommentId(null);
      setEditingCommentContent("");
      setEditingCommentIsInternal(false);
      
      toast({
        title: "Sucesso",
        description: "Comentário atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar comentário",
        description: "Ocorreu um erro ao atualizar o comentário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!ticket) return;

    const confirmed = window.confirm("Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.");
    
    if (!confirmed) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        ticketId: ticket.id,
      });
      
      toast({
        title: "Sucesso",
        description: "Comentário excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir comentário",
        description: "Ocorreu um erro ao excluir o comentário.",
        variant: "destructive",
      });
    }
  };

  const canEditOrDeleteComment = (comment: any): boolean => {
    if (!user) return false;
    
    // Admin pode editar/excluir qualquer comentário
    if (user.role === "admin") return true;
    
    // Usuário pode editar/excluir apenas seus próprios comentários
    return comment.createdById === user.id;
  };

  const handleStartEdit = () => {
    setIsEditingTicket(true);
    setEditTitle(ticket?.title || "");
  };

  const handleCancelEdit = () => {
    setIsEditingTicket(false);
    setEditTitle(ticket?.title || "");
  };

  const handleSaveEdit = async () => {
    if (!ticket || !editTitle.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título do ticket é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTicketMutation.mutateAsync({
        id: ticket.id,
        ticket: {
          title: editTitle.trim(),
        },
      });
      
      setIsEditingTicket(false);
      
      toast({
        title: "Sucesso",
        description: "Ticket atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar ticket",
        description: "Ocorreu um erro ao atualizar o ticket.",
        variant: "destructive",
      });
    }
  };

  const filteredComments = showInternalComments 
    ? comments 
    : comments.filter(c => !c.isInternal);

  const getPriorityColor = (priorityName: string) => {
    switch (priorityName.toLowerCase()) {
      case "crítica": return "bg-red-100 text-red-800 border-red-200";
      case "alta": return "bg-orange-100 text-orange-800 border-orange-200";
      case "média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baixa": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "aberto": return "bg-blue-100 text-blue-800";
      case "em andamento": return "bg-yellow-100 text-yellow-800";
      case "resolvido": return "bg-green-100 text-green-800";
      case "fechado": return "bg-gray-100 text-gray-800";
      case "pendente": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priorityName: string) => {
    return priorityName;
  };

  const getStatusLabel = (statusName: string) => {
    return statusName;
  };

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

  const getUserNameById = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.name;
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

  const calculateTimeSpent = (createdAt: Date, updatedAt: Date) => {
    const diffInMs = updatedAt.getTime() - createdAt.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "< 1 min";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const remainingMinutes = diffInMinutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const formatTicketCode = (code: string) => {
    return `TKT-${code}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                data-testid="button-back"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/my-tickets")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 
                    data-testid="ticket-number"
                    className="text-lg sm:text-xl font-bold text-gray-900 flex-shrink-0"
                  >
                    {formatTicketCode(ticket.code)}
                  </h1>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Badge 
                      className={cn(getPriorityColor(ticket.priority.name), "text-xs")}
                      style={{ 
                        backgroundColor: ticket.priority.color + '20',
                        color: ticket.priority.color,
                        borderColor: ticket.priority.color + '40'
                      }}
                    >
                      {ticket.priority.name.toLowerCase() === "crítica" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {isMobile ? ticket.priority.name.charAt(0).toUpperCase() : getPriorityLabel(ticket.priority.name)}
                    </Badge>
                  </div>
                </div>
                <h2 
                  data-testid="ticket-title-header"
                  className="text-sm sm:text-base font-medium text-gray-700 truncate min-w-0"
                >
                  {ticket.title}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {!isEditingTicket && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  {canAttendTicket() && !hasFirstResponse() && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAttendTicket}
                      disabled={attendTicketMutation.isPending}
                    >
                      {attendTicketMutation.isPending ? "Atendendo..." : "Atender Chamado"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1",
          isMobile ? "overflow-y-auto" : "flex overflow-hidden"
        )}>
          {isMobile ? (
            /* Mobile Layout - Tabs */
            <div className="flex-1 flex flex-col pb-20">
              {/* Ticket Title & Description - Always visible */}
              <div className="bg-white border-b border-gray-200 p-4">
                {isEditingTicket && (
                  <div className="space-y-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Editando Ticket</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateTicketMutation.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateTicketMutation.isPending || !editTitle.trim()}
                        >
                          {updateTicketMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Enter</kbd> para salvar • <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> para cancelar
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg font-semibold"
                        placeholder="Digite o título do ticket..."
                      />
                    </div>
                  </div>
                )}
                
                {/* Tipo de Solicitação */}
                {!isEditingTicket && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ticket.requestType.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.requestType.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        SLA: {ticket.requestType.sla}min
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 bg-gray-50 border-b border-gray-200 rounded-none">
                  <TabsTrigger value="thread" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comentários ({filteredComments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span>Detalhes</span>
                  </TabsTrigger>
                </TabsList>

                {/* Thread Tab */}
                <TabsContent value="thread" className="flex-1 flex flex-col overflow-hidden m-0">
                  {/* Add Comment Form - Now at the top */}
                  <div className="border-b border-gray-200 p-4 bg-white">
                    <div className="space-y-3">
                      <Textarea
                        data-testid="textarea-comment"
                        placeholder="Digite seu comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!canInteractWithTicket()}
                        className="min-h-[60px] resize-none text-sm"
                      />
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={isInternal}
                            onCheckedChange={setIsInternal}
                            disabled={!canInteractWithTicket()}
                          />
                          <label className="text-xs text-gray-600">
                            Comentário interno
                          </label>
                        </div>
                        <Button
                          data-testid="button-send-comment"
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || addCommentMutation.isPending || !canInteractWithTicket()}
                          className="w-full"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {addCommentMutation.isPending ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">
                        Comentários ({filteredComments.length})
                      </h3>
                      <div className="flex items-center space-x-1">
                        <EyeOff className="w-3 h-3 text-gray-500" />
                        <Switch
                          checked={showInternalComments}
                          onCheckedChange={setShowInternalComments}
                        />
                        <Eye className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  {/* Comments List - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {filteredComments.length > 0 ? (
                      filteredComments.map((comment) => (
                        <div
                          key={comment.id}
                          className={cn(
                            "flex space-x-3 p-3 rounded-lg border",
                            comment.isInternal 
                              ? "bg-yellow-50 border-yellow-200" 
                              : "bg-white border-gray-200"
                          )}
                        >
                          <Avatar className="flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {getInitials(comment.createdByName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {comment.createdByName || "Usuário"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(comment.createdAt)}
                              </span>
                              {comment.isInternal && (
                                <Badge variant="outline" className="text-xs">
                                  Interno
                                </Badge>
                              )}
                              {/* Action buttons */}
                              {canEditOrDeleteComment(comment) && (
                                <div className="ml-auto flex items-center space-x-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStartEditComment(comment)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Editar comentário</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Excluir comentário</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border">
                                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Enter</kbd> para salvar • <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> para cancelar
                                </div>
                                <Textarea
                                  value={editingCommentContent}
                                  onChange={(e) => setEditingCommentContent(e.target.value)}
                                  className="text-sm min-h-[60px]"
                                  autoFocus
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={editingCommentIsInternal}
                                      onCheckedChange={setEditingCommentIsInternal}
                                    />
                                    <label className="text-xs text-gray-600">
                                      Interno
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEditComment}
                                      className="text-xs h-7"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditComment}
                                      disabled={!editingCommentContent.trim() || updateCommentMutation.isPending}
                                      className="text-xs h-7"
                                    >
                                      {updateCommentMutation.isPending ? "Salvando..." : "Salvar"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-700 text-sm leading-relaxed">
                                {comment.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Nenhum comentário ainda.</p>
                        <p className="text-xs">Seja o primeiro a comentar!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 m-0">
                  {/* Status Actions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Status</label>
                        <Select 
                          value={ticket.status.id} 
                          onValueChange={handleStatusChange}
                          disabled={!canInteractWithTicket()}
                        >
                          <SelectTrigger data-testid="select-status-mobile" className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ticketStatuses
                              .filter(status => status.isActive)
                              .map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Prioridade</label>
                        <Select 
                          value={ticket.priority.id} 
                          onValueChange={handlePriorityChange}
                          disabled={!canInteractWithTicket()}
                        >
                          <SelectTrigger data-testid="select-priority-mobile" className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ticketPriorities
                              .filter(priority => priority.isActive)
                              .map((priority) => (
                                <SelectItem key={priority.id} value={priority.id}>
                                  {priority.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Responsável</label>
                        <Select 
                          value={ticket.responsibleUser?.id || "unassigned"} 
                          onValueChange={handleAssigneeChange}
                          disabled={!canInteractWithTicket()}
                        >
                          <SelectTrigger data-testid="select-assignee-mobile" className="text-sm">
                            <SelectValue placeholder="Não atribuído" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Não atribuído</SelectItem>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SLA Progress */}
                  <Card>
                    <CardContent className="p-4">
                      <SLAIndicator ticket={ticket} variant="full" />
                    </CardContent>
                  </Card>

                  {/* Time Tracking */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Tempo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculateTimeSpent(ticket.createdAt, ticket.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Calculado automaticamente
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ticket Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-gray-600">Solicitante:</div>
                          <div className="font-medium">
                            {ticket.createdBy.name}
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

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-gray-600">Atualizado por:</div>
                          <div className="font-medium">{ticket.updatedBy.name}</div>
                        </div>
                      </div>
                      
                      {/* Queue info temporarily removed - not available in LocalTicket */}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Desktop Layout - Original Structure */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                {/* Comments Section - Desktop */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                  {/* Add Comment - Desktop (now at the top) */}
                  <div className="flex-shrink-0 border-b border-gray-200 p-4">
                    <div className="space-y-3">
                      <Textarea
                        data-testid="textarea-comment"
                        placeholder="Digite seu comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!canInteractWithTicket()}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isInternal}
                              onCheckedChange={setIsInternal}
                              disabled={!canInteractWithTicket()}
                            />
                            <label className="text-sm text-gray-600">
                              Comentário interno
                            </label>
                          </div>
                          <Button variant="ghost" size="sm" disabled={!canInteractWithTicket()}>
                            <Paperclip className="w-4 h-4 mr-2" />
                            Anexar
                          </Button>
                        </div>
                        <Button
                          data-testid="button-send-comment"
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || addCommentMutation.isPending || !canInteractWithTicket()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {addCommentMutation.isPending ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="flex-shrink-0 pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Comentários ({filteredComments.length})</span>
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <EyeOff className="w-4 h-4 text-gray-500" />
                          <Switch
                            checked={showInternalComments}
                            onCheckedChange={setShowInternalComments}
                          />
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Notas internas
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {/* Comments List - Desktop */}
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
                            {getInitials(comment.createdByName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {comment.createdByName || "Usuário"}
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
                            {/* Action buttons */}
                            {canEditOrDeleteComment(comment) && (
                              <div className="flex items-center space-x-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEditComment(comment)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Editar comentário</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Excluir comentário</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-3">
                              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border">
                                Pressione <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Enter</kbd> para salvar ou <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> para cancelar
                              </div>
                              <Textarea
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="min-h-[80px]"
                                autoFocus
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={editingCommentIsInternal}
                                    onCheckedChange={setEditingCommentIsInternal}
                                  />
                                  <label className="text-sm text-gray-600">
                                    Comentário interno
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={handleCancelEditComment}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleSaveEditComment}
                                    disabled={!editingCommentContent.trim() || updateCommentMutation.isPending}
                                  >
                                    {updateCommentMutation.isPending ? "Salvando..." : "Salvar"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                              </div>
                              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <span>{formatDate(comment.createdAt)}</span>
                              </div>
                            </>
                          )}
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
                </Card>
              </div>
            </div>
          )}

          {/* Sidebar - Desktop only */}
          {!isMobile && (
            <div className="bg-gray-50 border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select 
                  value={ticket.status.id} 
                  onValueChange={handleStatusChange}
                  disabled={!canInteractWithTicket()}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketStatuses
                      .filter(status => status.isActive)
                      .map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={ticket.priority.id} 
                  onValueChange={handlePriorityChange}
                  disabled={!canInteractWithTicket()}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketPriorities
                      .filter(priority => priority.isActive)
                      .map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={ticket.responsibleUser?.id || "unassigned"} 
                  onValueChange={handleAssigneeChange}
                  disabled={!canInteractWithTicket()}
                >
                  <SelectTrigger data-testid="select-assignee">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* SLA Progress - Desktop */}
            <Card>
              <CardContent className="p-6">
                <SLAIndicator ticket={ticket} variant="full" />
              </CardContent>
            </Card>

            {/* Time Tracking - Automatic Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo decorrido:</span>
                  <span className="font-medium">{calculateTimeSpent(ticket.createdAt, ticket.updatedAt)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Calculado automaticamente entre criação e última atualização
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
                      {ticket.createdBy.name}
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

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-gray-600">Atualizado por:</div>
                    <div className="font-medium">{ticket.updatedBy.name}</div>
                  </div>
                </div>
                
                      {/* Queue info temporarily removed - not available in LocalTicket */}
                
                {ticket.responsibleUser && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="text-xs">
                        {getInitials(ticket.responsibleUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-gray-600">Responsável:</div>
                      <div className="font-medium">{ticket.responsibleUser.name}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal for Desktop */}
      {!isMobile && (
        <Dialog open={isEditingTicket} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                Pressione <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Enter</kbd> para salvar ou <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> para cancelar
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg"
                  placeholder="Digite o título do ticket..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateTicketMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateTicketMutation.isPending || !editTitle.trim()}
                >
                  {updateTicketMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}