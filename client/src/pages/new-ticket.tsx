import { Link } from "wouter";
import { ArrowLeft, Zap, FileEdit, CheckCircle, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";

export default function NewTicket() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Criar Ticket" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/tickets">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Escolha o Tipo de Abertura</h1>
                <p className="text-sm text-muted-foreground">Selecione como deseja criar seu ticket</p>
              </div>
            </div>
          </div>

          {/* Opções de Abertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Abertura Rápida */}
            <Link to="/tickets/new/quick">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                    <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Abertura Rápida</CardTitle>
                  <CardDescription className="text-sm">
                    Para tickets simples e urgentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Campos essenciais apenas
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Criação em segundos
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Ideal para problemas urgentes
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 text-red-500 mr-2" />
                      Sem anexos ou formatação
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Criar Rápido
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Abertura Completa */}
            <Link to="/tickets/new/full">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                    <FileEdit className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Abertura Completa</CardTitle>
                  <CardDescription className="text-sm">
                    Para tickets detalhados e complexos
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Editor WYSIWYG completo
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Upload de anexos
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Tags e campos customizados
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Estimativas e prazos
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    <FileEdit className="w-4 h-4 mr-2" />
                    Criar Completo
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Dica */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 dark:text-amber-100">Dica</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                    Use a <strong>Abertura Rápida</strong> para problemas urgentes que precisam ser reportados imediatamente. 
                    Para tickets que requerem documentação detalhada, anexos ou formatação especial, escolha a <strong>Abertura Completa</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
