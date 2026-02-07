import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitCompare, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PrecedentComparatorProps {
  currentCaseNumber: string;
  precedentCaseNumber: string;
  similarityScore: number;
}

export function PrecedentComparator({ currentCaseNumber, precedentCaseNumber, similarityScore }: PrecedentComparatorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Simula o tempo de processamento da IA para "alinhar" os textos
  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock de textos com HTML para simular o "Highlighting" da NLP
  // Em produção, isso viria de uma análise de NER (Named Entity Recognition)
  const currentText = `
    <p class="mb-4 text-sm leading-relaxed">
      O apenado cumpre pena total de 5 anos e 4 meses pela prática do crime de 
      <span class="bg-yellow-200 dark:bg-yellow-900/60 px-1 rounded font-semibold border-b-2 border-yellow-400 cursor-help" title="Fato Similar: Tipificação">roubo majorado</span>.
    </p>
    <p class="mb-4 text-sm leading-relaxed">
      Conforme cálculo de pena, o 
      <span class="bg-green-200 dark:bg-green-900/60 px-1 rounded font-semibold border-b-2 border-green-400 cursor-help" title="Fato Similar: Requisito Objetivo">requisito objetivo de 1/6</span> 
      foi alcançado em 10/05/2024, não havendo óbice temporal para a concessão do benefício pleiteado.
    </p>
    <p class="mb-4 text-sm leading-relaxed">
      Quanto ao requisito subjetivo, o atestado de 
      <span class="bg-blue-200 dark:bg-blue-900/60 px-1 rounded font-semibold border-b-2 border-blue-400 cursor-help" title="Fato Similar: Conduta">conduta carcerária é positivo</span>, 
      não constando 
      <span class="bg-red-200 dark:bg-red-900/60 px-1 rounded font-semibold border-b-2 border-red-400 cursor-help" title="Fato Similar: Disciplina">faltas graves nos últimos 12 meses</span>.
    </p>
    <p class="text-sm leading-relaxed">
      Diante do exposto, a defesa requer a concessão da progressão ao regime semiaberto, com base no Art. 112 da LEP.
    </p>
  `;

  const precedentText = `
    <p class="mb-4 text-sm leading-relaxed text-muted-foreground">
      Trata-se de agravo em execução penal onde o sentenciado foi condenado originalmente por 
      <span class="bg-yellow-200 dark:bg-yellow-900/60 px-1 rounded font-semibold border-b-2 border-yellow-400 text-foreground">roubo majorado</span>.
    </p>
    <p class="mb-4 text-sm leading-relaxed text-muted-foreground">
      A análise dos autos indica que o lapso temporal de 
      <span class="bg-green-200 dark:bg-green-900/60 px-1 rounded font-semibold border-b-2 border-green-400 text-foreground">1/6 da pena</span> 
      foi devidamente cumprido, preenchendo o requisito objetivo.
    </p>
    <p class="mb-4 text-sm leading-relaxed text-muted-foreground">
      O diretor da unidade prisional certificou que a 
      <span class="bg-blue-200 dark:bg-blue-900/60 px-1 rounded font-semibold border-b-2 border-blue-400 text-foreground">conduta carcerária é boa</span>, 
      inexistindo registro de 
      <span class="bg-red-200 dark:bg-red-900/60 px-1 rounded font-semibold border-b-2 border-red-400 text-foreground">faltas disciplinares de natureza grave</span> 
      no período recente.
    </p>
    <p class="text-sm leading-relaxed text-muted-foreground">
      <strong>Decisão:</strong> A Turma Julgadora, por unanimidade, negou provimento ao recurso ministerial e manteve a decisão que deferiu a progressão de regime.
    </p>
  `;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-6 animate-in fade-in">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
                <GitCompare className="h-6 w-6 text-primary/50" />
            </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-primary">Processando Linguagem Natural (NLP)...</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Identificando entidades nomeadas, calculando vetores de similaridade e alinhando parágrafos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Legend Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-muted/30 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Similaridade Semântica</span>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary tracking-tight">{similarityScore}%</span>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-6">Alta Correlação</Badge>
                </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="hidden md:flex gap-6 text-xs font-medium">
                <div className="flex items-center gap-2" title="Coincidência no tipo penal">
                    <span className="h-3 w-3 rounded-full bg-yellow-200 border border-yellow-400 shadow-sm"></span>
                    <span>Tipificação</span>
                </div>
                <div className="flex items-center gap-2" title="Coincidência nos prazos">
                    <span className="h-3 w-3 rounded-full bg-green-200 border border-green-400 shadow-sm"></span>
                    <span>Requisito Objetivo</span>
                </div>
                <div className="flex items-center gap-2" title="Coincidência no comportamento">
                    <span className="h-3 w-3 rounded-full bg-blue-200 border border-blue-400 shadow-sm"></span>
                    <span>Subjetivo</span>
                </div>
                <div className="flex items-center gap-2" title="Coincidência em infrações">
                    <span className="h-3 w-3 rounded-full bg-red-200 border border-red-400 shadow-sm"></span>
                    <span>Faltas/Disciplina</span>
                </div>
            </div>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Lado Esquerdo: Caso Atual */}
        <Card className="flex flex-col border-primary/20 shadow-md overflow-hidden">
            <CardHeader className="py-3 bg-primary/5 border-b flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <FileText className="h-4 w-4" />
                    Caso Atual ({currentCaseNumber})
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">Em Análise</Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden bg-background">
                <ScrollArea className="h-[450px] p-6">
                    <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-justify"
                        dangerouslySetInnerHTML={{ __html: currentText }} 
                    />
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Lado Direito: Precedente */}
        <Card className="flex flex-col border-muted shadow-sm overflow-hidden">
            <CardHeader className="py-3 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                    <GitCompare className="h-4 w-4" />
                    Precedente ({precedentCaseNumber})
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">Jurisprudência</Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden bg-muted/5">
                <ScrollArea className="h-[450px] p-6">
                    <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-justify"
                        dangerouslySetInnerHTML={{ __html: precedentText }} 
                    />
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
