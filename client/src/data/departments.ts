import type { Department } from "@shared/schema";

export const departments: Department[] = [
  {
    id: "dept-1",
    name: "Tecnologia da Informação",
    sla: 4,
    isActive: true,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-15T10:00:00.000Z"),
    updatedAt: new Date("2024-01-15T10:00:00.000Z"),
  },
  {
    id: "dept-2",
    name: "Recursos Humanos",
    sla: 24,
    isActive: true,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-16T10:00:00.000Z"),
    updatedAt: new Date("2024-01-16T10:00:00.000Z"),
  },
  {
    id: "dept-3",
    name: "Financeiro",
    sla: 8,
    isActive: true,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-17T10:00:00.000Z"),
    updatedAt: new Date("2024-01-17T10:00:00.000Z"),
  },
  {
    id: "dept-4",
    name: "Comercial",
    sla: 48,
    isActive: true,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-18T10:00:00.000Z"),
    updatedAt: new Date("2024-01-18T10:00:00.000Z"),
  },
  {
    id: "dept-5",
    name: "Jurídico",
    sla: 72,
    isActive: true,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-19T10:00:00.000Z"),
    updatedAt: new Date("2024-01-19T10:00:00.000Z"),
  },
  {
    id: "dept-6",
    name: "Manutenção",
    sla: 2,
    isActive: false,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-20T10:00:00.000Z"),
    updatedAt: new Date("2024-01-20T10:00:00.000Z"),
  },
];

export const getDepartmentById = (id: string): Department | undefined => {
  return departments.find(dept => dept.id === id);
};

export const getActiveDepartments = (): Department[] => {
  return departments.filter(dept => dept.isActive);
};

export const getDepartmentsByName = (searchTerm: string): Department[] => {
  return departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
