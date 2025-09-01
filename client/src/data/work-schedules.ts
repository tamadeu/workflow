export const workSchedulesData = [
  {
    id: "schedule-comercial",
    name: "Horário Comercial",
    description: "Segunda a sexta, 8h às 18h",
    timezone: "America/Sao_Paulo",
    isActive: true,
    schedule: {
      monday: { start: "08:00", end: "18:00", enabled: true },
      tuesday: { start: "08:00", end: "18:00", enabled: true },
      wednesday: { start: "08:00", end: "18:00", enabled: true },
      thursday: { start: "08:00", end: "18:00", enabled: true },
      friday: { start: "08:00", end: "18:00", enabled: true },
      saturday: { start: "08:00", end: "12:00", enabled: false },
      sunday: { start: "08:00", end: "12:00", enabled: false },
    },
    holidays: [],
    createdAt: new Date("2025-08-05T10:00:00.000Z"),
  },
  {
    id: "schedule-24x7",
    name: "24x7",
    description: "Atendimento 24 horas",
    timezone: "America/Sao_Paulo",
    isActive: true,
    schedule: {
      monday: { start: "00:00", end: "23:59", enabled: true },
      tuesday: { start: "00:00", end: "23:59", enabled: true },
      wednesday: { start: "00:00", end: "23:59", enabled: true },
      thursday: { start: "00:00", end: "23:59", enabled: true },
      friday: { start: "00:00", end: "23:59", enabled: true },
      saturday: { start: "00:00", end: "23:59", enabled: true },
      sunday: { start: "00:00", end: "23:59", enabled: true },
    },
    holidays: [],
    createdAt: new Date("2025-08-05T10:00:00.000Z"),
  }
];
