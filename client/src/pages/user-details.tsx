import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, User, Phone, Mail, Building2, Calendar, Clock, Edit, MoreHorizontal, Eye, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { usersApi, getRoleLabel, getRoleVariant, type UserWithStats } from "@/lib/users-api";
import { ticketsData } from "@/data/tickets"; // Mock data - será substituído por API real

interface Ticket {
  id: string;
  number: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  typeId: string;
  queueId: string;
  assigneeId: string | null;
  requesterId: string;
  parentId: string | null;
  customFields: any;
  slaDeadline: Date;
  timeSpent: number;
  isPaused: boolean;
  pauseReason: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function UserDetails() {
  const [, params] = useRoute("/users/:id");
  const userId = params?.id;
  const isMobile = useIsMobile();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getById(userId!),
    enabled: !!userId,
  });

  // Mock data para tickets do usuário - será substituído por API real
  const userTickets: Ticket[] = ticketsData.filter((ticket: Ticket) => 
    ticket.requesterId === userId || ticket.assigneeId === userId
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "in_progress": return "default";
      case "resolved": return "secondary";
      case "closed": return "outline";
      default: return "default";
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  if (userLoading) {
    return (
      <>
        <Header 
          title="Carregando..." 
          subtitle="Obtendo informações do usuário"
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header 
          title="Usuário não encontrado" 
          subtitle="O usuário solicitado não foi encontrado"
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Usuário não encontrado.</p>
                  <Link to="/users">
                    <Button className="mt-4">
                      Voltar para Lista de Usuários
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const openTickets = userTickets.filter(ticket => ticket.status === 'open').length;
  const totalTickets = userTickets.length;

  return (
    <>
      <Header 
        title={user.fullName} 
        subtitle="Detalhes e histórico do usuário"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* User Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link to="/users">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para Usuários
                    </Button>
                  </Link>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/users/edit/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email
                      </DropdownMenuItem>
                      <Link to={`/users/edit/${user.id}`}>
                        <DropdownMenuItem>
                          <Lock className="w-4 h-4 mr-2" />
                          Alterar Senha
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={getRoleVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{user.departmentName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Último acesso: {formatDateTime(user.lastAccess)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{openTickets}</div>
                      <div className="text-gray-500">Abertos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{totalTickets}</div>
                      <div className="text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-sm text-gray-900">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Função</label>
                  <div className="mt-1">
                    <Badge variant={getRoleVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Informações da Conta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Departamento</label>
                  <p className="text-sm text-gray-900">{user.departmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                  <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Última Atualização</label>
                  <p className="text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Último Acesso</label>
                  <p className="text-sm text-gray-900">{formatDateTime(user.lastAccess)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Chamados do Usuário ({totalTickets})</CardTitle>
            </CardHeader>
            <CardContent>
              {userTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{ticket.number}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={ticket.title}>
                              {ticket.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(ticket.status)}>
                              {getStatusLabel(ticket.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(ticket.priority)}>
                              {getPriorityLabel(ticket.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{ticket.typeId}</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Link to={`/ticket-details/${ticket.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p>Este usuário ainda não possui chamados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
