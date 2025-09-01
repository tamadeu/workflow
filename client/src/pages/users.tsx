import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Phone, Mail, MoreHorizontal, Eye, Edit, Plus, Building2 } from "lucide-react";
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
import { usersApi, transformToUserWithStats, getRoleLabel, getRoleVariant, type UserWithStats } from "@/lib/users-api";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithStats[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const rawUsers = await usersApi.getAll();
      return transformToUserWithStats(rawUsers);
    },
  });

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (usersLoading) {
    return (
      <>
        <Header 
          title="Usuários" 
          subtitle="Gerenciar usuários e visualizar seus chamados"
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
        title="Usuários" 
        subtitle="Gerenciar usuários e visualizar seus chamados"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base lg:text-lg">Buscar Usuários</CardTitle>
                <Link to="/users/new">
                  <Button size="sm" className="bg-primary hover:bg-primary-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  data-testid="input-search-users"
                  placeholder="Pesquisar por nome, email ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">Lista de Usuários ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                /* Mobile View - Card based */
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{user.fullName}</h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getRoleVariant(user.role)} className="text-xs">
                                {getRoleLabel(user.role)}
                              </Badge>
                              <span className="text-xs text-gray-500 truncate">
                                {user.departmentName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {user.openTickets} Aberto{user.openTickets !== 1 ? 's' : ''}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Total: {user.totalTickets}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Link to={`/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <Link to={`/users/edit/${user.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Usuário
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Chamados Abertos</TableHead>
                        <TableHead>Total de Chamados</TableHead>
                        <TableHead>Último Acesso</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(user.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{user.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{user.departmentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.openTickets > 0 ? "default" : "secondary"}>
                              {user.openTickets}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{user.totalTickets}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDate(user.lastAccess.toISOString())}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link to={`/users/${user.id}`}>
                                <Button
                                  data-testid={`button-view-user-${user.id}`}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <Link to={`/users/edit/${user.id}`}>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar Usuário
                                    </DropdownMenuItem>
                                  </Link>
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
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum usuário encontrado.</p>
                  {searchTerm && (
                    <p className="text-sm">Tente ajustar os termos de busca.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}