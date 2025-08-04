import { Link } from "wouter";
import { Eye, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Ticket } from "@shared/schema";

interface MobileTicketCardProps {
  ticket: Ticket;
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
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{ticket.title}</h3>
            <p className="text-xs text-gray-500">#{ticket.number}</p>
          </div>
          <Link href={`/ticket/${ticket.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={getPriorityVariant(ticket.priority)} className="text-xs">
            {getPriorityLabel(ticket.priority)}
          </Badge>
          <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate">{ticket.requesterName || "N/A"}</span>
          </div>
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
      </CardContent>
    </Card>
  );
}