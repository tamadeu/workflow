import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Queue, TicketType, Label, User } from "@shared/schema";

const ticketFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  typeId: z.string().optional(),
  queueId: z.string().optional(),
  requesterId: z.string().min(1, "Cliente é obrigatório"),
  customFields: z.record(z.any()).optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess?: () => void;
}

export default function TicketForm({ onSuccess }: TicketFormProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queues } = useQuery<Queue[]>({
    queryKey: ["/api/queues"],
  });

  const { data: ticketTypes } = useQuery<TicketType[]>({
    queryKey: ["/api/ticket-types"],
  });

  const { data: labels } = useQuery<Label[]>({
    queryKey: ["/api/labels"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("POST", "/api/tickets", {
        ...data,
        labels: selectedLabels,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Chamado criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      setSelectedLabels([]);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Abertura Rápida de Chamado
        </CardTitle>
        <p className="text-sm text-gray-500">Crie um novo chamado rapidamente</p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Ticket Type */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Chamado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-ticket-type">
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ticketTypes?.map((type) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Queue */}
              <FormField
                control={form.control}
                name="queueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fila de Atendimento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-queue">
                          <SelectValue placeholder="Selecione a fila..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {queues?.map((queue) => (
                          <SelectItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Selector */}
            <FormField
              control={form.control}
              name="requesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente Solicitante</FormLabel>
                  <FormControl>
                    <Combobox
                      data-testid="select-client"
                      options={
                        users?.map((user) => ({
                          value: user.id,
                          label: user.name,
                          email: user.email,
                        })) || []
                      }
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Buscar cliente por nome ou email..."
                      searchPlaceholder="Digite para buscar..."
                      emptyText="Nenhum cliente encontrado."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-title"
                      placeholder="Descreva brevemente o problema"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="textarea-description"
                      rows={4}
                      placeholder="Descreva detalhadamente o problema ou solicitação"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Labels */}
            <FormItem>
              <FormLabel>Rótulos</FormLabel>
              <TagInput
                data-testid="input-labels"
                tags={selectedLabels}
                onTagsChange={setSelectedLabels}
                availableTags={labels?.map(l => ({ id: l.id, name: l.name, color: l.color })) || []}
                placeholder="Adicionar rótulo..."
              />
            </FormItem>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                data-testid="button-save-draft"
                type="button"
                variant="outline"
              >
                Salvar Rascunho
              </Button>
              <Button
                data-testid="button-create-ticket"
                type="submit"
                disabled={createTicketMutation.isPending}
                className="bg-primary hover:bg-primary-600"
              >
                {createTicketMutation.isPending ? "Criando..." : "Criar Chamado"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
