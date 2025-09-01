import { ReactNode } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { ticketsApi } from "@/lib/tickets-api";
import { usersApi } from "@/lib/users-api";
import { AlertTriangle } from "lucide-react";

interface TicketAccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function TicketAccessGuard({ children, fallback }: TicketAccessGuardProps) {
  const { ticketId } = useParams();
  const { user, isLoading: userLoading } = useUser();

  // Buscar o ticket
  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getById(ticketId!),
    enabled: !!ticketId,
  });

  // Buscar informações do usuário responsável pelo ticket (para obter seu department_id)
  const { data: responsibleUser, isLoading: responsibleUserLoading } = useQuery({
    queryKey: ['user', ticket?.responsibleUser?.id],
    queryFn: () => usersApi.getById(ticket!.responsibleUser!.id),
    enabled: !!ticket?.responsibleUser?.id,
  });

  // Ainda carregando dados
  if (userLoading || ticketLoading || responsibleUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Erro ao carregar o ticket
  if (ticketError || !ticket) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket não encontrado</h1>
          <p className="text-gray-600">O ticket solicitado não foi encontrado ou não existe.</p>
        </div>
      </div>
    );
  }

  // Usuário não logado
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Verificar permissões
  const hasAccess = () => {
    // Admins podem ver qualquer ticket
    if (user.role === "admin") {
      return true;
    }

    // Se não há usuário responsável pelo ticket, negar acesso
    if (!ticket.responsibleUser || !responsibleUser) {
      return false;
    }

    // Obter department_id do usuário logado
    const userProfile = user as any; // Cast temporário para acessar department_id
    const userDepartmentId = userProfile.department_id;

    // Obter department_id do usuário responsável pelo ticket
    const responsibleUserDepartmentId = responsibleUser.departmentId;

    // Verificar se os department_id são iguais
    if (userDepartmentId && responsibleUserDepartmentId) {
      return userDepartmentId === responsibleUserDepartmentId;
    }

    // Se não há informação de departamento, negar acesso
    return false;
  };

  if (!hasAccess()) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar este ticket.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Apenas administradores e usuários do mesmo departamento do responsável podem visualizar este ticket.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
