import { useState } from "react";
import { Bell, Check, X, Clock, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  ticketId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "SLA em risco",
    message: "Chamado #1234 está próximo do vencimento do SLA",
    timestamp: "2 min atrás",
    isRead: false,
    ticketId: "1234"
  },
  {
    id: "2",
    type: "success",
    title: "Chamado resolvido",
    message: "Chamado #1233 foi marcado como resolvido",
    timestamp: "15 min atrás",
    isRead: false,
    ticketId: "1233"
  },
  {
    id: "3",
    type: "info",
    title: "Novo comentário",
    message: "João Silva adicionou um comentário no chamado #1232",
    timestamp: "1 hora atrás",
    isRead: true,
    ticketId: "1232"
  },
  {
    id: "4",
    type: "error",
    title: "SLA vencido",
    message: "Chamado #1231 ultrapassou o prazo de SLA",
    timestamp: "2 horas atrás",
    isRead: true,
    ticketId: "1231"
  }
];

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error": return <X className="w-4 h-4 text-red-600" />;
      case "success": return <Check className="w-4 h-4 text-green-600" />;
      case "info": return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning": return "bg-yellow-50 border-yellow-200";
      case "error": return "bg-red-50 border-red-200";
      case "success": return "bg-green-50 border-green-200";
      case "info": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          data-testid="button-notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 sm:w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-gray-50",
                        getBackgroundColor(notification.type)
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {notification.timestamp}
                            </span>
                            
                            <div className="flex space-x-1">
                              {notification.ticketId && (
                                <Badge variant="outline" className="text-xs">
                                  #{notification.ticketId}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-center text-primary hover:text-primary-700"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todas as notificações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}