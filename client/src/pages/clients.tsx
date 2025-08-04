import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Phone, Mail, MoreHorizontal, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User as ClientType, Ticket } from "@shared/schema";

interface ClientWithTickets extends ClientType {
  openTickets: number;
  totalTickets: number;
  lastTicketDate?: string;
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithTickets | null>(null);
  const isMobile = useIsMobile();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<ClientWithTickets[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientTickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/clients", selectedClient?.id, "tickets"],
    enabled: !!selectedClient,
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  if (clientsLoading) {
    return (
      <>
        <Header 
          title="Clientes" 
          subtitle="Gerenciar clientes e visualizar seus chamados"
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
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
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Clientes" 
        subtitle="Gerenciar clientes e visualizar seus chamados"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {!selectedClient ? (
            <>
              {/* Search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg">Buscar Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      data-testid="input-search-clients"
                      placeholder="Pesquisar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Clients List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg">Lista de Clientes ({filteredClients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    /* Mobile View - Card based */
                    <div className="space-y-3">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedClient(client)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {client.openTickets} Aberto{client.openTickets !== 1 ? 's' : ''}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Total: {client.totalTickets}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Desktop View - Table */
                    <div className="overflow-x-auto">
                      <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Chamados Abertos</TableHead>
                          <TableHead>Total de Chamados</TableHead>
                          <TableHead>Último Chamado</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow key={client.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {getInitials(client.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{client.name}</div>
                                  <div className="text-sm text-gray-500">{client.role}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{client.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={client.openTickets > 0 ? "default" : "secondary"}>
                                {client.openTickets}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{client.totalTickets}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {client.lastTicketDate ? formatDate(client.lastTicketDate) : "Nenhum"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  data-testid={`button-view-client-${client.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedClient(client)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <User className="w-4 h-4 mr-2" />
                                      Ver Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="w-4 h-4 mr-2" />
                                      Enviar Email
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                  
                  {filteredClients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhum cliente encontrado.</p>
                      {searchTerm && (
                        <p className="text-sm">Tente ajustar os termos de busca.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Client Details Header */}
              <Card>
                <CardHeader className="pb-3">
                  {isMobile ? (
                    /* Mobile Client Header */
                    <div className="space-y-4">
                      <Button
                        data-testid="button-back-to-clients"
                        variant="outline"
                        onClick={() => setSelectedClient(null)}
                        className="w-full justify-start"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Clientes
                      </Button>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg">
                            {getInitials(selectedClient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedClient.name}</h2>
                          <p className="text-sm text-gray-500 truncate">{selectedClient.email}</p>
                        </div>
                      </div>
                      <div className="flex justify-around bg-gray-50 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{selectedClient.openTickets}</div>
                          <div className="text-xs text-gray-500">Abertos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-700">{selectedClient.totalTickets}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Client Header */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          data-testid="button-back-to-clients"
                          variant="outline"
                          onClick={() => setSelectedClient(null)}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar para Clientes
                        </Button>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="text-lg">
                              {getInitials(selectedClient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h2>
                            <p className="text-sm text-gray-500">{selectedClient.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{selectedClient.openTickets}</div>
                          <div className="text-gray-500">Abertos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-700">{selectedClient.totalTickets}</div>
                          <div className="text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Client Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Chamados do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketsLoading ? (
                    <div className="animate-pulse space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientTickets.map((ticket) => (
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
                              <TableCell className="text-sm text-gray-500">
                                {formatDate(ticket.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Link href={`/ticket/${ticket.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {clientTickets.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                          <p>Este cliente ainda não possui chamados.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}