// Teste rápido para verificar se o token está funcionando
// Este arquivo pode ser usado no console do navegador para testar a API

export async function testDepartmentsAPI() {
  try {
    console.log('🔍 Testando API de Departamentos...');
    
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
    const response = await fetch('https://integra.cellarvinhos.com/webhook/6beff3e0-8d27-458f-84dc-6c3a2114d8e0', {
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
    console.log('✅ Sucesso! Departamentos encontrados:', data.length);
    console.log('📋 Dados (SLA em minutos direto da API):', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Para testar no console:
// testDepartmentsAPI();
