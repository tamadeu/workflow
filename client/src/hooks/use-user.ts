import { useState, useEffect } from "react";
import type { User } from "@/lib/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Escutar mudanças no localStorage (para casos onde o usuário atualiza em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
          } catch (error) {
            console.error("Erro ao parsear dados do usuário:", error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return "U";
    
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const getUserRole = (role?: string): string => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      agent: "Agente",
      user: "Usuário",
    };
    
    return roleMap[role || "user"] || "Usuário";
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  const isAgent = (): boolean => {
    return user?.role === "agent" || user?.role === "admin";
  };

  const isManager = (): boolean => {
    return user?.role === "manager" || user?.role === "admin";
  };

  return {
    user,
    isLoading,
    updateUser,
    clearUser,
    getUserInitials,
    getUserRole,
    isAdmin,
    isAgent,
    isManager,
  };
}
