import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Clock, Users, Calendar, Download } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/lib/types";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("tickets");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock data for charts and analytics
  const performanceData = [
    { period: "Jan", tickets: 245, resolved: 230, sla: 94 },
    { period: "Fev", tickets: 267, resolved: 251, sla: 92 },
    { period: "Mar", tickets: 289, resolved: 275, sla: 95 },
    { period: "Abr", tickets: 312, resolved: 298, sla: 96 },
    { period: "Mai", tickets: 298, resolved: 285, sla: 93 },
    { period: "Jun", tickets: 334, resolved: 321, sla: 97 },
  ];

  const queuePerformance = [
    { queue: "TI - Infraestrutura", tickets: 89, avgTime: "2.4h", sla: 92 },
    { queue: "TI - Suporte", tickets: 156, avgTime: "1.8h", sla: 96 },
    { queue: "RH - Recursos Humanos", tickets: 67, avgTime: "3.2h", sla: 89 },
    { queue: "Facilities", tickets: 34, avgTime: "4.1h", sla: 85 },
    { queue: "Financeiro", tickets: 23, avgTime: "2.9h", sla: 94 },
  ];

  const priorityDistribution = [
    { priority: "Crítica", count: 12, percentage: 5 },
    { priority: "Alta", count: 34, percentage: 14 },
    { priority: "Média", count: 156, percentage: 63 },
    { priority: "Baixa", count: 45, percentage: 18 },
  ];

  const timeRangeOptions = [
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 90 dias" },
    { value: "1y", label: "Último ano" },
  ];

  const getSLAColor = (sla: number) => {
    if (sla >= 95) return "text-green-600";
    if (sla >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      <Header 
        title="Análises" 
        subtitle="Insights e métricas detalhadas do sistema"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-3 lg:p-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-4 lg:mb-6">
            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger data-testid="select-time-range" className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger data-testid="select-metric" className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tickets">Volume de Chamados</SelectItem>
                  <SelectItem value="resolution">Taxa de Resolução</SelectItem>
                  <SelectItem value="sla">Cumprimento SLA</SelectItem>
                  <SelectItem value="satisfaction">Satisfação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button data-testid="button-export-analytics" variant="outline" className="w-full lg:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className="lg:inline">Exportar Relatório</span>
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview" className="text-xs lg:text-sm">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs lg:text-sm">Performance</TabsTrigger>
              <TabsTrigger value="trends" className="text-xs lg:text-sm">Tendências</TabsTrigger>
              <TabsTrigger value="teams" className="text-xs lg:text-sm">Equipes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Volume Total</p>
                        <p data-testid="metric-total-volume" className="text-2xl lg:text-3xl font-bold text-gray-900">
                          1,247
                        </p>
                        <p className="text-xs lg:text-sm text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +8.2% vs período anterior
                        </p>
                      </div>
                      <BarChart3 className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
                        <p data-testid="metric-resolution-rate" className="text-2xl lg:text-3xl font-bold text-gray-900">
                          94.2%
                        </p>
                        <p className="text-xs lg:text-sm text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +2.1% vs período anterior
                        </p>
                      </div>
                      <Users className="w-10 h-10 lg:w-12 lg:h-12 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                        <p data-testid="metric-avg-time" className="text-2xl lg:text-3xl font-bold text-gray-900">
                          2h 24m
                        </p>
                        <p className="text-xs lg:text-sm text-red-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                          -12min vs período anterior
                        </p>
                      </div>
                      <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Satisfação</p>
                        <p data-testid="metric-satisfaction" className="text-2xl lg:text-3xl font-bold text-gray-900">
                          4.7/5
                        </p>
                        <p className="text-xs lg:text-sm text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +0.3 vs período anterior
                        </p>
                      </div>
                      <Calendar className="w-10 h-10 lg:w-12 lg:h-12 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Priority Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3 lg:pb-6">
                    <CardTitle className="text-base lg:text-lg">Distribuição por Prioridade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 lg:space-y-4">
                      {priorityDistribution.map((item) => (
                        <div key={item.priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium">{item.priority}</span>
                          </div>
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div className="w-20 lg:w-32">
                              <Progress value={item.percentage} className="h-2" />
                            </div>
                            <span data-testid={`priority-${item.priority.toLowerCase()}-count`} className="text-xs lg:text-sm font-medium w-8 lg:w-12 text-right">
                              {item.count}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-500 w-8 lg:w-12 text-right">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3 lg:pb-6">
                    <CardTitle className="text-base lg:text-lg">Performance por Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 lg:space-y-4">
                      {performanceData.slice(-4).map((item, index) => (
                        <div key={item.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm lg:text-base font-medium">{item.period}</div>
                            <div className="text-xs lg:text-sm text-gray-500">{item.tickets} chamados</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs lg:text-sm font-medium">{item.resolved} resolvidos</div>
                            <div className={`text-xs lg:text-sm ${getSLAColor(item.sla)}`}>
                              SLA: {item.sla}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">Performance por Fila de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">Fila</th>
                          <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">Chamados</th>
                          <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">Tempo Médio</th>
                          <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">SLA</th>
                          <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queuePerformance.map((queue, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base">{queue.queue}</td>
                            <td data-testid={`queue-tickets-${index}`} className="py-2 lg:py-3 px-2 lg:px-4 text-sm lg:text-base">
                              {queue.tickets}
                            </td>
                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-sm lg:text-base">{queue.avgTime}</td>
                            <td className={`py-2 lg:py-3 px-2 lg:px-4 font-medium text-sm lg:text-base ${getSLAColor(queue.sla)}`}>
                              {queue.sla}%
                            </td>
                            <td className="py-2 lg:py-3 px-2 lg:px-4">
                              <Progress value={queue.sla} className="w-16 lg:w-24" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Tendências Históricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Gráfico de tendências seria exibido aqui</p>
                      <p className="text-sm">Integração com biblioteca de gráficos necessária</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Crescimento Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+12.5%</div>
                    <p className="text-sm text-gray-500">vs mês anterior</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Pico de Demanda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">14h-16h</div>
                    <p className="text-sm text-gray-500">Horário crítico</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Sazonalidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">Segunda</div>
                    <p className="text-sm text-gray-500">Dia com mais chamados</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Performance por Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Equipe TI</h3>
                        <span className="text-sm text-gray-500">5 membros</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Chamados Ativos</div>
                          <div data-testid="team-ti-active" className="font-medium">23</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Taxa Resolução</div>
                          <div className="font-medium text-green-600">96%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tempo Médio</div>
                          <div className="font-medium">2.1h</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Equipe RH</h3>
                        <span className="text-sm text-gray-500">3 membros</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Chamados Ativos</div>
                          <div data-testid="team-rh-active" className="font-medium">8</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Taxa Resolução</div>
                          <div className="font-medium text-yellow-600">89%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tempo Médio</div>
                          <div className="font-medium">3.2h</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Facilities</h3>
                        <span className="text-sm text-gray-500">2 membros</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Chamados Ativos</div>
                          <div data-testid="team-facilities-active" className="font-medium">4</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Taxa Resolução</div>
                          <div className="font-medium text-red-600">85%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tempo Médio</div>
                          <div className="font-medium">4.1h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
