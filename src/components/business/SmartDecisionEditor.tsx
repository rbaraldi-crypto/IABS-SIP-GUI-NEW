import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, RefreshCw, Check, Copy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface SmartDecisionEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  caseContext: {
    inmateName: string;
    type: string;
    status: string;
    legalBasis?: string;
  };
  userRole: 'JUIZ' | 'ANALISTA';
}

export function SmartDecisionEditor({ initialValue, onChange, caseContext, userRole }: SmartDecisionEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Atualiza o pai quando o conteúdo muda localmente
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange(e.target.value);
  };

  const generateDraft = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setShowSuccess(false);

    // Simulação de Streaming de IA
    const template = userRole === 'JUIZ' 
      ? `VISTOS, ETC.\n\nTrata-se de pedido de ${caseContext.type.toUpperCase()} formulado em favor de ${caseContext.inmateName.toUpperCase()}.\n\nDECIDO.\n\nO apenado preenche os requisitos objetivos e subjetivos, conforme atestado de conduta carcerária e cálculo de pena (Art. 112 da LEP). Não constam faltas graves nos últimos 12 meses.\n\nAnte o exposto, DEFIRO o pedido para conceder a progressão ao regime semiaberto.\n\nExpeça-se o necessário.\n\nPublique-se. Intime-se.`
      : `CERTIFICO E DOU FÉ que, analisando os autos de execução penal de ${caseContext.inmateName}, verifico que o requisito temporal foi atingido.\n\nO cálculo de pena encontra-se correto e o atestado de conduta carcerária é favorável.\n\nEncaminho os autos conclusos para apreciação judicial, sugerindo o DEFERIMENTO do pedido, salvo melhor juízo.`;

    // Simula a digitação "streaming"
    let currentText = "";
    const words = template.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 50)); // Velocidade da "digitação"
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
    <div className="space-y-3 border rounded-md p-4 bg-background shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Assistente de Redação (IA)
            </span>
            {showSuccess && (
                <span className="text-xs text-success flex items-center gap-1 animate-in fade-in">
                    <Check className="h-3 w-3" /> Gerado com sucesso
                </span>
            )}
        </div>
        <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={generateDraft}
            disabled={isGenerating}
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        >
            {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isGenerating ? "Escrevendo..." : "Gerar Minuta Automática"}
        </Button>
      </div>

      {isGenerating && <Progress value={generationProgress} className="h-1" />}

      <div className="relative">
        <Textarea 
            value={content}
            onChange={handleChange}
            placeholder="O texto da decisão ou parecer aparecerá aqui..."
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-y pr-10"
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

      <Alert className="bg-purple-50 border-purple-100 text-purple-900 py-2">
        <AlertDescription className="text-xs flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            A IA utilizou os dados do <strong>Perfil do Apenado</strong> e <strong>Precedentes Similares</strong> para compor este texto. Revise antes de assinar.
        </AlertDescription>
      </Alert>
    </div>
  );
}
