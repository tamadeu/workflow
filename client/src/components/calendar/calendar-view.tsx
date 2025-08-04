import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "ticket" | "maintenance" | "meeting";
  priority?: "critical" | "high" | "medium" | "low";
  status?: string;
  ticketNumber?: number;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Mock events for demonstration
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Manutenção servidor web",
    date: new Date(2024, 7, 15),
    type: "maintenance",
    priority: "high",
    ticketNumber: 2841
  },
  {
    id: "2",
    title: "Problema crítico rede",
    date: new Date(2024, 7, 22),
    type: "ticket",
    priority: "critical",
    status: "open",
    ticketNumber: 2847
  },
  {
    id: "3",
    title: "Reunião de equipe",
    date: new Date(2024, 7, 28),
    type: "meeting"
  },
  {
    id: "4",
    title: "Backup de dados",
    date: new Date(2024, 7, 30),
    type: "maintenance",
    priority: "medium"
  }
];

export default function CalendarView({ 
  events = mockEvents, 
  onDateClick, 
  onEventClick,
  className 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterType, setFilterType] = useState<string>("all");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterType === "all") return true;
      return event.type === filterType;
    });
  }, [events, filterType]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return filteredEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    onDateClick?.(clickedDate);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDialog(true);
    onEventClick?.(event);
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === "maintenance") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (event.type === "meeting") {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    
    // Ticket event colors based on priority
    switch (event.priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const today = new Date();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button 
              data-testid="button-previous-month"
              variant="outline" 
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 
              data-testid="text-current-month"
              className="text-xl font-semibold min-w-[200px] text-center"
            >
              {monthName} {year}
            </h2>
            <Button 
              data-testid="button-next-month"
              variant="outline" 
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            data-testid="button-today"
            variant="outline" 
            size="sm"
            onClick={goToToday}
          >
            Hoje
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger data-testid="select-event-filter" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              <SelectItem value="ticket">Chamados</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="meeting">Reuniões</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger data-testid="select-view-mode" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Dia</SelectItem>
            </SelectContent>
          </Select>
          
          <Button data-testid="button-new-event" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isToday = day && 
              day === today.getDate() && 
              currentDate.getMonth() === today.getMonth() && 
              currentDate.getFullYear() === today.getFullYear();
            
            const currentDayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const dayEvents = getEventsForDate(currentDayDate);
            const isSelected = selectedDate && currentDayDate && 
              selectedDate.toDateString() === currentDayDate.toDateString();

            return (
              <div
                key={index}
                data-testid={day ? `calendar-day-${day}` : `calendar-empty-${index}`}
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                  !day && "bg-gray-25",
                  isToday && "bg-blue-50 border-blue-200",
                  isSelected && "bg-primary-50 border-primary-200"
                )}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-sm font-medium mb-2 w-6 h-6 flex items-center justify-center rounded-full",
                      isToday && "bg-primary text-white"
                    )}>
                      {day}
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          data-testid={`event-${day}-${event.id}`}
                          className={cn(
                            "text-xs px-2 py-1 rounded border cursor-pointer hover:opacity-80 transition-opacity truncate",
                            getEventColor(event)
                          )}
                          onClick={(e) => handleEventClick(event, e)}
                          title={event.title}
                        >
                          {event.ticketNumber && `#${event.ticketNumber} `}
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Manutenção</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Crítico</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Concluído</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
          <span>Reunião</span>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                {selectedEvent.ticketNumber && (
                  <p className="text-sm text-gray-500">Chamado #{selectedEvent.ticketNumber}</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getEventColor(selectedEvent)}>
                  {selectedEvent.type === "ticket" ? "Chamado" : 
                   selectedEvent.type === "maintenance" ? "Manutenção" : "Reunião"}
                </Badge>
                
                {selectedEvent.priority && (
                  <Badge variant="outline">
                    Prioridade: {selectedEvent.priority}
                  </Badge>
                )}
                
                {selectedEvent.status && (
                  <Badge variant="outline">
                    Status: {selectedEvent.status}
                  </Badge>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Data:</strong> {selectedEvent.date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button size="sm">Ver Detalhes</Button>
                <Button size="sm" variant="outline">Editar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
