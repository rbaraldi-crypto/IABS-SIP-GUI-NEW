import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  BrainCircuit, CheckCircle2, AlertTriangle, Activity, TrendingUp, 
  Upload, ShieldCheck, Cloud, HardDrive, FileText, Loader2, Lock
} from "lucide-react";

// Texto Mockado simulando um Laudo Real com tags de sentimento pré-processadas
const MOCK_REPORT_TEXT = `
<h3 class="font-bold text-lg mb-2">LAUDO DE EXAME CRIMINOLÓGICO</h3>
<p class="mb-1 text-sm text-muted-foreground">Ref: Processo de Execução Penal nº 0008921-33.2024.8.26.0050</p>
<hr class="my-4"/>

<h4 class="font-bold mt-4 mb-2">1. HISTÓRICO E ENTREVISTA</h4>
<p class="mb-3">
O apenado apresenta histórico de delitos patrimoniais. Durante a entrevista, demonstrou <span class="positive" title="Indicador de Ressocialização">arrependimento sincero</span> pelos atos praticados no passado, verbalizando compreensão sobre a gravidade de suas ações. Relata que o período de encarceramento serviu para reflexão e mudança de valores. Nega envolvimento atual com facções criminosas.
</p>

<h4 class="font-bold mt-4 mb-2">2. COMPORTAMENTO CARCERÁRIO</h4>
<p class="mb-3">
Conforme boletim informativo, mantém <span class="positive" title="Fator Protetivo">ótima conduta carcerária</span>, exercendo atividade laborterápica na faxina do pavilhão com assiduidade. Mantém <span class="positive" title="Socialização Adequada">bom relacionamento interpessoal</span> com os demais detentos e funcionários, acatando as normas institucionais sem resistência. Não possui faltas disciplinares recentes anotadas em seu prontuário.
</p>

<h4 class="font-bold mt-4 mb-2">3. ASPECTOS PSICOLÓGICOS</h4>
<p class="mb-3">
O examinando denota <span class="positive" title="Cognição">crítica preservada</span> sobre seus delitos e consequências. No entanto, observa-se traços de <span class="negative" title="Fator de Risco">impulsividade latente</span> em situações de alto estresse, embora demonstre mecanismos de controle desenvolvidos durante o cumprimento da pena. Não apresenta sinais de psicopatia ou periculosidade acentuada.
Apresenta planos concretos para o futuro, contando com <span class="positive" title="Rede de Apoio">apoio familiar estruturado</span> (mãe e esposa), o que constitui importante fator protetivo contra a reincidência.
</p>

<h4 class="font-bold mt-4 mb-2">4. CONCLUSÃO</h4>
<p class="mb-3">
Diante do exposto, sugerimos que o apenado reúne condições subjetivas favoráveis para a progressão de regime, apresentando, no momento, <span class="positive" title="Prognóstico">baixo risco de reincidência</span> criminal, desde que mantido o acompanhamento psicossocial e o suporte familiar.
</p>
`;

export function PsychologicalAnalysis() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceSelect = (source: 's3' | 'local') => {
    if (source === 'local') {
      fileInputRef.current?.click();
    } else {
      // Simula carga do S3
      processUpload("laudo_s3_bucket_v2.pdf");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file.name);
    }
  };

  const processUpload = (fileName: string) => {
    setIsUploadDialogOpen(false);
    setIsProcessing(true);
    setReportLoaded(false);

    // Simula tempo de processamento da IA (OCR + NLP)
    setTimeout(() => {
      setIsProcessing(false);
      setReportLoaded(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header de Ação de Upload */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg border shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
             <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2 shadow-sm">
                <Upload className="h-4 w-4" />
                Carregar Laudo Psicológico
             </Button>
             
             <div className="hidden md:flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                    <strong>Requisito de Segurança:</strong> O arquivo deve conter assinatura digital (ICP-Brasil) do(a) psicólogo(a) responsável.
                </span>
             </div>
        </div>
        
        {/* Mobile Warning */}
        <div className="md:hidden flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200 w-full">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Assinatura digital obrigatória.</span>
        </div>
      </div>

      {isProcessing ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-300 gap-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
                <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
                <BrainCircuit className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-primary">Analisando Documento</h3>
                <p className="text-sm text-muted-foreground">Validando assinatura digital e processando linguagem natural...</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
          {/* Sidebar de Diagnóstico */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <Card className="border-l-4 border-l-blue-500 shadow-sm bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  Diagnóstico IA
                </CardTitle>
                <CardDescription>Análise de Sentimento e Risco</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Score Geral */}
                <div className="flex items-center justify-between p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                    <div>
                      <p className="font-bold text-green-800 text-sm">Prognóstico Favorável</p>
                      <p className="text-xs text-green-700">Confiança: 92%</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white text-lg font-bold px-3">8.5</Badge>
                </div>

                {/* Barras de Métricas */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Prontidão Ressocialização
                      </span>
                      <span className="text-green-600">Alta (85%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[85%] rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Periculosidade / Risco
                      </span>
                      <span className="text-red-600">Baixa (15%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[15%] rounded-full" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Sinceridade Percebida
                      </span>
                      <span className="text-blue-600">Média-Alta (78%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[78%] rounded-full" />
                    </div>
                  </div>
                </div>
                
                {/* Tags Identificadas */}
                <div className="pt-4 border-t">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Fatores Chave Identificados</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Arrependimento
                    </Badge>
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Apoio Familiar
                    </Badge>
                    <Badge variant="outline" className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Impulsividade
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área do Texto com Heatmap */}
          <Card className="md:col-span-2 flex flex-col h-full overflow-hidden border-t-4 border-t-slate-400">
            <CardHeader className="bg-slate-50 border-b py-3 px-4 min-h-[60px]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-800">Mapa de Calor do Laudo</CardTitle>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-green-200 border border-green-400 rounded-sm"></span>
                    <span className="text-slate-600">Positivo/Protetivo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-200 border border-red-400 rounded-sm"></span>
                    <span className="text-slate-600">Risco/Negativo</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-[500px] p-8">
                <div 
                  className="prose prose-sm max-w-none text-justify leading-relaxed font-serif text-slate-800
                    [&_.positive]:bg-green-100 [&_.positive]:text-green-900 [&_.positive]:px-1 [&_.positive]:rounded-sm [&_.positive]:border-b-2 [&_.positive]:border-green-300 [&_.positive]:cursor-help [&_.positive]:transition-colors [&_.positive]:hover:bg-green-200
                    [&_.negative]:bg-red-100 [&_.negative]:text-red-900 [&_.negative]:px-1 [&_.negative]:rounded-sm [&_.negative]:border-b-2 [&_.negative]:border-red-300 [&_.negative]:cursor-help [&_.negative]:transition-colors [&_.negative]:hover:bg-red-200
                  "
                  dangerouslySetInnerHTML={{ __html: MOCK_REPORT_TEXT }}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog de Seleção de Fonte */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Origem do Documento</DialogTitle>
            <DialogDescription>
              Escolha de onde deseja importar o Laudo Psicológico para análise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleSourceSelect('s3')}
            >
                <Cloud className="h-10 w-10 text-blue-500" />
                <span className="font-semibold">Nuvem (AWS S3)</span>
                <span className="text-xs text-muted-foreground">Repositório Seguro</span>
            </Button>

            <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleSourceSelect('local')}
            >
                <HardDrive className="h-10 w-10 text-slate-600" />
                <span className="font-semibold">Diretório Local</span>
                <span className="text-xs text-muted-foreground">Upload do Computador</span>
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-3 items-start">
             <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
             <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">Validação de Assinatura</p>
                <p>O sistema verificará automaticamente a validade do certificado digital (ICP-Brasil) embutido no PDF antes de processar a análise.</p>
             </div>
          </div>

          {/* Hidden Input for Local File */}
          <Input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
