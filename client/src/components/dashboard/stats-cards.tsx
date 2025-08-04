import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TicketIcon, CheckCircle, Clock, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Chamados Abertos",
      value: stats.openTickets.toString(),
      trend: "+12% vs mês anterior",
      trendUp: true,
      icon: TicketIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Resolvidos Hoje",
      value: stats.resolvedToday.toString(),
      trend: "+22% vs ontem",
      trendUp: true,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Tempo Médio",
      value: stats.averageTime,
      trend: "-8% vs semana anterior",
      trendUp: false,
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "SLA Cumprido",
      value: `${stats.slaCompliance}%`,
      trend: "+2.1% vs meta",
      trendUp: true,
      icon: Gauge,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;
        return (
          <Card key={index} className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p 
                    data-testid={`stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-3xl font-bold text-gray-900 mt-2"
                  >
                    {card.value}
                  </p>
                  <p 
                    className={`text-sm mt-1 flex items-center ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {card.trend}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
