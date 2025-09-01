import { Link } from "wouter";
import { Eye, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SLAIndicator from "./sla-indicator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LocalTicket } from "@/lib/tickets-api";

interface MobileTicketCardProps {
  ticket: LocalTicket;
  getPriorityLabel: (priority: string) => string;
  getPriorityVariant: (priority: string) => "default" | "destructive" | "secondary";
  getStatusLabel: (status: string) => string;
  getStatusVariant: (status: string) => "default" | "destructive" | "secondary" | "outline";
}

export default function MobileTicketCard({ 
  ticket, 
  getPriorityLabel, 
  getPriorityVariant,
  getStatusLabel,
  getStatusVariant
}: MobileTicketCardProps) {
  const formatTicketCode = (code: string) => {
    return `TKT-${code}`;
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{ticket.title}</h3>
            <p className="text-xs text-gray-500">{formatTicketCode(ticket.code)}</p>
          </div>
          <Link href={`/ticket/${ticket.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant={getPriorityVariant(ticket.priority.name)} 
            className="text-xs"
            style={{ 
              backgroundColor: ticket.priority.color + '20',
              color: ticket.priority.color,
              borderColor: ticket.priority.color + '40'
            }}
          >
            {getPriorityLabel(ticket.priority.name)}
          </Badge>
          <Badge 
            variant={getStatusVariant(ticket.status.name)} 
            className="text-xs"
            style={{ 
              backgroundColor: ticket.status.color + '20',
              color: ticket.status.color,
              borderColor: ticket.status.color + '40'
            }}
          >
            {getStatusLabel(ticket.status.name)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate">
              {ticket.responsibleUser ? ticket.responsibleUser.name : "Não atribuído"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <SLAIndicator ticket={ticket} variant="compact" />
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {formatDistanceToNow(new Date(ticket.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}