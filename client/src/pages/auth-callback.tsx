import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Função para extrair parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      // Armazenar token em cookie
      document.cookie = `workflow_auth_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema de chamados.",
      });
      
      // Fechar popup se for um popup
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS', token }, window.location.origin);
        window.close();
      } else {
        setLocation("/dashboard");
      }
    } else if (error) {
      toast({
        title: "Erro no login SSO",
        description: error,
        variant: "destructive",
      });
      
      // Fechar popup se for um popup
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_ERROR', error }, window.location.origin);
        window.close();
      } else {
        setLocation("/login");
      }
    } else {
      // Sem token nem erro, redirecionar para login
      setLocation("/login");
    }
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
}
