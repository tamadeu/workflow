import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send, Paperclip, X, FileText, Image, Zap, Upload } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

const fullTicketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  priority: z.enum(["baixa", "normal", "alta", "urgente"]),
  queueId: z.string().min(1, "Selecione uma fila"),
  typeId: z.string().min(1, "Selecione um tipo"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  estimatedHours: z.number().min(0).optional(),
  dueDate: z.string().optional(),
});

type FullTicketFormData = z.infer<typeof fullTicketSchema>;

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function NewTicketFull() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FullTicketFormData>({
    resolver: zodResolver(fullTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
      queueId: "",
      typeId: "",
      clientEmail: "",
      tags: [],
      estimatedHours: undefined,
      dueDate: "",
    },
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
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

  const addTag = () => {
    if (currentTag.trim()) {
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(currentTag.trim())) {
        form.setValue("tags", [...currentTags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: FullTicketFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simular upload dos anexos e criação do ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Ticket criado com sucesso!",
        description: `Ticket criado com ${attachments.length} anexo(s) e descrição completa.`,
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
      <Header title="Abertura Completa" />
      
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
                <h1 className="text-xl font-semibold">Abertura Completa</h1>
                <p className="text-sm text-muted-foreground">Criação detalhada com anexos e formatação</p>
              </div>
            </div>
            
            <Link to="/tickets/new/quick">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Abertura Rápida
              </Button>
            </Link>
          </div>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do ticket
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
                            placeholder="Ex: Implementar nova funcionalidade no sistema"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Linha 1: Prioridade, Fila, Tipo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Prioridade" />
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

                    <FormField
                      control={form.control}
                      name="typeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="incidente">Incidente</SelectItem>
                              <SelectItem value="solicitacao">Solicitação</SelectItem>
                              <SelectItem value="problema">Problema</SelectItem>
                              <SelectItem value="mudanca">Mudança</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Linha 2: Email, Horas Estimadas, Data Limite */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <FormField
                      control={form.control}
                      name="estimatedHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas Estimadas (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-estimated-hours"
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Limite (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-due-date"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch("tags").map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        data-testid="input-tag"
                        placeholder="Digite uma tag e pressione Enter"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} size="sm" variant="outline">
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Descrição com WYSIWYG */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Detalhada</FormLabel>
                        <FormControl>
                          <div className="border rounded-md">
                            <ReactQuill
                              theme="snow"
                              value={field.value}
                              onChange={field.onChange}
                              modules={quillModules}
                              style={{ minHeight: '200px' }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Anexos */}
                  <div className="space-y-3">
                    <FormLabel>Anexos</FormLabel>
                    
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                      type="submit"
                      data-testid="button-submit-full-ticket"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary hover:bg-primary-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Criando..." : "Criar Ticket Completo"}
                    </Button>
                    
                    <Link to="/tickets/new/quick" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Criar Versão Rápida
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