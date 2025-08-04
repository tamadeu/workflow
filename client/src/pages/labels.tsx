import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Label } from "@shared/schema";

const labelFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
});

type LabelFormData = z.infer<typeof labelFormSchema>;

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

export default function Labels() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labels = [], isLoading } = useQuery<Label[]>({
    queryKey: ["/api/labels"],
  });

  const form = useForm<LabelFormData>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: async (data: LabelFormData) => {
      const response = await apiRequest("POST", "/api/labels", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Rótulo criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      setShowDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar rótulo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LabelFormData> }) => {
      const response = await apiRequest("PATCH", `/api/labels/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Rótulo atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      setShowDialog(false);
      setEditingLabel(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar rótulo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/labels/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Rótulo excluído com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir rótulo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    form.reset({
      name: label.name,
      description: label.description || "",
      color: label.color,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este rótulo?")) {
      deleteLabelMutation.mutate(id);
    }
  };

  const onSubmit = (data: LabelFormData) => {
    if (editingLabel) {
      updateLabelMutation.mutate({ id: editingLabel.id, data });
    } else {
      createLabelMutation.mutate(data);
    }
  };

  return (
    <>
      <Header 
        title="Rótulos" 
        subtitle="Gerencie os rótulos para organização dos chamados"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Rótulos ({labels.length})
              </h2>
              <p className="text-sm text-gray-500">
                Crie e organize rótulos para facilitar a categorização dos chamados
              </p>
            </div>
            <Button
              data-testid="button-new-label"
              onClick={() => {
                setEditingLabel(null);
                form.reset();
                setShowDialog(true);
              }}
              className="bg-primary hover:bg-primary-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Rótulo
            </Button>
          </div>

          {/* Labels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {labels.map((label) => (
              <Card key={label.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      style={{ 
                        backgroundColor: `${label.color}20`, 
                        color: label.color,
                        borderColor: `${label.color}40`
                      }}
                      className="px-3 py-1 text-sm font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {label.name}
                    </Badge>
                  </div>
                  
                  {label.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {label.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>0 chamados</span>
                    <span>{new Date(label.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`button-edit-label-${label.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(label)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      data-testid={`button-delete-label-${label.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(label.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Labels Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Lista Completa de Rótulos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rótulo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: `${label.color}20`, 
                            color: label.color 
                          }}
                          className="font-medium"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {label.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {label.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="text-xs font-mono">{label.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>0 chamados</TableCell>
                      <TableCell>
                        {new Date(label.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(label)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(label.id)}
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

      {/* Label Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLabel ? "Editar Rótulo" : "Novo Rótulo"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Rótulo</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-label-name"
                        placeholder="Ex: urgente, hardware, rede"
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
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-label-description"
                        placeholder="Descreva quando usar este rótulo..."
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
                            data-testid="input-label-color"
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

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-label"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-label"
                  type="submit"
                  disabled={createLabelMutation.isPending || updateLabelMutation.isPending}
                  className="bg-primary hover:bg-primary-600"
                >
                  {editingLabel ? "Atualizar" : "Criar"} Rótulo
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
