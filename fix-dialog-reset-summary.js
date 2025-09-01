// Resumo das correções para limpeza de campos no dialog de Tipos de Solicitação

/**
 * PROBLEMA IDENTIFICADO:
 * O botão "Novo Tipo de Solicitação" não estava limpando os campos após o dialog ser fechado.
 * Isso acontecia porque o Dialog apenas controlava a visibilidade (setShowDialog), mas não 
 * resetava o formulário quando era fechado por outras formas (ESC, click fora, botão X).
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * 1. Criada função handleCloseDialog() que:
 *    - Limpa o formulário quando o dialog é fechado
 *    - Reseta o estado editingRequestType
 *    - Restaura valores padrão do formulário
 * 
 * 2. Atualizado Dialog.onOpenChange para usar handleCloseDialog
 * 3. Atualizado botão "Cancelar" para usar handleCloseDialog
 * 4. Atualizado mutations de sucesso para usar handleCloseDialog
 * 
 * COMPORTAMENTO ESPERADO AGORA:
 * ✅ Ao clicar em "Novo Tipo de Solicitação" → campos limpos
 * ✅ Após criar com sucesso → campos limpos na próxima abertura
 * ✅ Após cancelar → campos limpos na próxima abertura
 * ✅ Após fechar com ESC/click fora → campos limpos na próxima abertura
 * ✅ Ao editar existente → campos preenchidos corretamente
 */

// Função implementada no arquivo request-types.tsx:
const handleCloseDialog = (open: boolean) => {
  if (!open) {
    // Quando o dialog é fechado, limpar o formulário e estado
    setEditingRequestType(null);
    form.reset({
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
      departmentIds: [],
      sla: 480, // 8 horas = 480 minutos
    });
  }
  setShowDialog(open);
};

// Mudanças aplicadas:
// - Dialog: onOpenChange={handleCloseDialog}
// - Botão Cancelar: onClick={() => handleCloseDialog(false)}
// - Create/Update mutations: onSuccess() chama handleCloseDialog(false)

console.log('✅ Correção aplicada: Campos do formulário serão limpos após fechamento do dialog');
