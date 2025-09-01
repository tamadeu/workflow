import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock, Loader2, Grid, List } from "lucide-react";
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
import type { SlaLevel } from "@shared/schema";
import { slaLevelsApi } from "@/lib/sla-levels-api";

const slaLevelFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sla: z.number().min(1, "SLA deve ser maior que 0").max(10080, "SLA não pode ser maior que 10080 minutos (1 semana)"),
  isActive: z.boolean().default(true),
});

type SlaLevelFormData = z.infer<typeof slaLevelFormSchema>;

export default function SlaLevels() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSlaLevel, setEditingSlaLevel] = useState<SlaLevel | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    // Recuperar preferência do localStorage ou usar 'cards' como padrão
    const saved = localStorage.getItem('sla-levels-view-mode');
    return (saved as 'cards' | 'list') || 'cards';
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Salvar preferência do usuário no localStorage
  useEffect(() => {
    localStorage.setItem('sla-levels-view-mode', viewMode);
  }, [viewMode]);

  // Query para buscar todos os níveis SLA
  const { 
    data: slaLevels = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['sla-levels'],
    queryFn: slaLevelsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Ordenar níveis SLA por nome
  const sortedSlaLevels = [...slaLevels].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  // Mutation para criar nível SLA
  const createMutation = useMutation({
    mutationFn: slaLevelsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível SLA criado com sucesso!",
      });
      setShowDialog(false);
      setEditingSlaLevel(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar nível SLA",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar nível SLA
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SlaLevel> }) => 
      slaLevelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível SLA atualizado com sucesso!",
      });
      setShowDialog(false);
      setEditingSlaLevel(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar nível SLA",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir nível SLA
  const deleteMutation = useMutation({
    mutationFn: slaLevelsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível SLA excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir nível SLA",
        variant: "destructive",
      });
    },
  });

  const form = useForm<SlaLevelFormData>({
    resolver: zodResolver(slaLevelFormSchema),
    defaultValues: {
      name: "",
      sla: 480, // 8 horas = 480 minutos
      isActive: true,
    },
  });

  const handleEdit = (slaLevel: SlaLevel) => {
    setEditingSlaLevel(slaLevel);
    form.reset({
      name: slaLevel.name,
      sla: slaLevel.sla,
      isActive: slaLevel.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este nível SLA?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data: SlaLevelFormData) => {
    if (editingSlaLevel) {
      // Atualizar nível SLA existente
      updateMutation.mutate({
        id: editingSlaLevel.id,
        data: {
          ...data,
          updatedAt: new Date(),
        }
      });
    } else {
      // Criar novo nível SLA
      createMutation.mutate({
        ...data,
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

  return (
    <>
      <Header 
        title="Níveis de Resposta (SLA)" 
        subtitle="Gerencie os níveis de resposta do sistema"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando níveis SLA...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">
                <strong>Erro ao carregar níveis SLA:</strong>
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
                    Níveis SLA ({sortedSlaLevels.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure os níveis de resposta esperados para o sistema
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
                    data-testid="button-new-sla-level"
                    onClick={() => {
                      setEditingSlaLevel(null);
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
                    Novo Nível SLA
                  </Button>
                </div>
              </div>

              {/* SLA Levels Grid - Cards View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-300">
                  {sortedSlaLevels.map((slaLevel) => (
                    <Card key={slaLevel.id} className="shadow-sm border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">
                              {slaLevel.name}
                            </CardTitle>
                          </div>
                          <Badge variant={slaLevel.isActive ? "default" : "secondary"}>
                            {slaLevel.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">SLA:</span>
                            <Badge 
                              variant="secondary"
                              className={`${getSLAColor(slaLevel.sla)} border-0`}
                            >
                              {formatSLA(slaLevel.sla)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Criado em {new Date(slaLevel.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            data-testid={`button-edit-sla-level-${slaLevel.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(slaLevel)}
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
                            data-testid={`button-delete-sla-level-${slaLevel.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(slaLevel.id)}
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

              {/* SLA Levels Table - List View */}
              {viewMode === 'list' && (
                <div className="animate-in fade-in-50 duration-300">
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle>Lista de Níveis SLA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>SLA</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedSlaLevels.map((slaLevel) => (
                            <TableRow key={slaLevel.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span>{slaLevel.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  className={`${getSLAColor(slaLevel.sla)} border-0`}
                                >
                                  {formatSLA(slaLevel.sla)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={slaLevel.isActive ? "default" : "secondary"}>
                                  {slaLevel.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(slaLevel.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(slaLevel)}
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
                                    onClick={() => handleDelete(slaLevel.id)}
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

      {/* SLA Level Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlaLevel ? "Editar Nível SLA" : "Novo Nível SLA"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Nível SLA</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-sla-level-name"
                        placeholder="Ex: Nível 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectTrigger data-testid="select-sla-level-sla">
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nível SLA Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-sla-level-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-sla-level"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-sla-level"
                  type="submit"
                  className="bg-primary hover:bg-primary-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingSlaLevel ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingSlaLevel ? "Atualizar" : "Criar"} Nível SLA
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
