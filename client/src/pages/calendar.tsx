import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
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

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <Header 
        title="Calendário de Chamados" 
        subtitle="Visualize chamados agendados e demandas por data"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Calendário de Chamados
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger data-testid="select-status-filter" className="w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="scheduled">Agendados</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    data-testid="button-today"
                    variant="outline" 
                    size="sm"
                    onClick={goToToday}
                  >
                    Hoje
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Button 
                    data-testid="button-previous-month"
                    variant="outline" 
                    size="sm"
                    onClick={goToPreviousMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold capitalize" data-testid="text-current-month">
                    {monthName}
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
                <Select value={view} onValueChange={setView}>
                  <SelectTrigger data-testid="select-calendar-view" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="day">Dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div 
                    key={day} 
                    className="text-center text-sm font-medium text-gray-500 py-2 border-b border-gray-200"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    data-testid={day ? `calendar-day-${day}` : `calendar-empty-${index}`}
                    className={`
                      min-h-[100px] p-2 border border-gray-100 
                      ${day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                      ${day === new Date().getDate() && 
                        currentDate.getMonth() === new Date().getMonth() && 
                        currentDate.getFullYear() === new Date().getFullYear() 
                        ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {day}
                        </div>
                        {/* Sample events for certain days */}
                        {(day === 15 || day === 22 || day === 28) && (
                          <div className="space-y-1">
                            <div 
                              data-testid={`event-${day}-1`}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                            >
                              Manutenção servidor
                            </div>
                            {day === 22 && (
                              <div 
                                data-testid={`event-${day}-2`}
                                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded truncate"
                              >
                                Problema crítico
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>Agendado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span>Em Andamento</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 rounded"></div>
                  <span>Atrasado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Concluído</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
