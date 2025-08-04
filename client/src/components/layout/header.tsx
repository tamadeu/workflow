import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNewTicketButton?: boolean;
}

export default function Header({ title, subtitle, showNewTicketButton = true }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      {isMobile ? (
        /* Mobile Header - Simplified */
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-3">
            {/* Notifications */}
            <NotificationsDropdown />
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                data-testid="input-search"
                type="text"
                placeholder="Buscar chamados..."
                className="w-48 lg:w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            {/* Notifications */}
            <NotificationsDropdown />
            
            {/* New Ticket Button */}
            {showNewTicketButton && (
              <Button 
                data-testid="button-new-ticket" 
                className="bg-primary hover:bg-primary-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Chamado
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
