import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, CircleDot, Loader2, Grid, List } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ticketStatusApi } from "@/lib/ticket-status-api";

const ticketStatusFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean().default(true),
});

type TicketStatusFormData = z.infer<typeof ticketStatusFormSchema>;

interface TicketStatus {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

const predefinedColors = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
];

export default function TicketStatuses() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState<TicketStatus | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    // Recuperar preferência do localStorage ou usar 'cards' como padrão
    const saved = localStorage.getItem('ticket-statuses-view-mode');
    return (saved as 'cards' | 'list') || 'cards';
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Salvar preferência do usuário no localStorage
  useEffect(() => {
    localStorage.setItem('ticket-statuses-view-mode', viewMode);
  }, [viewMode]);

  // Query para buscar todos os status
  const { 
    data: statuses = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: ticketStatusApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Ordenar status por nome
  const sortedStatuses = [...statuses].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  const form = useForm<TicketStatusFormData>({
    resolver: zodResolver(ticketStatusFormSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
      isActive: true,
    },
  });

  // Mutation para criar status
  const createMutation = useMutation({
    mutationFn: ticketStatusApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-statuses'] });
      toast({
        title: "Sucesso",
        description: "Status criado com sucesso!",
      });
      setShowDialog(false);
      setEditingStatus(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar status",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar status
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TicketStatus> }) => 
      ticketStatusApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-statuses'] });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
      setShowDialog(false);
      setEditingStatus(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir status
  const deleteMutation = useMutation({
    mutationFn: ticketStatusApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-statuses'] });
      toast({
        title: "Sucesso",
        description: "Status excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir status",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (status: TicketStatus) => {
    setEditingStatus(status);
    form.reset({
      name: status.name,
      color: status.color,
      isActive: status.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este status?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data: TicketStatusFormData) => {
    if (editingStatus) {
      // Atualizar status existente
      updateMutation.mutate({
        id: editingStatus.id,
        data: {
          ...data,
          updatedAt: new Date(),
        }
      });
    } else {
      // Criar novo status
      createMutation.mutate({
        ...data,
        createdBy: null, // TODO: Pegar do contexto do usuário logado
        updatedBy: null,
      });
    }
  };

  return (
    <>
      <Header 
        title="Status dos Chamados" 
        subtitle="Gerencie os status para organização do fluxo dos chamados"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando status...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">
                <strong>Erro ao carregar status:</strong>
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
                    Status dos Chamados ({sortedStatuses.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Crie e organize status para facilitar o controle do fluxo dos chamados
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
                    data-testid="button-new-ticket-status"
                    onClick={() => {
                      setEditingStatus(null);
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
                    Novo Status
                  </Button>
                </div>
              </div>

              {/* Status Grid - Cards View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in-50 duration-300">
                  {sortedStatuses.map((status) => (
                    <Card key={status.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge 
                            style={{ 
                              backgroundColor: `${status.color}20`, 
                              color: status.color,
                              borderColor: `${status.color}40`
                            }}
                            className="px-3 py-1 text-sm font-medium"
                          >
                            <CircleDot className="w-3 h-3 mr-1" />
                            {status.name}
                          </Badge>
                          <Badge variant={status.isActive ? "default" : "secondary"}>
                            {status.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>0 chamados</span>
                          <span>{new Date(status.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            data-testid={`button-edit-ticket-status-${status.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(status)}
                            className="flex-1 text-xs"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Edit className="w-3 h-3 mr-1" />
                            )}
                            Editar
                          </Button>
                          <Button
                            data-testid={`button-delete-ticket-status-${status.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(status.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Status Table - List View */}
              {viewMode === 'list' && (
                <div className="animate-in fade-in-50 duration-300">
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle>Lista de Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Cor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uso</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedStatuses.map((status) => (
                            <TableRow key={status.id}>
                              <TableCell>
                                <Badge 
                                  style={{ 
                                    backgroundColor: `${status.color}20`, 
                                    color: status.color 
                                  }}
                                  className="font-medium"
                                >
                                  <CircleDot className="w-3 h-3 mr-1" />
                                  {status.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: status.color }}
                                  />
                                  <span className="text-xs font-mono">{status.color}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.isActive ? "default" : "secondary"}>
                                  {status.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>0 chamados</TableCell>
                              <TableCell>
                                {new Date(status.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(status)}
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
                                    onClick={() => handleDelete(status.id)}
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

      {/* Status Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStatus ? "Editar Status" : "Novo Status"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Status</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-ticket-status-name"
                        placeholder="Ex: aberto, em andamento, resolvido"
                        {...field}
                      />
                    </FormControl>
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
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <Input
                            data-testid="input-ticket-status-color"
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
                        <div className="grid grid-cols-8 gap-2">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 focus:outline-none focus:border-gray-600"
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Status Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-ticket-status-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-ticket-status"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-ticket-status"
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-primary hover:bg-primary-600"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingStatus ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingStatus ? "Atualizar" : "Criar"} Status
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
