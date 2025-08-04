import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock, Calendar } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WorkSchedule } from "@shared/schema";

const workScheduleFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  timezone: z.string().min(1, "Fuso horário é obrigatório"),
  isActive: z.boolean().default(true),
  schedule: z.object({
    monday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    tuesday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    wednesday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    thursday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    friday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    saturday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    sunday: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
});

type WorkScheduleFormData = z.infer<typeof workScheduleFormSchema>;

const defaultSchedule = {
  monday: { enabled: true, start: "09:00", end: "18:00" },
  tuesday: { enabled: true, start: "09:00", end: "18:00" },
  wednesday: { enabled: true, start: "09:00", end: "18:00" },
  thursday: { enabled: true, start: "09:00", end: "18:00" },
  friday: { enabled: true, start: "09:00", end: "18:00" },
  saturday: { enabled: false, start: "09:00", end: "18:00" },
  sunday: { enabled: false, start: "09:00", end: "18:00" },
};

const weekDays = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira", 
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const timezones = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/New_York", label: "Nova York (GMT-5)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

export default function WorkSchedules() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<WorkSchedule[]>({
    queryKey: ["/api/work-schedules"],
  });

  const form = useForm<WorkScheduleFormData>({
    resolver: zodResolver(workScheduleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      timezone: "America/Sao_Paulo",
      isActive: true,
      schedule: defaultSchedule,
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: WorkScheduleFormData) => {
      const response = await apiRequest("POST", "/api/work-schedules", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Jornada de trabalho criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-schedules"] });
      setShowDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar jornada de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkScheduleFormData> }) => {
      const response = await apiRequest("PATCH", `/api/work-schedules/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Jornada de trabalho atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-schedules"] });
      setShowDialog(false);
      setEditingSchedule(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar jornada de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    form.reset({
      name: schedule.name,
      description: schedule.description || "",
      timezone: schedule.timezone,
      isActive: schedule.isActive,
      schedule: schedule.schedule as any || defaultSchedule,
    });
    setShowDialog(true);
  };

  const onSubmit = (data: WorkScheduleFormData) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, data });
    } else {
      createScheduleMutation.mutate(data);
    }
  };

  const getWorkingDays = (schedule: any) => {
    if (!schedule) return 0;
    return Object.values(schedule).filter((day: any) => day.enabled).length;
  };

  return (
    <>
      <Header 
        title="Jornadas de Trabalho" 
        subtitle="Configure os horários de trabalho para cálculo de SLA"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Jornadas de Trabalho ({schedules.length})
              </h2>
              <p className="text-sm text-gray-500">
                Defina os horários de trabalho para cálculo correto de SLA
              </p>
            </div>
            <Button
              data-testid="button-new-schedule"
              onClick={() => {
                setEditingSchedule(null);
                form.reset();
                setShowDialog(true);
              }}
              className="bg-primary hover:bg-primary-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Jornada
            </Button>
          </div>

          {/* Schedules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-semibold">
                        {schedule.name}
                      </CardTitle>
                    </div>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>
                      {schedule.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {schedule.description || "Sem descrição"}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Dias de trabalho:</span>
                      <span className="font-medium">
                        {getWorkingDays(schedule.schedule)} dias
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Fuso horário:</span>
                      <span className="font-medium text-xs">
                        {schedule.timezone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Criada em:</span>
                      <span className="font-medium text-xs">
                        {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      data-testid={`button-edit-schedule-${schedule.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schedules Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Lista Completa de Jornadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Dias de Trabalho</TableHead>
                    <TableHead>Fuso Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {schedule.description || "—"}
                      </TableCell>
                      <TableCell>
                        {getWorkingDays(schedule.schedule)} dias
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {schedule.timezone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Schedule Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Editar Jornada" : "Nova Jornada"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Jornada</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-schedule-name"
                          placeholder="Ex: Horário Comercial"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuso Horário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
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
                        data-testid="textarea-schedule-description"
                        placeholder="Descreva quando usar esta jornada..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weekly Schedule */}
              <div>
                <FormLabel className="text-base font-semibold">Horários da Semana</FormLabel>
                <div className="mt-3 space-y-3">
                  {Object.entries(weekDays).map(([day, dayLabel]) => (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <FormField
                        control={form.control}
                        name={`schedule.${day as keyof typeof defaultSchedule}.enabled`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="w-32">
                        <span className="text-sm font-medium">{dayLabel}</span>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`schedule.${day as keyof typeof defaultSchedule}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`schedule.${day as keyof typeof defaultSchedule}.enabled`)}
                                className="w-24"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <span className="text-sm text-gray-500">até</span>
                      
                      <FormField
                        control={form.control}
                        name={`schedule.${day as keyof typeof defaultSchedule}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`schedule.${day as keyof typeof defaultSchedule}.enabled`)}
                                className="w-24"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Jornada Ativa</FormLabel>
                    <FormControl>
                      <Switch
                        data-testid="switch-schedule-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  data-testid="button-cancel-schedule"
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  data-testid="button-save-schedule"
                  type="submit"
                  disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
                  className="bg-primary hover:bg-primary-600"
                >
                  {editingSchedule ? "Atualizar" : "Criar"} Jornada
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
