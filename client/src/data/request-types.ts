import type { RequestType } from "@shared/schema";

export const requestTypes: RequestType[] = [
  {
    id: "req-type-7",
    name: "Solicitação de Compras",
    description: "Pedidos de aquisição de materiais e equipamentos",
    color: "#06B6D4",
    isActive: true,
    departmentId: "dept-3", // Financeiro
    sla: 16,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-21T10:00:00.000Z"),
    updatedAt: new Date("2024-01-21T10:00:00.000Z"),
  },
  {
    id: "req-type-4",
    name: "Solicitação Comercial",
    description: "Pedidos relacionados a vendas, contratos e propostas comerciais",
    color: "#8B5CF6",
    isActive: true,
    departmentId: "dept-4", // Comercial
    sla: 48,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-18T10:00:00.000Z"),
    updatedAt: new Date("2024-01-18T10:00:00.000Z"),
  },
  {
    id: "req-type-3",
    name: "Solicitação Financeira",
    description: "Pedidos de reembolso, pagamentos e questões financeiras",
    color: "#F59E0B",
    isActive: true,
    departmentId: "dept-3", // Financeiro
    sla: 8,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-17T10:00:00.000Z"),
    updatedAt: new Date("2024-01-17T10:00:00.000Z"),
  },
  {
    id: "req-type-2",
    name: "Solicitação de Recursos Humanos",
    description: "Pedidos relacionados a contratação, benefícios e políticas de RH",
    color: "#10B981",
    isActive: true,
    departmentId: "dept-2", // RH
    sla: 24,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-16T10:00:00.000Z"),
    updatedAt: new Date("2024-01-16T10:00:00.000Z"),
  },
  {
    id: "req-type-1",
    name: "Suporte Técnico",
    description: "Problemas relacionados a hardware, software e infraestrutura de TI",
    color: "#3B82F6",
    isActive: true,
    departmentId: "dept-1", // TI
    sla: 4,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-15T10:00:00.000Z"),
    updatedAt: new Date("2024-01-15T10:00:00.000Z"),
  },
  {
    id: "req-type-6",
    name: "Manutenção Predial",
    description: "Solicitações de reparo e manutenção de instalações",
    color: "#6B7280",
    isActive: false,
    departmentId: "dept-6", // Manutenção
    sla: 2,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-20T10:00:00.000Z"),
    updatedAt: new Date("2024-01-20T10:00:00.000Z"),
  },
  {
    id: "req-type-8",
    name: "Desenvolvimento de Software",
    description: "Solicitações de novos recursos e correções de sistema",
    color: "#7C3AED",
    isActive: true,
    departmentId: "dept-1", // TI
    sla: 72,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-22T10:00:00.000Z"),
    updatedAt: new Date("2024-01-22T10:00:00.000Z"),
  },
  {
    id: "req-type-5",
    name: "Consultoria Jurídica",
    description: "Questões legais, contratos e assessoria jurídica",
    color: "#EF4444",
    isActive: true,
    departmentId: "dept-5", // Jurídico
    sla: 72,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2024-01-19T10:00:00.000Z"),
    updatedAt: new Date("2024-01-19T10:00:00.000Z"),
  },
];

export const getRequestTypeById = (id: string): RequestType | undefined => {
  return requestTypes.find(type => type.id === id);
};

export const getActiveRequestTypes = (): RequestType[] => {
  return requestTypes.filter(type => type.isActive);
};

export const getRequestTypesByDepartment = (departmentId: string): RequestType[] => {
  return requestTypes.filter(type => type.departmentId === departmentId);
};

export const getRequestTypesByName = (searchTerm: string): RequestType[] => {
  return requestTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};
