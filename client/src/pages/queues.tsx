import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Queue } from "@shared/schema";

const queueFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean().default(true),
});

type QueueFormData = z.infer<typeof queueFormSchema>;

export default function Queues() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queues = [], isLoading } = useQuery<Queue[]>({
    queryKey: ["/api/queues"],
  });

  const form = useForm<QueueFormData>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
    },
  });

  const createQueueMutation = useMutation({
    mutationFn: async (data: QueueFormData) => {
      const response = await apiRequest("POST", "/api/queues", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Fila criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/queues"] });
      setShowDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar fila. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateQueueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QueueFormData> }) => {
      const response = await apiRequest("PATCH", `/api/queues/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Fila atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/queues"] });
      setShowDialog(false);
      setEditingQueue(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar fila. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteQueueMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/queues/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Fila excluída com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/queues"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir fila. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (queue: Queue) => {
    setEditingQueue(queue);
    form.reset({
      name: queue.name,
      description: queue.description || "",
      color: queue.color,
      isActive: queue.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta fila?")) {
      deleteQueueMutation.mutate(id);
    }
  };

  const onSubmit = (data: QueueFormData) => {
    if (editingQueue) {
      updateQueueMutation.mutate({ id: editingQueue.id, data });
    } else {
      createQueueMutation.mutate(data);
    }
  };

  return (
    <>
      <Header 
        title="Filas de Atendimento" 
        subtitle="Gerencie as filas de atendimento do sistema"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Filas de Atendimento ({queues.length})
              </h2>
              <p className="text-sm text-gray-500">
                Configure e organize as filas para melhor distribuição dos chamados
              </p>
            </div>
            <Button
              data-testid="button-new-queue"
              onClick={() => {
                setEditingQueue(null);
                form.reset();
                setShowDialog(true);
              }}
              className="bg-primary hover:bg-primary-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Fila
            </Button>
          </div>

          {/* Queues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {queues.map((queue) => (
              <Card key={queue.id} className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: queue.color }}
                      />
                      <CardTitle className="text-lg font-semibold">
                        {queue.name}
                      </CardTitle>
                    </div>
                    <Badge variant={queue.isActive ? "default" : "secondary"}>
                      {queue.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {queue.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>0 chamados</span>
                    </div>
                    <span>Criada em {new Date(queue.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`button-edit-queue-${queue.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(queue)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      data-testid={`button-delete-queue-${queue.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(queue.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Queues Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Lista Completa de Filas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chamados</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queues.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell className="font-medium">{queue.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {queue.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: queue.color }}
                          />
                          <span className="text-xs font-mono">{queue.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={queue.isActive ? "default" : "secondary"}>
                          {queue.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        {new Date(queue.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(queue)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(queue.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </main>

      {/* Queue Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQueue ? "Editar Fila" : "Nova Fila"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Fila</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-queue-name"
                        placeholder="Ex: TI - Infraestrutura"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-queue-description"
                        placeholder="Descreva o propósito desta fila..."
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
                      <div className="flex space-x-2">
                        <Input
                          data-testid="input-queue-color"
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

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Fila Ativa</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-queue-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-queue"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-queue"
                  type="submit"
                  disabled={createQueueMutation.isPending || updateQueueMutation.isPending}
                  className="bg-primary hover:bg-primary-600"
                >
                  {editingQueue ? "Atualizar" : "Criar"} Fila
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
