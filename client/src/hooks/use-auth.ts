import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();

  // Função para obter o token do cookie
  const getAuthToken = (): string | null => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('workflow_auth_token=')
    );
    return authCookie ? authCookie.split('=')[1] : null;
  };

  // Função para remover o token (logout)
  const logout = () => {
    document.cookie = 'workflow_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user'); // Limpar dados do usuário também
    setIsAuthenticated(false);
    setLocation('/login');
  };

  // Verificar autenticação no carregamento
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    
    // Usuário está autenticado se tem token E dados do usuário
    const isAuth = !!(token && user);
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    logout,
    getAuthToken,
  };
}
