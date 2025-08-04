import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Calendar, Filter, CheckCircle } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, Queue, Label as LabelType } from "@shared/schema";

const exportFormats = [
  { value: "csv", label: "CSV", icon: FileText, description: "Arquivo separado por vírgulas" },
  { value: "excel", label: "Excel", icon: FileText, description: "Planilha Microsoft Excel" },
  { value: "pdf", label: "PDF", icon: FileText, description: "Documento PDF" },
  { value: "json", label: "JSON", icon: FileText, description: "Formato JSON" },
];

const exportTemplates = [
  {
    id: "all_tickets",
    name: "Todos os Chamados",
    description: "Exporta todos os campos dos chamados",
    fields: ["id", "title", "status", "priority", "queue", "requester", "created_at", "updated_at"]
  },
  {
    id: "summary_report",
    name: "Relatório Resumido",
    description: "Relatório com informações principais",
    fields: ["id", "title", "status", "priority", "created_at"]
  },
  {
    id: "sla_report",
    name: "Relatório SLA",
    description: "Foco em métricas de SLA",
    fields: ["id", "title", "priority", "sla_deadline", "resolved_at", "time_spent"]
  },
  {
    id: "custom",
    name: "Personalizado",
    description: "Selecione os campos manualmente",
    fields: []
  }
];

const availableFields = [
  { id: "id", label: "ID do Chamado", category: "basic" },
  { id: "number", label: "Número", category: "basic" },
  { id: "title", label: "Título", category: "basic" },
  { id: "description", label: "Descrição", category: "basic" },
  { id: "status", label: "Status", category: "basic" },
  { id: "priority", label: "Prioridade", category: "basic" },
  { id: "queue", label: "Fila", category: "assignment" },
  { id: "requester", label: "Solicitante", category: "assignment" },
  { id: "assignee", label: "Responsável", category: "assignment" },
  { id: "created_at", label: "Data de Criação", category: "dates" },
  { id: "updated_at", label: "Última Atualização", category: "dates" },
  { id: "resolved_at", label: "Data de Resolução", category: "dates" },
  { id: "closed_at", label: "Data de Fechamento", category: "dates" },
  { id: "sla_deadline", label: "Prazo SLA", category: "sla" },
  { id: "time_spent", label: "Tempo Gasto", category: "sla" },
  { id: "labels", label: "Rótulos", category: "metadata" },
  { id: "custom_fields", label: "Campos Personalizados", category: "metadata" },
];

const fieldCategories = [
  { id: "basic", label: "Informações Básicas" },
  { id: "assignment", label: "Atribuição" },
  { id: "dates", label: "Datas" },
  { id: "sla", label: "SLA" },
  { id: "metadata", label: "Metadados" },
];

export default function Export() {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedTemplate, setSelectedTemplate] = useState("all_tickets");
  const [selectedFields, setSelectedFields] = useState<string[]>(exportTemplates[0].fields);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [queueFilter, setQueueFilter] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: queues = [] } = useQuery<Queue[]>({
    queryKey: ["/api/queues"],
  });

  const { data: labels = [] } = useQuery<LabelType[]>({
    queryKey: ["/api/labels"],
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = exportTemplates.find(t => t.id === templateId);
    if (template && templateId !== "custom") {
      setSelectedFields(template.fields);
    } else if (templateId === "custom") {
      setSelectedFields([]);
    }
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    }
  };

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    switch (type) {
      case "status":
        setStatusFilter(prev => 
          checked ? [...prev, value] : prev.filter(s => s !== value)
        );
        break;
      case "priority":
        setPriorityFilter(prev =>
          checked ? [...prev, value] : prev.filter(p => p !== value)
        );
        break;
      case "queue":
        setQueueFilter(prev =>
          checked ? [...prev, value] : prev.filter(q => q !== value)
        );
        break;
    }
  };

  const getFilteredTicketsCount = () => {
    let filtered = tickets;
    
    if (statusFilter.length > 0) {
      filtered = filtered.filter(t => statusFilter.includes(t.status));
    }
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(t => priorityFilter.includes(t.priority));
    }
    if (queueFilter.length > 0) {
      filtered = filtered.filter(t => t.queueId && queueFilter.includes(t.queueId));
    }
    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(dateRange.end));
    }
    
    return filtered.length;
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um campo para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: `Arquivo ${selectedFormat.toUpperCase()} exportado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const statusOptions = [
    { value: "open", label: "Aberto" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "resolved", label: "Resolvido" },
    { value: "closed", label: "Fechado" },
  ];

  const priorityOptions = [
    { value: "critical", label: "Crítica" },
    { value: "high", label: "Alta" },
    { value: "medium", label: "Média" },
    { value: "low", label: "Baixa" },
  ];

  return (
    <>
      <Header 
        title="Exportar Dados" 
        subtitle="Exporte chamados e relatórios em diversos formatos"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Format Selection */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Formato de Exportação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {exportFormats.map((format) => {
                      const Icon = format.icon;
                      return (
                        <div
                          key={format.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedFormat === format.value
                              ? "border-primary bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedFormat(format.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-6 h-6 text-primary" />
                            <div>
                              <div className="font-medium">{format.label}</div>
                              <div className="text-sm text-gray-500">{format.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Template Selection */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Modelo de Exportação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? "border-primary bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleTemplateChange(template.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {template.fields.length > 0 ? `${template.fields.length} campos` : "Personalizar"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Field Selection */}
              {selectedTemplate === "custom" && (
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Selecionar Campos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {fieldCategories.map((category) => (
                        <div key={category.id}>
                          <h3 className="font-medium text-gray-900 mb-3">{category.label}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {availableFields
                              .filter(field => field.category === category.id)
                              .map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    data-testid={`checkbox-field-${field.id}`}
                                    checked={selectedFields.includes(field.id)}
                                    onCheckedChange={(checked) => 
                                      handleFieldToggle(field.id, checked as boolean)
                                    }
                                  />
                                  <Label className="text-sm">{field.label}</Label>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Filters */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>Filtros</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Período</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-gray-500">Data Inicial</Label>
                        <Input
                          data-testid="input-start-date"
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Data Final</Label>
                        <Input
                          data-testid="input-end-date"
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {statusOptions.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            data-testid={`checkbox-status-${status.value}`}
                            checked={statusFilter.includes(status.value)}
                            onCheckedChange={(checked) => 
                              handleFilterChange("status", status.value, checked as boolean)
                            }
                          />
                          <Label className="text-sm">{status.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Priority Filter */}
                  <div>
                    <Label className="text-sm font-medium">Prioridade</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {priorityOptions.map((priority) => (
                        <div key={priority.value} className="flex items-center space-x-2">
                          <Checkbox
                            data-testid={`checkbox-priority-${priority.value}`}
                            checked={priorityFilter.includes(priority.value)}
                            onCheckedChange={(checked) => 
                              handleFilterChange("priority", priority.value, checked as boolean)
                            }
                          />
                          <Label className="text-sm">{priority.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Queue Filter */}
                  <div>
                    <Label className="text-sm font-medium">Filas</Label>
                    <div className="space-y-2 mt-2">
                      {queues.map((queue) => (
                        <div key={queue.id} className="flex items-center space-x-2">
                          <Checkbox
                            data-testid={`checkbox-queue-${queue.id}`}
                            checked={queueFilter.includes(queue.id)}
                            onCheckedChange={(checked) => 
                              handleFilterChange("queue", queue.id, checked as boolean)
                            }
                          />
                          <Label className="text-sm">{queue.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary and Export */}
            <div className="space-y-6">
              {/* Export Summary */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Resumo da Exportação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Formato:</span>
                    <Badge variant="outline">{selectedFormat.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium">
                      {exportTemplates.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Campos:</span>
                    <span className="font-medium">{selectedFields.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registros:</span>
                    <span data-testid="export-records-count" className="font-medium text-primary">
                      {getFilteredTicketsCount()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Fields Preview */}
              {selectedFields.length > 0 && (
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Campos Selecionados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedFields.map((fieldId) => {
                        const field = availableFields.find(f => f.id === fieldId);
                        return field ? (
                          <Badge key={fieldId} variant="secondary" className="text-xs">
                            {field.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Export Actions */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    data-testid="button-export"
                    onClick={handleExport}
                    disabled={isExporting || selectedFields.length === 0}
                    className="w-full bg-primary hover:bg-primary-600"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Dados
                      </>
                    )}
                  </Button>
                  
                  <Button
                    data-testid="button-schedule-export"
                    variant="outline"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Exportação
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Exports */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Exportações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">chamados_junho.csv</div>
                        <div className="text-xs text-gray-500">2 dias atrás</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">relatorio_sla.xlsx</div>
                        <div className="text-xs text-gray-500">1 semana atrás</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">dados_completos.pdf</div>
                        <div className="text-xs text-gray-500">2 semanas atrás</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
