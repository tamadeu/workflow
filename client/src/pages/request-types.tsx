import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Settings, Clock, Building2, Grid, List as ListIcon, Loader2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { RequestType, Department } from "@shared/schema";
import { requestTypesApi } from "@/lib/request-types-api";
import { departmentsApi } from "@/lib/departments-api";

const requestTypeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean().default(true),
  departmentIds: z.array(z.string()).optional(),
  sla: z.number().min(1, "SLA deve ser maior que 0").max(10080, "SLA não pode ser maior que 10080 minutos (1 semana)"),
});

type RequestTypeFormData = z.infer<typeof requestTypeFormSchema>;

// Componente para seleção múltipla de departamentos
interface MultiSelectDepartmentsProps {
  value: string[];
  onChange: (value: string[]) => void;
  departments: Department[];
}

function MultiSelectDepartments({ value, onChange, departments }: MultiSelectDepartmentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedDepartments = value.map(id => 
    departments.find(dept => dept.id === id)
  ).filter(Boolean) as Department[];

  // Ordenar departamentos selecionados alfabeticamente
  const sortedSelectedDepartments = [...selectedDepartments].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  // Ordenar departamentos disponíveis alfabeticamente
  const availableDepartments = departments
    .filter(dept => dept.isActive && !value.includes(dept.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  const handleSelect = (departmentId: string) => {
    onChange([...value, departmentId]);
    setIsOpen(false);
  };

  const handleRemove = (departmentId: string) => {
    onChange(value.filter(id => id !== departmentId));
  };

  return (
    <div className="space-y-2">
      {/* Departamentos selecionados */}
      {sortedSelectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sortedSelectedDepartments.map(dept => (
            <Badge key={dept.id} variant="secondary" className="pr-1">
              {dept.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => handleRemove(dept.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Seletor para adicionar departamentos */}
      <Select open={isOpen} onOpenChange={setIsOpen} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder={
            sortedSelectedDepartments.length === 0 
              ? "Selecione os departamentos responsáveis" 
              : "Adicionar mais departamentos"
          } />
        </SelectTrigger>
        <SelectContent>
          {availableDepartments.length === 0 ? (
            <div className="px-2 py-1 text-sm text-gray-500">
              {departments.filter(d => d.isActive).length === 0 
                ? "Nenhum departamento ativo disponível"
                : "Todos os departamentos foram selecionados"
              }
            </div>
          ) : (
            availableDepartments.map(department => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function RequestTypes() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRequestType, setEditingRequestType] = useState<RequestType | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    const saved = localStorage.getItem('request-types-view-mode');
    return (saved as 'cards' | 'list') || 'cards';
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Salvar preferência do usuário no localStorage
  useEffect(() => {
    localStorage.setItem('request-types-view-mode', viewMode);
  }, [viewMode]);

  // Query para buscar todos os tipos de solicitação
  const { 
    data: requestTypes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['request-types'],
    queryFn: requestTypesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar departamentos
  const { 
    data: departments = [], 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Função para obter nomes dos departamentos (precisa estar antes do useMemo)
  const getDepartmentNames = (departmentIds: string[] | undefined | null) => {
    if (!departmentIds || departmentIds.length === 0) return "Todos";
    
    const departmentNames = departmentIds
      .map(id => {
        const department = departments.find(dept => dept.id === id);
        return department?.name || "Departamento não encontrado";
      })
      .filter(name => name !== "Departamento não encontrado");
    
    if (departmentNames.length === 0) return "Departamento não encontrado";
    if (departmentNames.length === 1) return departmentNames[0];
    if (departmentNames.length <= 3) return departmentNames.join(", ");
    
    return `${departmentNames.slice(0, 2).join(", ")} e mais ${departmentNames.length - 2}`;
  };

  // Ordenar tipos de solicitação por nome
  const sortedRequestTypes = [...requestTypes].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  // Filtrar e paginar tipos de solicitação
  const filteredAndPaginatedRequestTypes = useMemo(() => {
    // Filtrar por termo de busca
    const filtered = sortedRequestTypes.filter(requestType => {
      const searchLower = searchTerm.toLowerCase();
      return (
        requestType.name.toLowerCase().includes(searchLower) ||
        (requestType.description || "").toLowerCase().includes(searchLower) ||
        getDepartmentNames(requestType.departmentIds).toLowerCase().includes(searchLower)
      );
    });

    // Calcular paginação
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems: filtered.length,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [sortedRequestTypes, searchTerm, currentPage, itemsPerPage]);

  // Resetar página quando busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Mutation para criar tipo de solicitação
  const createMutation = useMutation({
    mutationFn: requestTypesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de solicitação criado com sucesso!",
      });
      handleCloseDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tipo de solicitação",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar tipo de solicitação
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RequestType> }) => 
      requestTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de solicitação atualizado com sucesso!",
      });
      handleCloseDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tipo de solicitação",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir tipo de solicitação
  const deleteMutation = useMutation({
    mutationFn: requestTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de solicitação excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir tipo de solicitação",
        variant: "destructive",
      });
    },
  });

  const form = useForm<RequestTypeFormData>({
    resolver: zodResolver(requestTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
      departmentIds: [],
      sla: 480, // 8 horas = 480 minutos
    },
  });

  const handleEdit = (requestType: RequestType) => {
    setEditingRequestType(requestType);
    form.reset({
      name: requestType.name,
      description: requestType.description || "",
      color: requestType.color,
      isActive: requestType.isActive,
      departmentIds: requestType.departmentIds || [],
      sla: requestType.sla,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tipo de solicitação?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data: RequestTypeFormData) => {
    // Processa os dados do formulário
    const processedData = {
      ...data,
      // Remove departmentIds vazios
      departmentIds: data.departmentIds?.filter(id => id && id.trim() !== '') || [],
    };

    if (editingRequestType) {
      // Atualizar tipo de solicitação existente
      updateMutation.mutate({
        id: editingRequestType.id,
        data: {
          ...processedData,
          updatedAt: new Date(),
        }
      });
    } else {
      // Criar novo tipo de solicitação
      createMutation.mutate({
        ...processedData,
        createdBy: null, // TODO: Pegar do contexto do usuário logado
        updatedBy: null,
      });
    }
  };

  const formatSLA = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    } else if (minutes < 1440) { // Menos de 24 horas
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      const remainingMinutes = minutes % 60;
      
      let result = `${days}d`;
      if (remainingHours > 0) result += ` ${remainingHours}h`;
      if (remainingMinutes > 0) result += ` ${remainingMinutes}min`;
      
      return result;
    }
  };

  const getSLAColor = (minutes: number) => {
    if (minutes <= 240) return "text-green-600 bg-green-50"; // Até 4 horas
    if (minutes <= 1440) return "text-yellow-600 bg-yellow-50"; // Até 24 horas
    return "text-red-600 bg-red-50";
  };

  // Função para fechar o dialog e limpar o formulário
  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      // Quando o dialog é fechado, limpar o formulário e estado
      setEditingRequestType(null);
      form.reset({
        name: "",
        description: "",
        color: "#3B82F6",
        isActive: true,
        departmentIds: [],
        sla: 480, // 8 horas = 480 minutos
      });
    }
    setShowDialog(open);
  };

  return (
    <>
      <Header 
        title="Tipos de Solicitações" 
        subtitle="Gerencie os tipos de solicitações e seus departamentos responsáveis"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando tipos de solicitação...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">
                <strong>Erro ao carregar tipos de solicitação:</strong>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {/* Content - only show when not loading */}
          {!isLoading && !error && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tipos de Solicitações ({filteredAndPaginatedRequestTypes.totalItems})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure os tipos de solicitações, departamentos responsáveis e níveis de resposta
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Toggle de visualização */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="h-8 px-3"
                      aria-label="Visualizar em cards"
                      title="Visualizar em cards"
                    >
                      <Grid className="w-4 h-4 mr-1" />
                      Cards
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 px-3"
                      aria-label="Visualizar em lista"
                      title="Visualizar em lista"
                    >
                      <ListIcon className="w-4 h-4 mr-1" />
                      Lista
                    </Button>
                  </div>
                  
                  <Button
                    data-testid="button-new-request-type"
                    onClick={() => {
                      setEditingRequestType(null);
                      form.reset();
                      setShowDialog(true);
                    }}
                    className="bg-primary hover:bg-primary-600"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Novo Tipo de Solicitação
                  </Button>
                </div>
              </div>

              {/* Barra de busca */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar tipos de solicitação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

          {/* Request Types Grid - apenas quando viewMode é 'cards' */}
          {viewMode === 'cards' && (
            <>
              {filteredAndPaginatedRequestTypes.totalItems === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-2">
                    {searchTerm ? 'Nenhum tipo de solicitação encontrado para sua busca' : 'Nenhum tipo de solicitação cadastrado'}
                  </div>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Limpar busca
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredAndPaginatedRequestTypes.items.map((requestType) => (
                  <Card key={requestType.id} className="shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: requestType.color }}
                          />
                          <CardTitle className="text-lg font-semibold">
                            {requestType.name}
                          </CardTitle>
                        </div>
                        <Badge variant={requestType.isActive ? "default" : "secondary"}>
                          {requestType.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {requestType.description || "Sem descrição"}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {getDepartmentNames(requestType.departmentIds)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">SLA:</span>
                          <Badge 
                            variant="secondary"
                            className={`${getSLAColor(requestType.sla)} border-0`}
                          >
                            {formatSLA(requestType.sla)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Criado em {new Date(requestType.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`button-edit-request-type-${requestType.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(requestType)}
                          className="flex-1"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4 mr-1" />
                          )}
                          Editar
                        </Button>
                        <Button
                          data-testid={`button-delete-request-type-${requestType.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(requestType.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}
            </>
          )}

          {/* Request Types Table - apenas quando viewMode é 'list' */}
          {viewMode === 'list' && (
            <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Lista Completa de Tipos de Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAndPaginatedRequestTypes.totalItems === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-2">
                    {searchTerm ? 'Nenhum tipo de solicitação encontrado para sua busca' : 'Nenhum tipo de solicitação cadastrado'}
                  </div>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Limpar busca
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndPaginatedRequestTypes.items.map((requestType) => (
                      <TableRow key={requestType.id}>
                        <TableCell className="font-medium">{requestType.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {requestType.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {getDepartmentNames(requestType.departmentIds)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`${getSLAColor(requestType.sla)} border-0`}
                          >
                            {formatSLA(requestType.sla)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: requestType.color }}
                            />
                            <span className="text-xs font-mono">{requestType.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={requestType.isActive ? "default" : "secondary"}>
                            {requestType.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(requestType.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(requestType)}
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(requestType.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            </Card>
          )}

          {/* Controles de Paginação */}
          {filteredAndPaginatedRequestTypes.totalItems > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndPaginatedRequestTypes.totalItems)} de {filteredAndPaginatedRequestTypes.totalItems} tipos de solicitação
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!filteredAndPaginatedRequestTypes.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: filteredAndPaginatedRequestTypes.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostrar páginas próximas à página atual
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(filteredAndPaginatedRequestTypes.totalPages, currentPage + 2);
                      return page >= start && page <= end;
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))
                  }
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, filteredAndPaginatedRequestTypes.totalPages))}
                  disabled={!filteredAndPaginatedRequestTypes.hasNextPage}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* Request Type Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRequestType ? "Editar Tipo de Solicitação" : "Novo Tipo de Solicitação"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Tipo de Solicitação</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-request-type-name"
                          placeholder="Ex: Suporte Técnico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                      <FormField
                        control={form.control}
                        name="departmentIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamentos Responsáveis</FormLabel>
                            <FormControl>
                              <MultiSelectDepartments
                                value={field.value || []}
                                onChange={field.onChange}
                                departments={departments}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-request-type-description"
                        placeholder="Descreva o propósito deste tipo de solicitação..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SLA - Tempo de Resposta (em minutos)</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-request-type-sla">
                            <SelectValue placeholder="Selecione o tempo de resposta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora (60 min)</SelectItem>
                          <SelectItem value="120">2 horas (120 min)</SelectItem>
                          <SelectItem value="240">4 horas (240 min)</SelectItem>
                          <SelectItem value="480">8 horas (480 min)</SelectItem>
                          <SelectItem value="720">12 horas (720 min)</SelectItem>
                          <SelectItem value="1440">24 horas (1 dia)</SelectItem>
                          <SelectItem value="2880">48 horas (2 dias)</SelectItem>
                          <SelectItem value="4320">72 horas (3 dias)</SelectItem>
                          <SelectItem value="10080">168 horas (1 semana)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input
                            data-testid="input-request-type-color"
                            type="color"
                            className="w-16 h-10"
                            {...field}
                          />
                          <Input
                            placeholder="#3B82F6"
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Tipo de Solicitação Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-request-type-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-request-type"
                  type="button"
                  variant="outline"
                  onClick={() => handleCloseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-request-type"
                  type="submit"
                  className="bg-primary hover:bg-primary-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingRequestType ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingRequestType ? "Atualizar" : "Criar"} Tipo de Solicitação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
