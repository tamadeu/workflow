import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { workSchedulesApi, type LocalWorkSchedule } from "@/lib/work-schedules-api";

const workScheduleFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  isActive: z.boolean().default(true),
  is24x7: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  mondayStart: z.string().nullable(),
  mondayEnd: z.string().nullable(),
  tuesdayStart: z.string().nullable(),
  tuesdayEnd: z.string().nullable(),
  wednesdayStart: z.string().nullable(),
  wednesdayEnd: z.string().nullable(),
  thursdayStart: z.string().nullable(),
  thursdayEnd: z.string().nullable(),
  fridayStart: z.string().nullable(),
  fridayEnd: z.string().nullable(),
  saturdayStart: z.string().nullable(),
  saturdayEnd: z.string().nullable(),
  sundayStart: z.string().nullable(),
  sundayEnd: z.string().nullable(),
});

type WorkScheduleFormData = z.infer<typeof workScheduleFormSchema>;

const weekDays = [
  { key: 'monday', label: 'Segunda-feira', startField: 'mondayStart', endField: 'mondayEnd' },
  { key: 'tuesday', label: 'Terça-feira', startField: 'tuesdayStart', endField: 'tuesdayEnd' },
  { key: 'wednesday', label: 'Quarta-feira', startField: 'wednesdayStart', endField: 'wednesdayEnd' },
  { key: 'thursday', label: 'Quinta-feira', startField: 'thursdayStart', endField: 'thursdayEnd' },
  { key: 'friday', label: 'Sexta-feira', startField: 'fridayStart', endField: 'fridayEnd' },
  { key: 'saturday', label: 'Sábado', startField: 'saturdayStart', endField: 'saturdayEnd' },
  { key: 'sunday', label: 'Domingo', startField: 'sundayStart', endField: 'sundayEnd' },
] as const;

export default function WorkSchedules() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LocalWorkSchedule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["work-schedules"],
    queryFn: workSchedulesApi.getAll,
  });

  const form = useForm<WorkScheduleFormData>({
    resolver: zodResolver(workScheduleFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
      is24x7: false,
      isDefault: false,
      mondayStart: "09:00",
      mondayEnd: "17:00",
      tuesdayStart: "09:00",
      tuesdayEnd: "17:00",
      wednesdayStart: "09:00",
      wednesdayEnd: "17:00",
      thursdayStart: "09:00",
      thursdayEnd: "17:00",
      fridayStart: "09:00",
      fridayEnd: "17:00",
      saturdayStart: null,
      saturdayEnd: null,
      sundayStart: null,
      sundayEnd: null,
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: workSchedulesApi.create,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Jornada de trabalho criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<LocalWorkSchedule> }) =>
      workSchedulesApi.update(id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Jornada de trabalho atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
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

  const deleteScheduleMutation = useMutation({
    mutationFn: workSchedulesApi.delete,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Jornada de trabalho excluída com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir jornada de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (schedule: LocalWorkSchedule) => {
    setEditingSchedule(schedule);
    form.reset({
      name: schedule.name,
      isActive: schedule.isActive,
      is24x7: schedule.is24x7,
      isDefault: schedule.isDefault,
      mondayStart: schedule.mondayStart,
      mondayEnd: schedule.mondayEnd,
      tuesdayStart: schedule.tuesdayStart,
      tuesdayEnd: schedule.tuesdayEnd,
      wednesdayStart: schedule.wednesdayStart,
      wednesdayEnd: schedule.wednesdayEnd,
      thursdayStart: schedule.thursdayStart,
      thursdayEnd: schedule.thursdayEnd,
      fridayStart: schedule.fridayStart,
      fridayEnd: schedule.fridayEnd,
      saturdayStart: schedule.saturdayStart,
      saturdayEnd: schedule.saturdayEnd,
      sundayStart: schedule.sundayStart,
      sundayEnd: schedule.sundayEnd,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta jornada de trabalho?")) {
      deleteScheduleMutation.mutate(id);
    }
  };

  const onSubmit = (data: WorkScheduleFormData) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, data });
    } else {
      createScheduleMutation.mutate(data as Omit<LocalWorkSchedule, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const getWorkingDays = (schedule: LocalWorkSchedule) => {
    let count = 0;
    if (schedule.mondayStart && schedule.mondayEnd) count++;
    if (schedule.tuesdayStart && schedule.tuesdayEnd) count++;
    if (schedule.wednesdayStart && schedule.wednesdayEnd) count++;
    if (schedule.thursdayStart && schedule.thursdayEnd) count++;
    if (schedule.fridayStart && schedule.fridayEnd) count++;
    if (schedule.saturdayStart && schedule.saturdayEnd) count++;
    if (schedule.sundayStart && schedule.sundayEnd) count++;
    return count;
  };

  const isWorkingDay = (startTime: string | null, endTime: string | null) => {
    return !!(startTime && endTime);
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
                    <div className="flex flex-col gap-1">
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      {schedule.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                      {schedule.is24x7 && (
                        <Badge variant="secondary" className="text-xs">
                          24/7
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Dias de trabalho:</span>
                      <span className="font-medium">
                        {getWorkingDays(schedule)} dias
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
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
                    <TableHead>Dias de Trabalho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>
                        {getWorkingDays(schedule)} dias
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {schedule.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                          {schedule.is24x7 && (
                            <Badge variant="secondary" className="text-xs">
                              24/7
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

                <div className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="is24x7"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>24 horas / 7 dias</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Jornada Padrão</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Weekly Schedule */}
              {!form.watch("is24x7") && (
                <div>
                  <FormLabel className="text-base font-semibold">Horários da Semana</FormLabel>
                  <div className="mt-3 space-y-3">
                    {weekDays.map((day) => {
                      const startFieldName = day.startField as keyof WorkScheduleFormData;
                      const endFieldName = day.endField as keyof WorkScheduleFormData;
                      const startValue = form.watch(startFieldName) as string | null;
                      const endValue = form.watch(endFieldName) as string | null;
                      const isEnabled = isWorkingDay(startValue, endValue);

                      return (
                        <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(enabled) => {
                                if (enabled) {
                                  form.setValue(startFieldName, "09:00" as any);
                                  form.setValue(endFieldName, "17:00" as any);
                                } else {
                                  form.setValue(startFieldName, null as any);
                                  form.setValue(endFieldName, null as any);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="w-32">
                            <span className="text-sm font-medium">{day.label}</span>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={startFieldName}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...field}
                                    value={typeof field.value === 'string' ? field.value : ""}
                                    disabled={!isEnabled}
                                    className="w-24"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <span className="text-sm text-gray-500">até</span>
                          
                          <FormField
                            control={form.control}
                            name={endFieldName}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...field}
                                    value={typeof field.value === 'string' ? field.value : ""}
                                    disabled={!isEnabled}
                                    className="w-24"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
