import { useState } from 'react';
import { GovHeader } from "@/components/layout/GovHeader";
import { SentenceCalculator } from "@/components/business/SentenceCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calculator, Info } from "lucide-react";

export function CalculatorPage() {
  const [lastSimulation, setLastSimulation] = useState<any>(null);

  const handleSave = (data: any) => {
    setLastSimulation(data);
  };

  return (
    <div className="space-y-6">
      <GovHeader 
        title="Simulador de Pena Interativo" 
        description="Ferramenta auxiliar para cálculo de remição e projeção de datas de progressão de regime."
        breadcrumbs={[
          { label: "Visão Geral", href: "/dashboard" },
          { label: "Ferramentas" },
          { label: "Calculadora" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <SentenceCalculator 
                currentProgressionDate="15/08/2028" // Data base padrão para simulação livre
                onSaveSimulation={handleSave}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                <Info className="h-5 w-5" /> Como usar
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Esta ferramenta permite simular o impacto de atividades de ressocialização na pena.
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li><strong>Trabalho:</strong> 1 dia remido a cada 3 trabalhados.</li>
                <li><strong>Estudo:</strong> 1 dia remido a cada 12 horas.</li>
                <li><strong>Leitura:</strong> 4 dias remidos por obra (com resenha).</li>
              </ul>
            </CardContent>
          </Card>

          {lastSimulation && (
            <Alert className="bg-green-50 border-green-200 animate-in fade-in zoom-in">
              <Calculator className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Simulação Realizada</AlertTitle>
              <AlertDescription className="text-green-700">
                Total Remido: <strong>{lastSimulation.remissionDays} dias</strong>
                <br />
                Nova Data: <strong>{lastSimulation.newDate.toLocaleDateString()}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
