// Componente de teste para verificar os dados do usuário do localStorage

import React from 'react';
import { useUser } from '@/hooks/use-user';

export function UserTestComponent() {
  const { user, isLoading, getUserInitials, getUserRole, isAdmin, isAgent } = useUser();

  if (isLoading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (!user) {
    return <div>Nenhum usuário logado</div>;
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Dados do Usuário (localStorage)</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>ID:</strong> {user.id}</div>
        <div><strong>Nome:</strong> {user.name}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Username:</strong> {user.username}</div>
        <div><strong>Role:</strong> {user.role} ({getUserRole(user.role)})</div>
        <div><strong>Criado em:</strong> {new Date(user.createdAt).toLocaleString()}</div>
        <div><strong>Iniciais:</strong> {getUserInitials(user.name)}</div>
        <div><strong>É Admin:</strong> {isAdmin() ? 'Sim' : 'Não'}</div>
        <div><strong>É Agente:</strong> {isAgent() ? 'Sim' : 'Não'}</div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Dados JSON:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Para usar este componente de teste, adicione-o em qualquer página:
// import { UserTestComponent } from '@/components/UserTestComponent';
// 
// E então renderize: <UserTestComponent />
