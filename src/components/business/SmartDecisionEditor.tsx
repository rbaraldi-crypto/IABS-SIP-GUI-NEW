import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, RefreshCw, Check, Copy, FileText, 
  Search, BookOpen, AlertCircle, ScanText, CheckCircle2,
  ClipboardPaste, Plus, Stamp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CaseDocument } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { EvidenceItem } from './DigitalDossier';

interface SmartDecisionEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  caseContext: {
    inmateName: string;
    type: string;
    status: string;
    legalBasis?: string;
  };
  userRole: 'JUIZ' | 'ANALISTA' | 'PROMOTOR' | 'ADVOGADO' | 'DEFENSOR' | 'POLICIA';
  documents?: CaseDocument[];
  externalEvidences?: EvidenceItem[]; // New Prop for admitted evidences
}

interface ExtractedFact {
  id: string;
  fact: string;
  sourceDoc: string;
  page: number;
  confidence: number;
  type: 'positive' | 'negative' | 'neutral';
  isAdmitted?: boolean;
}

export function SmartDecisionEditor({ initialValue, onChange, caseContext, userRole, documents = [], externalEvidences = [] }: SmartDecisionEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Demo / Paste Context State
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");

  // Sync external evidences
  useEffect(() => {
    if (externalEvidences.length > 0) {
      const newFacts = externalEvidences.map(ev => ({
        id: ev.id,
        fact: "Evidência formalmente admitida nos autos",
        sourceDoc: ev.documentTitle || "Documento do Processo",
        page: ev.pageIndex,
        confidence: 100,
        type: 'neutral' as const,
        isAdmitted: true
      }));
      
      // Merge avoiding duplicates
      setExtractedFacts(prev => {
        const existingIds = new Set(prev.map(f => f.id));
        const uniqueNew = newFacts.filter(f => !existingIds.has(f.id));
        return [...uniqueNew, ...prev];
      });
    }
  }, [externalEvidences]);

  // Atualiza o pai quando o conteúdo muda localmente
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange(e.target.value);
  };

  const analyzeDocuments = async () => {
    if (!documents || documents.length === 0) return;
    
    setIsAnalyzing(true);
    setGenerationProgress(0);
    
    // Keep admitted evidences, clear others
    setExtractedFacts(prev => prev.filter(f => f.isAdmitted));

    // Simula leitura de cada documento
    const totalSteps = documents.length * 2;
    let currentStep = 0;

    const facts: ExtractedFact[] = [];

    for (const doc of documents) {
      // Simula tempo de processamento por documento
      await new Promise(r => setTimeout(r, 600)); 
      currentStep++;
      setGenerationProgress((currentStep / totalSteps) * 100);

      // Lógica Mock de Extração baseada no tipo de documento
      if (doc.type === 'Certidão' || doc.title.includes('Boletim')) {
        facts.push({
          id: `fact-${doc.id}`,
          fact: "Conduta Carcerária classificada como 'ÓTIMA'",
          sourceDoc: doc.title,
          page: Math.floor(Math.random() * doc.pages) + 1,
          confidence: 98,
          type: 'positive'
        });
      } else if (doc.type === 'Laudo' || doc.title.includes('Exame')) {
        facts.push({
          id: `fact-${doc.id}`,
          fact: "Ausência de traços de periculosidade latente",
          sourceDoc: doc.title,
          page: doc.pages - 1,
          confidence: 85,
          type: 'positive'
        });
      } else if (doc.type === 'Petição') {
        facts.push({
          id: `fact-${doc.id}`,
          fact: "Pedido fundamentado no Art. 112 da LEP",
          sourceDoc: doc.title,
          page: 2,
          confidence: 99,
          type: 'neutral'
        });
      }
    }

    setExtractedFacts(prev => [...prev, ...facts]);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
    setGenerationProgress(100);
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    setIsPasteDialogOpen(false);
    setIsAnalyzing(true);
    setGenerationProgress(0);

    // Simula processamento do texto colado
    setTimeout(() => {
        const newFacts: ExtractedFact[] = [];
        const lowerText = pastedText.toLowerCase();

        // Regras simples de extração para Demo
        if (lowerText.includes("bom comportamento") || lowerText.includes("ótima conduta")) {
            newFacts.push({
                id: `demo-fact-${Date.now()}-1`,
                fact: "Comportamento carcerário favorável identificado no texto",
                sourceDoc: "Texto Colado (Demo)",
                page: 1,
                confidence: 95,
                type: 'positive'
            });
        }
        
        if (lowerText.includes("trabalho") || lowerText.includes("estudo")) {
            newFacts.push({
                id: `demo-fact-${Date.now()}-2`,
                fact: "Atividade laborterápica ou educacional citada",
                sourceDoc: "Texto Colado (Demo)",
                page: 1,
                confidence: 90,
                type: 'positive'
            });
        }

        if (lowerText.includes("falta grave") || lowerText.includes("indisciplina")) {
            newFacts.push({
                id: `demo-fact-${Date.now()}-3`,
                fact: "Menção a falta disciplinar ou infração",
                sourceDoc: "Texto Colado (Demo)",
                page: 1,
                confidence: 88,
                type: 'negative'
            });
        }

        // Fato genérico se nada for encontrado
        if (newFacts.length === 0) {
             newFacts.push({
                id: `demo-fact-${Date.now()}-0`,
                fact: "Conteúdo processual analisado (sem palavras-chave específicas)",
                sourceDoc: "Texto Colado (Demo)",
                page: 1,
                confidence: 60,
                type: 'neutral'
            });
        }

        setExtractedFacts(prev => [...prev, ...newFacts]);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        setGenerationProgress(100);
        setPastedText(""); // Limpa
    }, 1500);
  };

  const generateDraft = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setShowSuccess(false);

    // Constrói referências baseadas nos fatos extraídos
    const citations = extractedFacts.map(f => `(cf. ${f.sourceDoc}, fls. ${f.page})`).join(' e ');
    const behaviorFact = extractedFacts.find(f => f.fact.includes('Conduta') || f.fact.includes('Comportamento')) 
      ? `o atestado de conduta carcerária é favorável (vide ${extractedFacts.find(f => f.fact.includes('Conduta') || f.fact.includes('Comportamento'))?.sourceDoc})`
      : "o atestado de conduta carcerária encontra-se nos autos";

    // Templates Contextuais
    let template = "";

    if (userRole === 'JUIZ') {
      template = `VISTOS, ETC.\n\nTrata-se de pedido de ${caseContext.type.toUpperCase()} formulado em favor de ${caseContext.inmateName.toUpperCase()}.\n\nDECIDO.\n\nCompulsando os autos, verifico que o apenado preenche os requisitos objetivos e subjetivos. Conforme análise documental, ${behaviorFact}. Não constam faltas graves nos últimos 12 meses.\n\nAdemais, o exame criminológico aponta prognóstico positivo ${citations ? citations : ""}.\n\nAnte o exposto, DEFIRO o pedido para conceder a progressão ao regime semiaberto, com fundamento no Art. 112 da Lei de Execução Penal.\n\nExpeça-se o necessário.\n\nPublique-se. Intime-se.`;
    } else if (userRole === 'PROMOTOR') {
      template = `MM. JUIZ,\n\nO MINISTÉRIO PÚBLICO, analisando o pedido de ${caseContext.type}, manifesta-se pelo DEFERIMENTO.\n\nO requisito objetivo foi alcançado e o requisito subjetivo encontra-se preenchido, conforme ${behaviorFact}.\n\nNão havendo óbice legal, opina-se favoravelmente.`;
    } else {
      template = `CERTIFICO E DOU FÉ que, analisando os autos de execução penal de ${caseContext.inmateName}, verifico a presença dos documentos essenciais.\n\nFatos Relevantes Identificados:\n${extractedFacts.map(f => `- ${f.fact} [Fonte: ${f.sourceDoc}, Pág. ${f.page}]`).join('\n')}\n\nEncaminho os autos conclusos para apreciação.`;
    }

    // Simula a digitação "streaming"
    let currentText = "";
    const words = template.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 30)); // Velocidade da "digitação"
      currentText += (i > 0 ? " " : "") + words[i];
      setContent(currentText);
      setGenerationProgress(Math.round(((i + 1) / words.length) * 100));
    }

    onChange(currentText); // Atualiza o form pai ao final
    setIsGenerating(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-[400px]">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col gap-3 border rounded-md p-4 bg-background shadow-sm h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Smart Editor (RAG)
              </span>
              {showSuccess && (
                  <span className="text-xs text-success flex items-center gap-1 animate-in fade-in">
                      <Check className="h-3 w-3" /> Gerado com sucesso
                  </span>
              )}
          </div>
          <div className="flex gap-2">
            {!analysisComplete && documents && documents.length > 0 && (
               <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={analyzeDocuments}
                disabled={isAnalyzing}
                className="gap-2 text-xs"
              >
                {isAnalyzing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ScanText className="h-3 w-3" />}
                {isAnalyzing ? "Lendo Autos..." : "Analisar Autos (IA)"}
              </Button>
            )}
            
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={generateDraft}
                disabled={isGenerating || isAnalyzing}
                className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-colors text-xs"
            >
                <Sparkles className="h-3 w-3" />
                {isGenerating ? "Escrevendo..." : "Gerar Minuta"}
            </Button>
          </div>
        </div>

        {(isGenerating || isAnalyzing) && <Progress value={generationProgress} className="h-1" />}

        <div className="relative flex-1">
          <Textarea 
              value={content}
              onChange={handleChange}
              placeholder={analysisComplete ? "A IA analisou os documentos. Clique em 'Gerar Minuta' para criar o texto fundamentado." : "O texto da decisão aparecerá aqui..."}
              className="h-full min-h-[300px] font-mono text-sm leading-relaxed resize-none pr-10"
          />
          <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
              onClick={() => {navigator.clipboard.writeText(content); setShowSuccess(true);}}
              title="Copiar texto"
          >
              <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
           <div className="flex items-center gap-1">
             <BookOpen className="h-3 w-3" />
             <span>Base Legal: LEP, CPP e Jurisprudência STJ</span>
           </div>
           {analysisComplete && (
             <span className="text-success flex items-center gap-1">
               <CheckCircle2 className="h-3 w-3" /> {extractedFacts.length} fatos extraídos
             </span>
           )}
        </div>
      </div>

      {/* RAG Context Panel (Sidebar) */}
      <div className={cn(
        "w-full md:w-72 border rounded-md bg-muted/10 flex flex-col transition-all duration-500",
        analysisComplete || extractedFacts.length > 0 ? "opacity-100 translate-x-0" : "opacity-100" // Always visible now for Demo button
      )}>
        <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Evidências (RAG)
          </h3>
          <Badge variant="outline" className="text-[10px] bg-background">CNJ Ready</Badge>
        </div>

        <ScrollArea className="flex-1 p-3">
          {/* Demo Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mb-3 border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs h-8"
            onClick={() => setIsPasteDialogOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar Texto (Demo)
          </Button>

          {extractedFacts.length > 0 ? (
            <div className="space-y-3">
              {extractedFacts.map((fact) => (
                <Card key={fact.id} className={cn(
                  "shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer group",
                  fact.isAdmitted ? "border-l-green-600 bg-green-50/30" : "border-l-primary"
                )}>
                  <CardContent className="p-3">
                    {fact.isAdmitted && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-green-700 uppercase">
                        <Stamp className="h-3 w-3" /> Admitida nos Autos
                      </div>
                    )}
                    <p className="text-xs font-medium text-foreground mb-2 leading-snug">
                      "{fact.fact}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
                      <span className="flex items-center gap-1 truncate max-w-[120px]" title={fact.sourceDoc}>
                        <FileText className="h-3 w-3" /> {fact.sourceDoc}
                      </span>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1">
                        Fls. {fact.page}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[10px] text-green-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="h-3 w-3" /> Citado na minuta
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-muted-foreground">
              <ScanText className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs">
                Clique em "Analisar Autos" ou adicione um texto demo para extrair fatos.
              </p>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t bg-yellow-50/50 text-[10px] text-yellow-800 flex gap-2">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <p>A IA sugere citações baseadas no OCR. Sempre confira a folha original.</p>
        </div>
      </div>

      {/* Paste Text Dialog (Demo Mode) */}
      <Dialog open={isPasteDialogOpen} onOpenChange={setIsPasteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ClipboardPaste className="h-5 w-5 text-primary" />
                    Adicionar Evidência (Modo Demo)
                </DialogTitle>
                <DialogDescription>
                    Cole um trecho de texto processual para que a IA extraia fatos relevantes.
                </DialogDescription>
            </DialogHeader>
            <div className="py-2">
                <Textarea 
                    placeholder="Ex: Certifico que o apenado mantém bom comportamento carcerário e exerce atividade laborativa..." 
                    className="min-h-[150px]"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPasteDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleProcessPastedText} disabled={!pastedText.trim()}>
                    <Sparkles className="h-4 w-4 mr-2" /> Extrair Fatos (IA)
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
