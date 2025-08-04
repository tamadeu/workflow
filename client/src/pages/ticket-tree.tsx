import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Search } from "lucide-react";
import { useState } from "react";

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "ticket";
  children?: TreeNode[];
  expanded?: boolean;
  ticketNumber?: number;
  status?: string;
  priority?: string;
}

const mockTreeData: TreeNode[] = [
  {
    id: "1",
    name: "Infraestrutura TI",
    type: "folder",
    expanded: true,
    children: [
      {
        id: "1-1",
        name: "Servidores",
        type: "folder",
        expanded: false,
        children: [
          {
            id: "1-1-1",
            name: "Problema de conectividade VPN",
            type: "ticket",
            ticketNumber: 2847,
            status: "in_progress",
            priority: "critical"
          },
          {
            id: "1-1-2",
            name: "Manutenção servidor web",
            type: "ticket",
            ticketNumber: 2841,
            status: "scheduled",
            priority: "medium"
          }
        ]
      },
      {
        id: "1-2",
        name: "Rede",
        type: "folder",
        expanded: true,
        children: [
          {
            id: "1-2-1",
            name: "Instabilidade na rede wireless",
            type: "ticket",
            ticketNumber: 2843,
            status: "open",
            priority: "high"
          }
        ]
      },
      {
        id: "1-3",
        name: "Reset de senha - Sistema ERP",
        type: "ticket",
        ticketNumber: 2845,
        status: "resolved",
        priority: "low"
      }
    ]
  },
  {
    id: "2",
    name: "Recursos Humanos",
    type: "folder",
    expanded: false,
    children: [
      {
        id: "2-1",
        name: "Solicitação de novo equipamento",
        type: "ticket",
        ticketNumber: 2846,
        status: "pending_approval",
        priority: "medium"
      },
      {
        id: "2-2",
        name: "Alteração de dados cadastrais",
        type: "ticket",
        ticketNumber: 2842,
        status: "resolved",
        priority: "low"
      }
    ]
  },
  {
    id: "3",
    name: "Facilities",
    type: "folder",
    expanded: false,
    children: [
      {
        id: "3-1",
        name: "Ar condicionado sala de reunião",
        type: "ticket",
        ticketNumber: 2840,
        status: "in_progress",
        priority: "medium"
      }
    ]
  }
];

export default function TicketTree() {
  const [treeData, setTreeData] = useState(mockTreeData);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleNode = (nodeId: string) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setTreeData(updateNode(treeData));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "open":
        return "text-blue-600";
      case "in_progress":
        return "text-yellow-600";
      case "resolved":
        return "text-green-600";
      case "pending_approval":
        return "text-purple-600";
      case "scheduled":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;

    return (
      <div key={node.id}>
        <div 
          className={`flex items-center space-x-2 text-sm py-2 px-2 hover:bg-gray-50 rounded cursor-pointer`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
          data-testid={`tree-node-${node.id}`}
        >
          {hasChildren && (
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4"></div>}
          
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            )
          ) : (
            <FileText className={`w-4 h-4 ${getStatusColor(node.status)}`} />
          )}
          
          <span className="flex-1 font-medium">
            {node.type === "ticket" && node.ticketNumber && (
              <span className="text-gray-500 mr-2">#{node.ticketNumber}</span>
            )}
            {node.name}
          </span>
          
          {node.type === "folder" && node.children && (
            <span className="text-gray-500 text-xs">
              ({node.children.length} {node.children.length === 1 ? 'item' : 'itens'})
            </span>
          )}
          
          {node.type === "ticket" && node.priority && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(node.priority)}`}>
              {node.priority}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const countTickets = (nodes: TreeNode[]): number => {
    return nodes.reduce((total, node) => {
      if (node.type === "ticket") {
        return total + 1;
      }
      if (node.children) {
        return total + countTickets(node.children);
      }
      return total;
    }, 0);
  };

  const totalTickets = countTickets(treeData);

  return (
    <>
      <Header 
        title="Árvore de Chamados" 
        subtitle="Visualização hierárquica organizada dos chamados"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tree View */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Estrutura Hierárquica
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          data-testid="input-search-tree"
                          placeholder="Buscar na árvore..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button data-testid="button-expand-all" variant="outline" size="sm">
                        Expandir Tudo
                      </Button>
                      <Button data-testid="button-collapse-all" variant="outline" size="sm">
                        Recolher Tudo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-1 max-h-[600px] overflow-y-auto">
                    {treeData.map(node => renderTreeNode(node))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Statistics and Actions */}
            <div className="space-y-6">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Chamados:</span>
                      <span data-testid="stat-total-tickets" className="font-semibold">
                        {totalTickets}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departamentos:</span>
                      <span data-testid="stat-departments" className="font-semibold">
                        {treeData.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abertos:</span>
                      <span data-testid="stat-open-tickets" className="font-semibold text-blue-600">
                        2
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Em Andamento:</span>
                      <span data-testid="stat-in-progress-tickets" className="font-semibold text-yellow-600">
                        2
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolvidos:</span>
                      <span data-testid="stat-resolved-tickets" className="font-semibold text-green-600">
                        2
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button data-testid="button-new-folder" className="w-full" variant="outline">
                      <Folder className="w-4 h-4 mr-2" />
                      Nova Pasta
                    </Button>
                    <Button data-testid="button-move-tickets" className="w-full" variant="outline">
                      Mover Chamados
                    </Button>
                    <Button data-testid="button-export-structure" className="w-full" variant="outline">
                      Exportar Estrutura
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Legenda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-yellow-500" />
                      <span>Pasta/Departamento</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Chamado Aberto</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-yellow-600" />
                      <span>Chamado em Andamento</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Chamado Resolvido</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
