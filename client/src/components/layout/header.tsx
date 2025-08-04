import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNewTicketButton?: boolean;
}

export default function Header({ title, subtitle, showNewTicketButton = true }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              data-testid="input-search"
              type="text"
              placeholder="Buscar chamados..."
              className="w-64 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          {/* Notifications */}
          <button 
            data-testid="button-notifications"
            className="relative p-2 text-gray-400 hover:text-gray-600"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* New Ticket Button */}
          {showNewTicketButton && (
            <Button data-testid="button-new-ticket" className="bg-primary hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Chamado
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
