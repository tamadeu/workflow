import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TicketFilters } from "@/lib/types";
import type { Queue, Label as LabelType } from "@shared/schema";

interface AdvancedFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
}

export default function AdvancedFilter({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange 
}: AdvancedFilterProps) {
  const [localFilters, setLocalFilters] = useState<TicketFilters>(filters);

  const { data: queues } = useQuery<Queue[]>({
    queryKey: ["/api/queues"],
  });

  const { data: labels } = useQuery<LabelType[]>({
    queryKey: ["/api/labels"],
  });

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

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = localFilters.status || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        status: [...currentStatus, status],
      });
    } else {
      setLocalFilters({
        ...localFilters,
        status: currentStatus.filter(s => s !== status),
      });
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriority = localFilters.priority || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        priority: [...currentPriority, priority],
      });
    } else {
      setLocalFilters({
        ...localFilters,
        priority: currentPriority.filter(p => p !== priority),
      });
    }
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const emptyFilters: TicketFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-4xl w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>Filtro Avançado de Chamados</DialogTitle>
        </DialogHeader>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Período</Label>
              <div className="space-y-2">
                <Input
                  data-testid="input-start-date"
                  type="date"
                  value={localFilters.startDate || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                />
                <Input
                  data-testid="input-end-date"
                  type="date"
                  value={localFilters.endDate || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                />
              </div>
            </div>
            
            {/* Status */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Status</Label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      data-testid={`checkbox-status-${option.value}`}
                      checked={localFilters.status?.includes(option.value) || false}
                      onCheckedChange={(checked) => 
                        handleStatusChange(option.value, checked as boolean)
                      }
                    />
                    <Label className="text-sm text-gray-600">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Prioridade</Label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      data-testid={`checkbox-priority-${option.value}`}
                      checked={localFilters.priority?.includes(option.value) || false}
                      onCheckedChange={(checked) => 
                        handlePriorityChange(option.value, checked as boolean)
                      }
                    />
                    <Label className="text-sm text-gray-600">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Queues */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Fila de Atendimento</Label>
              <Select
                value={localFilters.queueId?.[0] || ""}
                onValueChange={(value) => 
                  setLocalFilters({ ...localFilters, queueId: value ? [value] : [] })
                }
              >
                <SelectTrigger data-testid="select-queue-filter">
                  <SelectValue placeholder="Selecione as filas..." />
                </SelectTrigger>
                <SelectContent>
                  {queues?.map((queue) => (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Labels */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Rótulos</Label>
              <Input
                data-testid="input-labels-filter"
                placeholder="Digite rótulos separados por vírgula"
                value={localFilters.labels?.join(", ") || ""}
                onChange={(e) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    labels: e.target.value.split(",").map(l => l.trim()).filter(Boolean)
                  })
                }
              />
              {labels && labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {labels.slice(0, 6).map((label) => (
                    <span
                      key={label.id}
                      data-testid={`label-${label.name}`}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              data-testid="button-clear-filters"
              type="button"
              variant="outline"
              onClick={handleClear}
            >
              Limpar Filtros
            </Button>
            <Button
              data-testid="button-cancel-filter"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              data-testid="button-apply-filters"
              type="button"
              className="bg-primary hover:bg-primary-600"
              onClick={handleApply}
            >
              Aplicar Filtros
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
