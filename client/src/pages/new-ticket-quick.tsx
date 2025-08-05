import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send, Zap, FileEdit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

const quickTicketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  priority: z.enum(["baixa", "normal", "alta", "urgente"]),
  queueId: z.string().min(1, "Selecione uma fila"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

type QuickTicketFormData = z.infer<typeof quickTicketSchema>;

export default function NewTicketQuick() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickTicketFormData>({
    resolver: zodResolver(quickTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
      queueId: "",
      clientEmail: "",
    },
  });

  const onSubmit = async (data: QuickTicketFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simular criação do ticket
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Ticket criado com sucesso!",
        description: "Seu ticket foi criado rapidamente e está sendo processado.",
      });
      
      setLocation("/tickets");
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

  return (
    <div className="min-h-screen bg-background">
      <Header title="Abertura Rápida" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          
          {/* Header com opções */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/tickets">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Abertura Rápida</h1>
                <p className="text-sm text-muted-foreground">Criação rápida de tickets</p>
              </div>
            </div>
            
            <Link to="/tickets/new/full">
              <Button variant="outline" size="sm">
                <FileEdit className="w-4 h-4 mr-2" />
                Abertura Completa
              </Button>
            </Link>
          </div>

          {/* Alert informativo */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Abertura Rápida</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Para tickets simples que não precisam de anexos ou formatação especial. 
                    Para casos mais complexos, use a <Link to="/tickets/new/full" className="underline font-medium">Abertura Completa</Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Ticket</CardTitle>
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
                            data-testid="input-ticket-title"
                            placeholder="Ex: Problema com impressora do 2º andar"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prioridade e Fila */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
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
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="urgente">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="queueId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fila</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-queue">
                                <SelectValue placeholder="Selecione a fila" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="suporte-ti">Suporte TI</SelectItem>
                              <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                              <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                              <SelectItem value="helpdesk">Help Desk</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email do Cliente (opcional) */}
                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Cliente (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-client-email"
                            type="email"
                            placeholder="cliente@empresa.com"
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

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      data-testid="button-submit-quick-ticket"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary hover:bg-primary-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Criando..." : "Criar Ticket Rápido"}
                    </Button>
                    
                    <Link to="/tickets/new/full" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        <FileEdit className="w-4 h-4 mr-2" />
                        Abrir Versão Completa
                      </Button>
                    </Link>
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