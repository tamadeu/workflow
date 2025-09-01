import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateTicket } from "@/hooks/use-tickets-api";
import { ticketStatusApi } from "@/lib/ticket-status-api";
import { ticketPriorityApi } from "@/lib/ticket-priority-api";
import { requestTypesApi } from "@/lib/request-types-api";
import { usersApi } from "@/lib/users-api";
import Header from "@/components/layout/header";

const quickTicketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  status_id: z.string().min(1, "Selecione um status"),
  priority_id: z.string().min(1, "Selecione uma prioridade"),
  request_type_id: z.string().min(1, "Selecione um tipo de solicitação"),
  responsible_user_id: z.string().optional(),
});

type QuickTicketFormData = z.infer<typeof quickTicketSchema>;

export default function NewTicketQuick() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dados das APIs
  const { data: statuses = [], isLoading: statusesLoading } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusApi.getAll(),
  });

  const { data: priorities = [], isLoading: prioritiesLoading } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPriorityApi.getAll(),
  });

  const { data: requestTypes = [], isLoading: requestTypesLoading } = useQuery({
    queryKey: ['request-types'],
    queryFn: () => requestTypesApi.getAll(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const createTicketMutation = useCreateTicket();

  const form = useForm<QuickTicketFormData>({
    resolver: zodResolver(quickTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      status_id: "",
      priority_id: "",
      request_type_id: "",
      responsible_user_id: "",
    },
  });

  const onSubmit = async (data: QuickTicketFormData) => {
    setIsSubmitting(true);
    
    try {
      // Adaptar dados para o formato da API
      const ticketData = {
        title: data.title,
        description: data.description,
        status: {
          id: data.status_id,
          name: statuses.find(s => s.id === data.status_id)?.name || "Aberto",
          color: statuses.find(s => s.id === data.status_id)?.color || "#3B82F6",
        },
        priority: {
          id: data.priority_id,
          name: priorities.find(p => p.id === data.priority_id)?.name || "Normal",
          color: priorities.find(p => p.id === data.priority_id)?.color || "#3B82F6",
        },
        responsibleUser: data.responsible_user_id && data.responsible_user_id !== "unassigned" ? {
          id: data.responsible_user_id,
          name: users.find(u => u.id === data.responsible_user_id)?.fullName || "",
          email: users.find(u => u.id === data.responsible_user_id)?.email || "",
        } : undefined,
        requestType: {
          id: data.request_type_id,
          name: requestTypes.find(rt => rt.id === data.request_type_id)?.name || "",
          sla: requestTypes.find(rt => rt.id === data.request_type_id)?.sla || 480,
          color: requestTypes.find(rt => rt.id === data.request_type_id)?.color || "#3B82F6",
        },
        createdBy: {
          id: "current-user", // Seria obtido do contexto de autenticação
          name: "Usuário Atual",
        },
        updatedBy: {
          id: "current-user",
          name: "Usuário Atual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        code: "", // Será gerado pela API
      };
      
      const createdTicket = await createTicketMutation.mutateAsync(ticketData);
      
      toast({
        title: "Ticket criado com sucesso!",
        description: "Ticket rápido criado com informações básicas.",
      });
      
      // Redirecionar para a página de detalhes do ticket criado
      setLocation(`/ticket/${createdTicket.id}`);
    } catch (error) {
      toast({
        title: "Erro ao criar ticket",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = statusesLoading || prioritiesLoading || requestTypesLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Novo Ticket Rápido" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Novo Ticket Rápido" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tickets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Ticket Rápido</h1>
              <p className="text-gray-600">Criação rápida com informações essenciais</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Ticket Rápido
              </CardTitle>
              <CardDescription>
                Preencha as informações básicas para criar o ticket rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Título */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-title"
                            placeholder="Resumo do problema ou solicitação"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Descrição */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="textarea-description"
                            placeholder="Descreva o problema ou solicitação..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prioridade e Tipo de Solicitação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Selecione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.filter(priority => priority.isActive && priority.id).map((priority) => (
                                <SelectItem key={priority.id} value={priority.id}>
                                  {priority.name}
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
                      name="request_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Solicitação</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-request-type">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {requestTypes.filter(type => type.isActive && type.id).map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.filter(status => status.isActive && status.id).map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Responsável (Opcional) */}
                  <FormField
                    control={form.control}
                    name="responsible_user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsible">
                              <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Não atribuído</SelectItem>
                            {users.filter(user => user.id).map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Botões de Ação */}
                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/tickets">
                        Cancelar
                      </Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando ticket...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Criar Ticket Rápido
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
