// Teste rápido para verificar se o token está funcionando para Request Types
// Este arquivo pode ser usado no console do navegador para testar a API

export async function testRequestTypesAPI() {
  try {
    console.log('🔍 Testando API de Tipos de Solicitação...');
    
    // Verificar se o token existe
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('workflow_auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      console.error('❌ Token não encontrado nos cookies!');
      return;
    }
    
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    
    // Testar readAll
    const response = await fetch('https://integra.cellarvinhos.com/webhook/906a0d81-b9af-4dde-a9ac-e806cd7400be', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        operation: "readAll"
      }),
    });
    
    if (!response.ok) {
      console.error('❌ Erro na API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes do erro:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Sucesso! Tipos de solicitação encontrados:', data.length);
    console.log('📋 Dados (SLA em minutos direto da API):', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Para testar no console:
// testRequestTypesAPI();
