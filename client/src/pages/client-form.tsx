import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, Mail, Phone, Building, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User as ClientType } from "@shared/schema";

// Schema de validação para o formulário
const clientFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: z.string().min(1, "Cargo é obrigatório"),
  department: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function ClientForm() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/clients/:action/:id?");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const isEdit = params?.action === "edit";
  const clientId = params?.id;
  const isNew = params?.action === "new";

  // Query para buscar dados do cliente se estiver editando
  const { data: client, isLoading: clientLoading } = useQuery<ClientType>({
    queryKey: ["/api/clients", clientId],
    enabled: isEdit && !!clientId,
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      company: "",
      address: "",
      notes: "",
    },
  });

  // Preencher formulário quando dados do cliente chegarem
  useEffect(() => {
    if (client && isEdit) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone: (client as any).phone || "",
        role: client.role || "",
        department: (client as any).department || "",
        company: (client as any).company || "",
        address: (client as any).address || "",
        notes: (client as any).notes || "",
      });
    }
  }, [client, isEdit, form]);

  // Mutation para criar/atualizar cliente
  const clientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const url = isEdit ? `/api/clients/${clientId}` : "/api/clients";
      const method = isEdit ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao salvar cliente");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: isEdit ? "Cliente atualizado!" : "Cliente criado!",
        description: isEdit ? "As informações do cliente foram atualizadas com sucesso." : "O novo cliente foi criado com sucesso.",
      });
      setLocation("/clients");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o cliente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    clientMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation("/clients");
  };

  if (!match) {
    return null;
  }

  if (isEdit && clientLoading) {
    return (
      <>
        <Header 
          title={isEdit ? "Editar Cliente" : "Novo Cliente"}
          subtitle={isEdit ? "Atualizar informações do cliente" : "Adicionar um novo cliente ao sistema"}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title={isEdit ? "Editar Cliente" : "Novo Cliente"}
        subtitle={isEdit ? "Atualizar informações do cliente" : "Adicionar um novo cliente ao sistema"}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    data-testid="button-back-to-clients"
                    variant="outline"
                    onClick={handleBack}
                    className={isMobile ? "w-full justify-start" : ""}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Clientes
                  </Button>
                  {!isMobile && (
                    <CardTitle className="text-lg">
                      {isEdit ? `Editando: ${client?.name || "Cliente"}` : "Informações do Cliente"}
                    </CardTitle>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 border-b pb-2">
                        <User className="w-4 h-4" />
                        <span>Informações Pessoais</span>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                              <Input 
                                data-testid="input-client-name"
                                placeholder="Digite o nome completo"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input 
                                data-testid="input-client-email"
                                type="email"
                                placeholder="Digite o email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input 
                                data-testid="input-client-phone"
                                placeholder="(11) 99999-9999"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Informações Profissionais */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 border-b pb-2">
                        <Building className="w-4 h-4" />
                        <span>Informações Profissionais</span>
                      </div>

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo *</FormLabel>
                            <FormControl>
                              <Input 
                                data-testid="input-client-role"
                                placeholder="Ex: Analista de TI"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-client-department">
                                  <SelectValue placeholder="Selecione o departamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                                <SelectItem value="rh">Recursos Humanos</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                <SelectItem value="vendas">Vendas</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="operacoes">Operações</SelectItem>
                                <SelectItem value="administracao">Administração</SelectItem>
                                <SelectItem value="juridico">Jurídico</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <FormControl>
                              <Input 
                                data-testid="input-client-company"
                                placeholder="Nome da empresa"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 border-b pb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Informações Adicionais</span>
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input 
                              data-testid="input-client-address"
                              placeholder="Endereço completo"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              data-testid="textarea-client-notes"
                              placeholder="Informações adicionais sobre o cliente..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button
                      data-testid="button-save-client"
                      type="submit"
                      disabled={clientMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {clientMutation.isPending 
                        ? (isEdit ? "Atualizando..." : "Salvando...") 
                        : (isEdit ? "Atualizar Cliente" : "Salvar Cliente")
                      }
                    </Button>
                    <Button
                      data-testid="button-cancel-client"
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={clientMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}