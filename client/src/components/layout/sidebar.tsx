import { Link, useLocation } from "wouter";
import { 
  Home, 
  Plus, 
  List, 
  Calendar, 
  GitBranch, 
  Users, 
  Tag, 
  Clock, 
  Package, 
  BarChart3, 
  Gauge, 
  Download,
  TicketIcon,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Novo Chamado", href: "/new-ticket", icon: Plus },
  { name: "Meus Chamados", href: "/my-tickets", icon: List },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Árvore de Chamados", href: "/ticket-tree", icon: GitBranch },
];

const management = [
  { name: "Filas de Atendimento", href: "/queues", icon: Users },
  { name: "Rótulos", href: "/labels", icon: Tag },
  { name: "Jornadas", href: "/work-schedules", icon: Clock },
  { name: "Inventário", href: "/inventory", icon: Package },
];

const reports = [
  { name: "Análises", href: "/analytics", icon: BarChart3 },
  { name: "SLA", href: "/sla", icon: Gauge },
  { name: "Exportar", href: "/export", icon: Download },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TicketIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">Chamados Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg font-medium",
                    isActive
                      ? "active bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Gerenciamento
          </div>
          {management.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg",
                    isActive
                      ? "active bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Relatórios
          </div>
          {reports.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg",
                    isActive
                      ? "active bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">João Silva</div>
            <div className="text-xs text-gray-500">Administrador</div>
          </div>
          <button 
            data-testid="button-settings"
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
