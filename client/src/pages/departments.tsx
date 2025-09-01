import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building2, Clock, Loader2, Grid, List, Users } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Department, SlaLevel } from "@shared/schema";
import { departmentsApi } from "@/lib/departments-api";
import { slaLevelsApi } from "@/lib/sla-levels-api";
import { workSchedulesApi, type LocalWorkSchedule } from "@/lib/work-schedules-api";

const departmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slaLevelId: z.string().min(1, "Nível SLA é obrigatório"),
  workHourId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

export default function Departments() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    // Recuperar preferência do localStorage ou usar 'cards' como padrão
    const saved = localStorage.getItem('departments-view-mode');
    return (saved as 'cards' | 'list') || 'cards';
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Salvar preferência do usuário no localStorage
  useEffect(() => {
    localStorage.setItem('departments-view-mode', viewMode);
  }, [viewMode]);

  // Query para buscar todos os departamentos
  const { 
    data: departments = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar todos os níveis SLA ativos
  const { 
    data: slaLevels = [], 
    isLoading: isLoadingSlaLevels 
  } = useQuery({
    queryKey: ['sla-levels'],
    queryFn: slaLevelsApi.getAll,
    select: (data) => data.filter(sla => sla.isActive), // Apenas SLAs ativos
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar todas as jornadas de trabalho ativas
  const { 
    data: workSchedules = [], 
    isLoading: isLoadingWorkSchedules 
  } = useQuery({
    queryKey: ['work-schedules'],
    queryFn: workSchedulesApi.getAll,
    select: (data) => data.filter(schedule => schedule.isActive), // Apenas jornadas ativas
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Ordenar departamentos por nome
  const sortedDepartments = [...departments].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  // Mutation para criar departamento
  const createMutation = useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Sucesso",
        description: "Departamento criado com sucesso!",
      });
      setShowDialog(false);
      setEditingDepartment(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar departamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar departamento
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => 
      departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Sucesso",
        description: "Departamento atualizado com sucesso!",
      });
      setShowDialog(false);
      setEditingDepartment(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar departamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir departamento
  const deleteMutation = useMutation({
    mutationFn: departmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir departamento",
        variant: "destructive",
      });
    },
  });

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      slaLevelId: "",
      workHourId: "",
      isActive: true,
    },
  });

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      slaLevelId: department.slaLevelId || "",
      workHourId: department.workHourId || "",
      isActive: department.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este departamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    if (editingDepartment) {
      // Atualizar departamento existente
      updateMutation.mutate({
        id: editingDepartment.id,
        data: {
          ...data,
          workHourId: data.workHourId || null,
          updatedAt: new Date(),
        }
      });
    } else {
      // Criar novo departamento
      createMutation.mutate({
        ...data,
        workHourId: data.workHourId || null,
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

  return (
    <>
      <Header 
        title="Departamentos" 
        subtitle="Gerencie os departamentos, seus níveis de resposta (SLA) e jornadas de trabalho"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando departamentos...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">
                <strong>Erro ao carregar departamentos:</strong>
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
                    Departamentos ({sortedDepartments.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure os departamentos, defina os tempos de resposta esperados e suas jornadas de trabalho
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* View Mode Toggle */}
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
                      <List className="w-4 h-4 mr-1" />
                      Lista
                    </Button>
                  </div>
                  
                  <Button
                    data-testid="button-new-department"
                    onClick={() => {
                      setEditingDepartment(null);
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
                    Novo Departamento
                  </Button>
                </div>
              </div>

              {/* Departments Grid - Cards View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-300">
                  {sortedDepartments.map((department) => (
                    <Card key={department.id} className="shadow-sm border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">
                              {department.name}
                            </CardTitle>
                          </div>
                          <Badge variant={department.isActive ? "default" : "secondary"}>
                            {department.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">SLA:</span>
                            {department.slaName && department.slaTime ? (
                              <Badge 
                                variant="secondary"
                                className="text-blue-600 bg-blue-50 border-0"
                              >
                                {department.slaName} ({formatSLA(department.slaTime)})
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-gray-600 bg-gray-50 border-0">
                                Sem SLA
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Jornada:</span>
                            {department.workHourName ? (
                              <Badge 
                                variant="secondary"
                                className="text-green-600 bg-green-50 border-0"
                              >
                                {department.workHourName}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-gray-600 bg-gray-50 border-0">
                                Sem jornada
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Criado em {new Date(department.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            data-testid={`button-edit-department-${department.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(department)}
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
                            data-testid={`button-delete-department-${department.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(department.id)}
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

              {/* Departments Table - List View */}
              {viewMode === 'list' && (
                <div className="animate-in fade-in-50 duration-300">
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle>Lista de Departamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>SLA</TableHead>
                            <TableHead>Jornada de Trabalho</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedDepartments.map((department) => (
                            <TableRow key={department.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-4 h-4 text-primary" />
                                  <span>{department.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {department.slaName && department.slaTime ? (
                                  <Badge 
                                    variant="secondary"
                                    className="text-blue-600 bg-blue-50 border-0"
                                  >
                                    {department.slaName} ({formatSLA(department.slaTime)})
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-gray-600 bg-gray-50 border-0">
                                    Sem SLA
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {department.workHourName ? (
                                  <Badge 
                                    variant="secondary"
                                    className="text-green-600 bg-green-50 border-0"
                                  >
                                    {department.workHourName}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-gray-600 bg-gray-50 border-0">
                                    Sem jornada
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={department.isActive ? "default" : "secondary"}>
                                  {department.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(department.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(department)}
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
                                    onClick={() => handleDelete(department.id)}
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Department Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Editar Departamento" : "Novo Departamento"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Departamento</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-department-name"
                        placeholder="Ex: Tecnologia da Informação"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slaLevelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível SLA</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingSlaLevels}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-department-sla">
                          <SelectValue placeholder={isLoadingSlaLevels ? "Carregando..." : "Selecione o nível SLA"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {slaLevels.map((slaLevel) => (
                          <SelectItem key={slaLevel.id} value={slaLevel.id}>
                            {slaLevel.name} - {formatSLA(slaLevel.sla)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workHourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jornada de Trabalho</FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      disabled={isLoadingWorkSchedules}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-department-work-schedule">
                          <SelectValue placeholder={isLoadingWorkSchedules ? "Carregando..." : "Selecione a jornada de trabalho (opcional)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma jornada específica</SelectItem>
                        {workSchedules.map((schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {schedule.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Departamento Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-department-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-department"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-department"
                  type="submit"
                  className="bg-primary hover:bg-primary-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingDepartment ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingDepartment ? "Atualizar" : "Criar"} Departamento
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
