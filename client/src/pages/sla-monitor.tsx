import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gauge, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ticket } from "@shared/schema";

interface SLAMetrics {
  overall: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  trends: {
    period: string;
    compliance: number;
  }[];
  violations: number;
  atRisk: number;
}

export default function SLAMonitor() {
  const [timeRange, setTimeRange] = useState("30d");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  // Mock SLA data
  const slaMetrics: SLAMetrics = {
    overall: 94.2,
    byPriority: {
      critical: 98.1,
      high: 95.8,
      medium: 92.4,
      low: 89.7,
    },
    trends: [
      { period: "Jan", compliance: 92.1 },
      { period: "Fev", compliance: 93.5 },
      { period: "Mar", compliance: 94.8 },
      { period: "Abr", compliance: 96.2 },
      { period: "Mai", compliance: 93.7 },
      { period: "Jun", compliance: 94.2 },
    ],
    violations: 8,
    atRisk: 15,
  };

  const slaTargets = {
    critical: { target: 95, current: 98.1 },
    high: { target: 92, current: 95.8 },
    medium: { target: 88, current: 92.4 },
    low: { target: 85, current: 89.7 },
  };

  const criticalTickets = [
    {
      id: "#2847",
      title: "Problema de conectividade VPN",
      timeRemaining: "2h 30m",
      progress: 85,
      risk: "high"
    },
    {
      id: "#2843",
      title: "Instabilidade na rede wireless",
      timeRemaining: "4h 15m",
      progress: 45,
      risk: "medium"
    },
    {
      id: "#2841",
      title: "Manutenção servidor web",
      timeRemaining: "12h 45m",
      progress: 15,
      risk: "low"
    },
  ];

  const getSLAStatus = (compliance: number, target: number) => {
    if (compliance >= target + 5) return { status: "excellent", color: "text-green-600" };
    if (compliance >= target) return { status: "good", color: "text-green-600" };
    if (compliance >= target - 5) return { status: "warning", color: "text-yellow-600" };
    return { status: "critical", color: "text-red-600" };
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-red-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <Header 
        title="Monitor SLA" 
        subtitle="Acompanhe o cumprimento dos acordos de nível de serviço"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 pb-20 lg:pb-6">
          {/* Controls */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 mb-6">
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger data-testid="select-time-range" className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="select-priority" className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button data-testid="button-sla-alerts" variant="outline" className="w-full lg:w-auto">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Configurar Alertas</span>
                <span className="lg:hidden">Alertas</span>
              </Button>
              <Button data-testid="button-export-sla" variant="outline" className="w-full lg:w-auto">
                <span className="hidden lg:inline">Exportar Relatório</span>
                <span className="lg:hidden">Exportar</span>
              </Button>
            </div>
          </div>

          {/* SLA Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">SLA Geral</p>
                    <p data-testid="sla-overall" className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {slaMetrics.overall}%
                    </p>
                    <p className="text-xs lg:text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2.1% vs mês anterior
                    </p>
                  </div>
                  <Gauge className="w-10 h-10 lg:w-12 lg:h-12 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dentro do Prazo</p>
                    <p data-testid="sla-on-time" className="text-2xl lg:text-3xl font-bold text-gray-900">
                      89%
                    </p>
                    <p className="text-xs lg:text-sm text-green-600">dos chamados</p>
                  </div>
                  <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Violações SLA</p>
                    <p data-testid="sla-violations" className="text-2xl lg:text-3xl font-bold text-red-600">
                      {slaMetrics.violations}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">este mês</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 lg:w-12 lg:h-12 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Risco</p>
                    <p data-testid="sla-at-risk" className="text-2xl lg:text-3xl font-bold text-yellow-600">
                      {slaMetrics.atRisk}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">chamados ativos</p>
                  </div>
                  <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="priorities">Por Prioridade</TabsTrigger>
              <TabsTrigger value="critical">Chamados Críticos</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Cumprimento por Prioridade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(slaMetrics.byPriority).map(([priority, compliance]) => {
                        const priorityLabel = {
                          critical: "Crítica",
                          high: "Alta", 
                          medium: "Média",
                          low: "Baixa"
                        }[priority];
                        
                        return (
                          <div key={priority} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">{priorityLabel}</Badge>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Progress value={compliance} className="w-32" />
                              <span 
                                data-testid={`sla-${priority}`}
                                className="text-sm font-medium w-12 text-right"
                              >
                                {compliance}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Meta vs Realizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(slaTargets).map(([priority, data]) => {
                        const priorityLabel = {
                          critical: "Crítica",
                          high: "Alta",
                          medium: "Média", 
                          low: "Baixa"
                        }[priority];
                        
                        const status = getSLAStatus(data.current, data.target);
                        
                        return (
                          <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">{priorityLabel}</div>
                              <div className="text-sm text-gray-500">Meta: {data.target}%</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-medium ${status.color}`}>
                                {data.current}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {data.current >= data.target ? "✓ Dentro da meta" : "⚠ Abaixo da meta"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="priorities" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(slaTargets).map(([priority, data]) => {
                  const priorityLabel = {
                    critical: "Crítica",
                    high: "Alta",
                    medium: "Média",
                    low: "Baixa"
                  }[priority];
                  
                  const status = getSLAStatus(data.current, data.target);
                  
                  return (
                    <Card key={priority} className="shadow-sm border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{priorityLabel}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${status.color}`}>
                            {data.current}%
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            Meta: {data.target}%
                          </div>
                          <Progress value={data.current} className="mb-3" />
                          <Badge 
                            variant={status.status === "excellent" || status.status === "good" ? "default" : "destructive"}
                          >
                            {data.current >= data.target ? "No prazo" : "Fora do prazo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="critical" className="space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Chamados Críticos com SLA em Risco</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {criticalTickets.map((ticket, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span data-testid={`critical-ticket-id-${index}`} className="font-mono font-medium">
                              {ticket.id}
                            </span>
                            <Badge variant={ticket.risk === "high" ? "destructive" : "default"}>
                              {ticket.risk === "high" ? "Alto Risco" : 
                               ticket.risk === "medium" ? "Médio Risco" : "Baixo Risco"}
                            </Badge>
                          </div>
                          <div className="text-gray-600 mt-1">{ticket.title}</div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm font-medium">Tempo restante</div>
                            <div className={`text-sm ${getRiskColor(ticket.risk)}`}>
                              {ticket.timeRemaining}
                            </div>
                          </div>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>SLA</span>
                              <span>{ticket.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(ticket.progress)}`}
                                style={{ width: `${ticket.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Tendência de Cumprimento SLA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Gauge className="w-12 h-12 mx-auto mb-2" />
                      <p>Gráfico de tendências SLA seria exibido aqui</p>
                      <p className="text-sm">Integração com biblioteca de gráficos necessária</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Melhor Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Abril</div>
                    <p className="text-sm text-gray-500">96.2% de cumprimento</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Tendência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">Estável</div>
                    <p className="text-sm text-gray-500">Últimos 6 meses</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Projeção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <p className="text-sm text-gray-500">Próximo mês</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
