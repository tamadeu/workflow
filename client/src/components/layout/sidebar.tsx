import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
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
  Settings,
  Menu,
  X,
  Building2,
  Target,
  CircleDot,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { 
    name: "Chamados", 
    icon: TicketIcon,
    children: [
      { name: "Novo Chamado", href: "/tickets/new/full", icon: Plus },
      { name: "Meus Chamados", href: "/my-tickets", icon: List },
      { name: "Todos os Chamados", href: "/all-tickets", icon: TicketIcon },
      { name: "Chamados Departamento", href: "/department-tickets", icon: Building2 },
    ]
  },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Árvore de Chamados", href: "/ticket-tree", icon: GitBranch },
];

const management = [
  { name: "Configurações", href: "/settings", icon: Settings },
  { name: "Usuários", href: "/users", icon: Users },
];

const reports = [
  { name: "Análises", href: "/analytics", icon: BarChart3 },
  { name: "SLA", href: "/sla", icon: Gauge },
  { name: "Exportar", href: "/export", icon: Download },
];

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();

  const closeSidebar = () => {
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden flex flex-col",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <SidebarContent location={location} onItemClick={closeSidebar} isMobile={true} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="hidden lg:flex w-64 h-screen bg-white shadow-sm border-r border-gray-200 flex-col sticky top-0">
      <div className="flex flex-col h-full">
        <SidebarContent location={location} />
      </div>
    </div>
  );
}

interface SidebarContentProps {
  location: string;
  onItemClick?: () => void;
  isMobile?: boolean;
}

function SidebarContent({ location, onItemClick, isMobile }: SidebarContentProps) {
  const { user, isLoading, getUserInitials, getUserRole, isAdmin, isManager } = useUser();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  // Filtrar itens de Chamados baseado no papel do usuário
  const getFilteredChildrenForChamados = () => {
    const baseChildren = [
      { name: "Novo Chamado", href: "/tickets/new/full", icon: Plus },
      { name: "Meus Chamados", href: "/my-tickets", icon: List }, // Todos podem ver
    ];

    // Adicionar "Chamados Departamento" apenas para gerentes e admins
    if (isManager()) {
      baseChildren.push({ name: "Chamados Departamento", href: "/department-tickets", icon: Building2 });
    }

    // Adicionar "Todos os Chamados" apenas para admins
    if (isAdmin()) {
      baseChildren.push({ name: "Todos os Chamados", href: "/all-tickets", icon: TicketIcon });
    }

    return baseChildren;
  };

  // Criar navegação dinâmica baseada no papel do usuário
  const getFilteredNavigation = () => {
    return navigation.map(item => {
      if (item.name === "Chamados") {
        return {
          ...item,
          children: getFilteredChildrenForChamados()
        };
      }
      return item;
    });
  };

  const filteredNavigation = getFilteredNavigation();

  // Verificar se algum item filho está ativo e manter o dropdown aberto
  useEffect(() => {
    filteredNavigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => location === child.href);
        if (hasActiveChild && !openDropdowns.includes(item.name)) {
          setOpenDropdowns(prev => [...prev, item.name]);
        }
      }
    });
  }, [location, filteredNavigation]);

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isDropdownOpen = (itemName: string) => openDropdowns.includes(itemName);

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    
    // Se tem filhos, é um dropdown
    if (item.children) {
      const isOpen = isDropdownOpen(item.name);
      const hasActiveChild = item.children.some((child: any) => location === child.href);
      
      return (
        <div key={item.name}>
          <div
            data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => toggleDropdown(item.name)}
            className={cn(
              "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg font-medium cursor-pointer",
              hasActiveChild
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1">{item.name}</span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          
          {/* Submenu */}
          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child: any) => {
                const ChildIcon = child.icon;
                const isActive = location === child.href;
                return (
                  <Link key={child.name} href={child.href}>
                    <div
                      data-testid={`nav-${child.name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={onItemClick}
                      className={cn(
                        "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-sm",
                        isActive
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <ChildIcon className="w-4 h-4" />
                      <span>{child.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    // Item normal sem filhos
    const isActive = location === item.href;
    return (
      <Link key={item.name} href={item.href}>
        <div
          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onItemClick}
          className={cn(
            "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg font-medium cursor-pointer",
            isActive
              ? "active bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TicketIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Workflow</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onItemClick}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Desktop Logo */}
      {!isMobile && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TicketIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Workflow</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => renderNavItem(item))}
        </div>

        {/* Mostrar seção de Relatórios apenas para administradores */}
        {user?.role === "admin" && (
          <div className="pt-4 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Relatórios
            </div>
            {reports.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={onItemClick}
                    className={cn(
                      "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer",
                      isActive
                        ? "active bg-primary-50 text-primary-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mostrar seção de Gerenciamento apenas para administradores */}
        {user?.role === "admin" && (
          <div className="pt-4 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Gerenciamento
            </div>
            {management.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={onItemClick}
                    className={cn(
                      "nav-item flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer",
                      isActive
                        ? "active bg-primary-50 text-primary-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user ? getUserInitials(user.first_name) : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {isLoading ? "Carregando..." : user?.first_name + ' ' + user?.last_name || "Usuário"}
            </div>
            <div className="text-xs text-gray-500">
              {isLoading ? "" : getUserRole(user?.role)}
            </div>
          </div>
          <Link to="/profile">
            <button 
              data-testid="button-settings"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Configurações do Perfil"
            >
              <Settings className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
