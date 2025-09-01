import Header from "@/components/layout/header";
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, X, FileText, Upload, ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { requestTypesApi } from "@/lib/request-types-api";
import { departmentsApi } from "@/lib/departments-api";
import { ticketsApi } from "@/lib/tickets-api";
import { useTicketPrioritiesQuery } from "@/hooks/use-ticket-priority";
import { useTicketStatusesQuery } from "@/hooks/use-ticket-status";

// Interface para arquivos anexados
interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

// Schema para Step 1 - Apenas Tipo de Solicitação
const step1Schema = z.object({
  request_type_id: z.string().min(1, "Tipo de solicitação é obrigatório"),
});

// Schema para Step 2 - Informações Completas
const step2Schema = z.object({
  request_type_id: z.string().min(1, "Tipo de solicitação é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  department_id: z.string().min(1, "Departamento é obrigatório"),
  priority_id: z.string().min(1, "Prioridade é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

export default function NewTicketFull() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [requestTypeSearch, setRequestTypeSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getAuthToken } = useAuth();

  // Simular usuário atual - em produção viria do contexto de auth
  const currentUser = {
    id: "user-1",
    name: "Usuário Atual",
    email: "usuario@empresa.com"
  };

  // Query para tipos de solicitação
  const { data: requestTypes = [], isLoading: requestTypesLoading } = useQuery({
    queryKey: ['request-types'],
    queryFn: requestTypesApi.getAll,
  });

  // Query para departamentos
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Query para prioridades
  const { data: priorities = [], isLoading: prioritiesLoading } = useTicketPrioritiesQuery();

  // Query para status - buscar o status padrão para novos tickets
  const { data: statuses = [], isLoading: statusesLoading } = useTicketStatusesQuery();

  // Forms para cada step
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      request_type_id: "",
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      request_type_id: "",
      title: "",
      department_id: "",
      priority_id: "",
      description: "",
    },
  });

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      // Buscar o status padrão para novos tickets (primeiro ativo encontrado ou um específico)
      const defaultStatus = statuses.find(s => s.isActive && (s.name.toLowerCase().includes('aberto') || s.name.toLowerCase().includes('open') || s.name.toLowerCase().includes('novo'))) 
        || statuses.find(s => s.isActive);
      
      if (!defaultStatus) {
        throw new Error('Nenhum status ativo encontrado para criar o ticket');
      }

      // Buscar dados adicionais necessários
      const priority = priorities.find(p => p.id === data.priority_id);
      const requestType = requestTypes.find(rt => rt.id === data.request_type_id);
      const department = departments.find(d => d.id === data.department_id);

      if (!priority || !requestType) {
        throw new Error('Dados obrigatórios não encontrados');
      }
      
      // Criar objeto no formato LocalTicket
      const ticketData = {
        code: '', // Será gerado pelo backend
        title: data.title,
        description: data.description,
        status: {
          id: defaultStatus.id,
          name: defaultStatus.name,
          color: defaultStatus.color,
        },
        priority: {
          id: priority.id,
          name: priority.name,
          color: priority.color,
        },
        requestType: {
          id: requestType.id,
          name: requestType.name,
          sla: requestType.sla || 0,
          color: requestType.color || '#3B82F6',
        },
        department: department ? {
          id: department.id,
          name: department.name,
        } : undefined,
        createdBy: {
          id: currentUser.id,
          name: currentUser.name,
        },
        updatedBy: {
          id: currentUser.id,
          name: currentUser.name,
        },
      };
      
      // Usar a API de tickets para criar
      const response = await ticketsApi.create(ticketData as any);
      return response;
    },
    onSuccess: (createdTicket) => {
      toast({
        title: "Sucesso",
        description: `Ticket criado com sucesso! ID: ${createdTicket.id}`,
      });
      // Redirecionar para a página de detalhes do ticket criado
      setLocation(`/ticket/${createdTicket.id}`);
    },
    onError: (error) => {
      console.error("Erro ao criar ticket:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Filtrar departamentos baseado no tipo de solicitação
  const getFilteredDepartments = () => {
    const selectedRequestType = step2Form.watch("request_type_id");
    if (!selectedRequestType) {
      return departments;
    }

    const requestType = requestTypes.find((rt) => rt.id === selectedRequestType);
    if (!requestType?.departmentIds || requestType.departmentIds.length === 0) {
      return departments;
    }

    // Se o requestType tem departmentIds específicos, filtrar para incluir apenas esses departamentos
    return departments.filter((dept) => 
      requestType.departmentIds?.includes(dept.id)
    );
  };

  // Filtrar tipos de solicitação baseado na busca com useCallback para evitar re-renderizações
  const getFilteredRequestTypes = useCallback(() => {
    if (!requestTypeSearch.trim()) {
      return requestTypes.filter((rt) => rt.isActive);
    }
    
    return requestTypes.filter((rt) =>
      rt.isActive && (
        rt.name.toLowerCase().includes(requestTypeSearch.toLowerCase()) ||
        rt.description?.toLowerCase().includes(requestTypeSearch.toLowerCase())
      )
    );
  }, [requestTypes, requestTypeSearch]);

  // Handler para mudança no input de busca com useCallback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestTypeSearch(e.target.value);
  }, []);

  // Navegação entre steps
  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await step1Form.trigger();
      if (isValid) {
        // Transferir dados do step 1 para o step 2
        const step1Data = step1Form.getValues();
        step2Form.setValue("request_type_id", step1Data.request_type_id);
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Lidar com upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: AttachedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result as string,
        };
        setAttachments((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset o input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  // Submit final
  const onSubmit = async (data: Step2FormData) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createTicketMutation.mutateAsync(data);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular progresso
  const progressPercent = (currentStep / 2) * 100;

  return (
    <>
      <Header 
        title="Novo Ticket - Formulário Completo"
        subtitle="Preencha todas as informações necessárias para criar seu ticket"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/my-tickets")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Meus Tickets
          </Button>
          
          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className={currentStep >= 1 ? "font-medium" : "text-muted-foreground"}>
                1. Tipo de Solicitação
              </span>
              <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>
                2. Informações Completas
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

      {/* Loading state */}
      {(requestTypesLoading || departmentsLoading || prioritiesLoading || statusesLoading) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Seleção de Tipo */}
      {!requestTypesLoading && !departmentsLoading && !prioritiesLoading && !statusesLoading && currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Tipo de Solicitação</CardTitle>
            <CardDescription>
              Escolha o tipo de solicitação para prosseguir com o formulário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...step1Form}>
              <form className="space-y-6">
                {/* Tipo de Solicitação com busca integrada */}
                <FormField
                  control={step1Form.control}
                  name="request_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Solicitação</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        onOpenChange={(open) => {
                          if (open) {
                            setRequestTypeSearch("");
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Digite para buscar ou selecione o tipo de solicitação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          className="w-full"
                          style={{ maxHeight: '320px', height: 'auto' }}
                        >
                          <div className="sticky top-0 bg-background px-2 py-1 border-b z-10">
                            <Input
                              placeholder="Buscar tipo de solicitação..."
                              value={requestTypeSearch}
                              onChange={handleSearchChange}
                              className="h-8"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                            {getFilteredRequestTypes().map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex flex-col">
                                  <div className="font-medium">{type.name}</div>
                                  {type.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {type.description}
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                            {getFilteredRequestTypes().length === 0 && (
                              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                Nenhum tipo de solicitação encontrado
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Digite para buscar ou role para encontrar o tipo de solicitação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button onClick={nextStep} disabled={!step1Form.formState.isValid || !step1Form.watch("request_type_id")}>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Informações Completas */}
      {!requestTypesLoading && !departmentsLoading && !prioritiesLoading && !statusesLoading && currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Completas</CardTitle>
            <CardDescription>
              Complete todas as informações necessárias para criar o ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Resumo do Step 1 */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-medium">Tipo de solicitação selecionado:</h3>
                  <div className="text-sm">
                    <p><strong>{requestTypes.find((rt) => rt.id === step2Form.watch("request_type_id"))?.name}</strong></p>
                    <p className="text-muted-foreground">{requestTypes.find((rt) => rt.id === step2Form.watch("request_type_id"))?.description}</p>
                  </div>
                </div>

                {/* Título */}
                <FormField
                  control={step2Form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Descreva brevemente o problema..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Departamento filtrado */}
                <FormField
                  control={step2Form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getFilteredDepartments().map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Departamentos disponíveis para este tipo de solicitação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Prioridade */}
                <FormField
                  control={step2Form.control}
                  name="priority_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.filter(priority => priority.isActive).map((priority) => (
                            <SelectItem key={priority.id} value={priority.id}>
                              <div className="flex items-center">
                                <Badge 
                                  className="mr-2" 
                                  style={{ backgroundColor: priority.color, color: '#fff' }}
                                >
                                  {priority.name}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={step2Form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva detalhadamente o problema, erro ou solicitação..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Seja específico para facilitar o atendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Atribuir a */}
                {/* Upload de Arquivos */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Anexos (Opcional)</label>
                    <p className="text-sm text-muted-foreground">
                      Adicione capturas de tela, documentos ou outros arquivos relevantes
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Adicionar Arquivo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>

                  {/* Lista de arquivos anexados */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Arquivos anexados:</h4>
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botões de navegação */}
                <div className="flex justify-between pt-6 border-t">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Criando..." : "Criar Ticket"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
        </div>
      </main>
    </>
  );
}
