import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Se não está carregando e o usuário não é admin, redireciona para dashboard após 3 segundos
    if (!isLoading && user && user.role !== "admin") {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, setLocation]);

  // Mostra loading enquanto verifica o usuário
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário ou não é admin, mostra mensagem de acesso negado
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Esta página é restrita a administradores do sistema.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                Você será redirecionado para o dashboard em alguns segundos...
              </p>
            </div>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
              variant="default"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é admin, renderiza o conteúdo
  return <>{children}</>;
}
