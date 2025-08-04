import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Search, Filter } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InventoryItem } from "@shared/schema";

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  serialNumber: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "retired"]),
  assignedToId: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

const categories = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "mobile", label: "Dispositivos Móveis" },
  { value: "furniture", label: "Mobiliário" },
  { value: "network", label: "Equipamentos de Rede" },
  { value: "other", label: "Outros" },
];

const statusOptions = [
  { value: "available", label: "Disponível", color: "bg-green-100 text-green-800" },
  { value: "in_use", label: "Em Uso", color: "bg-blue-100 text-blue-800" },
  { value: "maintenance", label: "Manutenção", color: "bg-yellow-100 text-yellow-800" },
  { value: "retired", label: "Aposentado", color: "bg-gray-100 text-gray-800" },
];

export default function Inventory() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      serialNumber: "",
      status: "available",
      assignedToId: "",
      customFields: {},
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const response = await apiRequest("POST", "/api/inventory", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Item adicionado ao inventário!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryFormData> }) => {
      const response = await apiRequest("PATCH", `/api/inventory/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowDialog(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Item removido do inventário!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description || "",
      category: item.category,
      serialNumber: item.serialNumber || "",
      status: item.status as any,
      assignedToId: item.assignedToId || "",
      customFields: item.customFields || {},
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item do inventário?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const onSubmit = (data: InventoryFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const getCategoryStats = () => {
    const stats = categories.map(cat => ({
      ...cat,
      count: items.filter(item => item.category === cat.value).length
    }));
    return stats;
  };

  return (
    <>
      <Header 
        title="Inventário" 
        subtitle="Gerencie equipamentos e recursos da organização"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Inventário ({items.length} itens)
              </h2>
              <p className="text-sm text-gray-500">
                Controle todos os equipamentos e recursos da organização
              </p>
            </div>
            <Button
              data-testid="button-new-item"
              onClick={() => {
                setEditingItem(null);
                form.reset();
                setShowDialog(true);
              }}
              className="bg-primary hover:bg-primary-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-sm border border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      data-testid="input-search-inventory"
                      placeholder="Buscar por nome ou número de série..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category-filter" className="w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter" className="w-48">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {getCategoryStats().map((category) => (
              <Card key={category.value} className="shadow-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                  <div className="text-sm text-gray-500">{category.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Inventory Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Lista de Itens ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Número de Série</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const category = categories.find(c => c.value === item.category);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {category?.label || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.serialNumber || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.assignedToId ? `Usuário ${item.assignedToId.slice(0, 8)}` : "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              data-testid={`button-edit-item-${item.id}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              data-testid={`button-delete-item-${item.id}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Item Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Item" : "Adicionar Item"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Item</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-item-name"
                          placeholder="Ex: Notebook Dell Latitude"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-item-category">
                            <SelectValue placeholder="Selecione a categoria..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-item-description"
                        placeholder="Descreva o item..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-serial-number"
                          placeholder="Ex: ABC123456"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-item-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-assigned-to"
                        placeholder="ID do usuário responsável"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  data-testid="button-cancel-item"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-item"
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="bg-primary hover:bg-primary-600"
                >
                  {editingItem ? "Atualizar" : "Adicionar"} Item
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
