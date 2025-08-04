import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailIntegration() {
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Abertura por E-mail
          </CardTitle>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700">Endereço de E-mail:</p>
            <p 
              data-testid="text-email-address"
              className="text-sm text-gray-600 font-mono"
            >
              chamados@empresa.com
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Últimos e-mails processados:</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span data-testid="text-email-1">Problema no servidor</span>
                <span className="text-green-600">Processado</span>
              </div>
              <div className="flex justify-between">
                <span data-testid="text-email-2">Solicitação de acesso</span>
                <span className="text-green-600">Processado</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
