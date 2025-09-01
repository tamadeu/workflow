import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Send, Paperclip, X, FileText, Image, Zap, Upload, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateTicket } from "@/hooks/use-tickets-api";
import { ticketStatusApi } from "@/lib/ticket-status-api";
import { ticketPriorityApi } from "@/lib/ticket-priority-api";
import { usersApi } from "@/lib/users-api";
import { requestTypesApi } from "@/lib/request-types-api";
import { departmentsApi } from "@/lib/departments-api";
import Header from "@/components/layout/header";

// Schema para a primeira etapa (Tipo de Solicitação e Departamento)
const step1Schema = z.object({
  request_type_id: z.string().min(1, "Selecione um tipo de solicitação"),
  department_id: z.string().min(1, "Selecione um departamento"),
});

// Schema para a segunda etapa (demais campos)
const step2Schema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  status_id: z.string().min(1, "Selecione um status"),
  priority_id: z.string().min(1, "Selecione uma prioridade"),
  responsible_user_id: z.string().optional(),
});

// Schema completo
const fullTicketSchema = step1Schema.merge(step2Schema);

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type FullTicketFormData = z.infer<typeof fullTicketSchema>;

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function NewTicketFullWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar dados das APIs
  const { data: statuses = [], isLoading: statusesLoading } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusApi.getAll(),
  });

  const { data: priorities = [], isLoading: prioritiesLoading } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPriorityApi.getAll(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const { data: requestTypes = [], isLoading: requestTypesLoading } = useQuery({
    queryKey: ['request-types'],
    queryFn: () => requestTypesApi.getAll(),
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  });

  // Hook para criar ticket
  const createTicketMutation = useCreateTicket();

  const form = useForm<FullTicketFormData>({
    resolver: zodResolver(currentStep === 1 ? step1Schema : fullTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      status_id: "",
      priority_id: "",
      responsible_user_id: "",
      request_type_id: "",
      department_id: "",
    },
  });

  // Funções de navegação do wizard
  const nextStep = async () => {
    if (currentStep === 1) {
      // Validar apenas os campos do step 1
      const step1Data = {
        request_type_id: form.getValues("request_type_id"),
        department_id: form.getValues("department_id"),
      };
      
      const result = step1Schema.safeParse(step1Data);
      if (!result.success) {
        // Mostrar erros de validação
        result.error.issues.forEach((issue) => {
          form.setError(issue.path[0] as keyof FullTicketFormData, {
            message: issue.message,
          });
        });
        return;
      }
      
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments: AttachedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = async (data: FullTicketFormData) => {
    setIsSubmitting(true);
    
    try {
      // Adaptar dados para o formato da API
      const ticketData = {
        title: data.title,
        code: "", // Será gerado pelo backend
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
        responsibleUser: data.responsible_user_id ? {
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
          id: "current-user-id", // TODO: Get from auth context
          name: "Current User", // TODO: Get from auth context
        },
        updatedBy: {
          id: "current-user-id", // TODO: Get from auth context
          name: "Current User", // TODO: Get from auth context
        },
      };

      const result = await createTicketMutation.mutateAsync(ticketData);
      
      toast({
        title: "Sucesso!",
        description: "Ticket criado com sucesso.",
      });
      
      setLocation(`/ticket/${result.id}`);
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (statusesLoading || prioritiesLoading || usersLoading || requestTypesLoading || departmentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Abertura Completa - Wizard" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
          
          {/* Header com opções */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/my-tickets">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Abertura Completa - Wizard</h1>
                <p className="text-sm text-muted-foreground">Criação guiada em etapas</p>
              </div>
            </div>
            
            <Link to="/tickets/new/quick">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Abertura Rápida
              </Button>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Tipo & Departamento</span>
              </div>
              
              <div className={`w-12 h-px ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Detalhes do Ticket</span>
              </div>
            </div>
          </div>

          {/* Wizard Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 ? "Passo 1: Tipo de Solicitação e Departamento" : "Passo 2: Detalhes do Ticket"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 
                  ? "Primeiro, escolha o tipo de solicitação e o departamento responsável"
                  : "Agora preencha os detalhes do seu ticket"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(currentStep === 1 ? nextStep : onSubmit)} className="space-y-6">
                  
                  {/* STEP 1 */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {/* Tipo de Solicitação */}
                      <FormField
                        control={form.control}
                        name="request_type_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Solicitação *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-request-type">
                                  <SelectValue placeholder="Selecione o tipo de solicitação" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {requestTypes.filter(type => type.isActive && type.id).map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: type.color }}
                                      />
                                      <span>{type.name}</span>
                                      {type.sla && (
                                        <span className="text-xs text-gray-500">
                                          (SLA: {type.sla > 60 ? `${Math.floor(type.sla / 60)}h` : `${type.sla}min`})
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Departamento */}
                      <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o departamento responsável" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.filter(dept => dept.isActive && dept.id).map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    <div className="flex items-center space-x-2">
                                      <span>{dept.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Botão para próximo passo */}
                      <div className="flex justify-end">
                        <Button type="submit" className="w-full sm:w-auto">
                          Próximo
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {/* Título */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-ticket-title"
                                placeholder="Ex: Implementar nova funcionalidade no sistema"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Linha 1: Status, Prioridade */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="status_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-status">
                                    <SelectValue placeholder="Status" />
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

                        <FormField
                          control={form.control}
                          name="priority_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
                                    <SelectValue placeholder="Prioridade" />
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
                      </div>

                      {/* Responsável */}
                      <FormField
                        control={form.control}
                        name="responsible_user_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável (Opcional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar responsável" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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

                      {/* Descrição */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição Detalhada *</FormLabel>
                            <FormControl>
                              <Textarea
                                data-testid="textarea-description"
                                placeholder="Descreva detalhadamente o problema ou solicitação..."
                                className="min-h-[200px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Anexos */}
                      <div className="space-y-3">
                        <FormLabel>Anexos (Opcional)</FormLabel>
                        
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 lg:p-6 text-center">
                          <Upload className="w-6 h-6 lg:w-8 lg:h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Arraste arquivos aqui ou clique para selecionar
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            data-testid="input-file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Selecionar Arquivos
                          </Button>
                        </div>

                        {/* Lista de anexos */}
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {attachment.type.startsWith('image/') ? (
                                    <Image className="w-5 h-5 text-blue-500" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-gray-500" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{attachment.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(attachment.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botões de navegação */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="w-full sm:w-auto"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Voltar
                        </Button>
                        
                        <Button
                          type="submit"
                          data-testid="button-submit-full-ticket"
                          disabled={isSubmitting}
                          className="flex-1 bg-primary hover:bg-primary-600"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Criando..." : "Criar Ticket"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
