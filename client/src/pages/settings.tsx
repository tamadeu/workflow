import { useState } from "react";
import Header from "@/components/layout/header";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Target, 
  Tag, 
  Clock, 
  FileText,
  Globe,
  Mail,
  Shield,
  Database,
  CircleDot,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsItem {
  name: string;
  icon: any;
  href?: string;
}

interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  items: SettingsItem[];
}

const settingsCategories: SettingsCategory[] = [
  {
    id: "general",
    name: "Configurações Gerais",
    description: "Configurações básicas do sistema",
    icon: Globe,
    items: [
      { name: "Informações da Empresa", icon: Building2 },
      { name: "Configurações de Email", icon: Mail },
      { name: "Segurança", icon: Shield },
      { name: "Backup e Restauração", icon: Database },
    ]
  },
  {
    id: "workflow",
    name: "Fluxo de Trabalho",
    description: "Configurações relacionadas aos chamados",
    icon: SettingsIcon,
    items: [
      { name: "Tipos de Solicitações", href: "/request-types", icon: FileText },
      { name: "Departamentos", href: "/departments", icon: Building2 },
      { name: "Níveis de Resposta (SLA)", href: "/sla-levels", icon: Target },
      { name: "Rótulos", href: "/labels", icon: Tag },
      { name: "Status dos Chamados", href: "/ticket-statuses", icon: CircleDot },
      { name: "Prioridades dos Chamados", href: "/ticket-priorities", icon: AlertTriangle },
      { name: "Jornadas de Trabalho", href: "/work-schedules", icon: Clock },
    ]
  }
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState("general");

  const handleItemClick = (href?: string) => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <>
      <Header 
        title="Configurações" 
        subtitle="Gerencie as configurações do sistema"
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de Categorias */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Categorias</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {settingsCategories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-primary text-white shadow-md"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <div>
                              <div className="font-medium text-sm">{category.name}</div>
                              <div className={cn(
                                "text-xs mt-1",
                                isActive ? "text-primary-100" : "text-gray-500"
                              )}>
                                {category.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Conteúdo Principal */}
            <div className="lg:col-span-3">
              {settingsCategories.map((category) => {
                if (activeCategory !== category.id) return null;

                return (
                  <div key={category.id} className="space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <category.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{category.name}</CardTitle>
                            <CardDescription className="text-base">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <div
                                key={item.name}
                                className={cn(
                                  "group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                                  item.href 
                                    ? "border-gray-200 hover:border-primary hover:shadow-lg bg-white" 
                                    : "border-gray-100 hover:border-gray-200 bg-gray-50"
                                )}
                                onClick={() => handleItemClick(item.href)}
                              >
                                <div className="flex items-start space-x-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                                    item.href 
                                      ? "bg-primary-100 group-hover:bg-primary group-hover:text-white text-primary-600" 
                                      : "bg-gray-200 text-gray-500"
                                  )}>
                                    <ItemIcon className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                    {item.href ? (
                                      <p className="text-sm text-gray-600">
                                        Clique para configurar {item.name.toLowerCase()}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-gray-500">
                                        Em desenvolvimento
                                      </p>
                                    )}
                                  </div>
                                  {item.href && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Seção específica para Configurações Gerais */}
                    {category.id === "general" && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Database className="w-5 h-5 text-primary" />
                            <span>Informações do Sistema</span>
                          </CardTitle>
                          <CardDescription>
                            Informações técnicas e estatísticas do sistema
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-700">Versão</span>
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                              <p className="text-xl font-bold text-blue-900">2.0.0</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-700">Status</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                              <p className="text-xl font-bold text-green-900">Online</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-purple-700">Ambiente</span>
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              </div>
                              <p className="text-xl font-bold text-purple-900">Produção</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-orange-700">Banco</span>
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              </div>
                              <p className="text-xl font-bold text-orange-900">PostgreSQL</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Última Atualização</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>08 de Agosto de 2025 - 14:30</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
