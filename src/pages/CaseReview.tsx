import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockMyCases, SimilarCase } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, Scale, FileText, AlertCircle, CheckCircle2, Gavel, ArrowUpRight, Lock, 
  ExternalLink, Paperclip, Eye, Edit2, RefreshCw, Loader2, ShieldAlert, PieChart, 
  Split, ArrowRightLeft, PenTool, Shield, Calendar, MapPin, Video, Clock, 
  CalendarPlus, Download, Siren, Maximize2, Minimize2, BookOpen, Sparkles, BrainCircuit,
  Calculator
} from 'lucide-react';
import { PdfViewer } from '@/components/business/PdfViewer';
import { PrecedentComparator } from '@/components/business/PrecedentComparator';
import { SmartDecisionEditor } from '@/components/business/SmartDecisionEditor';
import { PsychologicalAnalysis } from '@/components/business/PsychologicalAnalysis';
import { SentenceCalculator } from '@/components/business/SentenceCalculator';
import { dynamoService } from '@/services/awsMock';

// Interface para a resposta da API
interface Classificacao {
  tipo: string;
  materia: string;
}

type UserRole = "JUIZ" | "ANALISTA" | "PROMOTOR" | "ADVOGADO" | "DEFENSOR" | "POLICIA";

export function CaseReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSimilarCase, setSelectedSimilarCase] = useState<SimilarCase | null>(null);
  
  // Estado para o visualizador de documentos
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  // Estado para Análise Psicológica (IA)
  const [isPsychAnalysisOpen, setIsPsychAnalysisOpen] = useState(false);

  // Estado para Calculadora de Pena
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // Estado para o Comparador Visual (Diff View)
  const [comparatorData, setComparatorData] = useState<{current: string, precedent: string, score: number} | null>(null);

  // State for Classification Data (Fetched from API)
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [isLoadingClassifications, setIsLoadingClassifications] = useState(false);

  // State for Classification Editing
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [tempClassification, setTempClassification] = useState({ tipo: "", materia: "" });
  const [currentClassification, setCurrentClassification] = useState({ tipo: "Execucao Penal", materia: "" });
  
  // State for Similarity Refresh
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [displayedSimilarCases, setDisplayedSimilarCases] = useState<SimilarCase[]>([]);

  // Auth & Error State
  const [authError, setAuthError] = useState<string | null>(null);
  // Mock Identity for demonstration
  const [mockUserRole, setMockUserRole] = useState<UserRole>("JUIZ");

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusDraft, setFocusDraft] = useState("");

  const caseData = mockMyCases.find(c => c.id === id);

  // Initialize state with case data
  useEffect(() => {
    if (caseData) {
      setCurrentClassification({
        tipo: "Execucao Penal", 
        materia: caseData.type
      });
      setDisplayedSimilarCases(caseData.similarCases);
    }
  }, [caseData]);

  // Fetch Classifications
  useEffect(() => {
    const fetchClassificacoes = async () => {
      setIsLoadingClassifications(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData: Classificacao[] = [
          { tipo: "Execucao Penal", materia: "Progressao" },
          { tipo: "Execucao Penal", materia: "Livramento Condicional" },
          { tipo: "Execucao Penal", materia: "Comutacao" },
          { tipo: "Execucao Penal", materia: "Indulto" },
          { tipo: "Execucao Penal", materia: "Unificacao de Penas" },
          { tipo: "Execucao Penal", materia: "Remissao" },
          { tipo: "Medida de Seguranca", materia: "Cessacao" },
          { tipo: "Medida de Seguranca", materia: "Internacao" },
          { tipo: "Execucao Penal", materia: "Regressao" }
        ];
        setClassificacoes(mockData);
      } catch (error) {
        console.error("Erro ao buscar classificações:", error);
      } finally {
        setIsLoadingClassifications(false);
      }
    };
    fetchClassificacoes();
  }, []);

  const handleOpenEdit = () => {
    setTempClassification(currentClassification);
    setIsEditClassOpen(true);
    setAuthError(null);
  };

  const handleSaveClassification = async () => {
    setAuthError(null);
    const isJuiz = mockUserRole === "JUIZ";

    if (isJuiz) {
      setAuthError("Erro 403: Função não permitida para Juízes.");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      setIsRecalculating(true);
      setIsEditClassOpen(false);

      // Log Audit
      await dynamoService.putItem({
        CaseId: id || "unknown",
        ActionType: "UPDATE_CLASSIFICATION",
        User: mockUserRole.toLowerCase() + ".user",
        Role: mockUserRole,
        Details: `Alteração de classificação para ${tempClassification.tipo} / ${tempClassification.materia}`,
        Timestamp: new Date().toISOString()
      });

      setTimeout(() => {
        setCurrentClassification(tempClassification);
        const newCases = displayedSimilarCases.map(c => ({
          ...c,
          similarity: Math.floor(Math.random() * (99 - 75) + 75),
          decision: Math.random() > 0.3 ? "Concedido" : "Negado (Falta Grave)" 
        })).sort((a, b) => b.similarity - a.similarity);

        setDisplayedSimilarCases(newCases);
        setIsRecalculating(false);
        setAuthError(null);
      }, 1500);

    } catch (error) {
      console.error("API Error:", error);
      setIsRecalculating(false);
    }
  };

  const handleNavigateToDecision = () => {
    navigate(`/acao-humana/${id}`, { state: { role: mockUserRole } });
  };

  const handleAuditLog = (action: string, details: string) => {
    dynamoService.putItem({
      CaseId: id || "unknown",
      ActionType: action,
      User: mockUserRole.toLowerCase() + ".user",
      Role: mockUserRole,
      Details: details,
      Timestamp: new Date().toISOString()
    });
  };

  const handleSaveSimulation = (data: any) => {
    handleAuditLog("SIMULACAO_PENA", `Simulação salva: ${data.remissionDays} dias remidos.`);
    setIsCalculatorOpen(false);
  };

  // --- Calendar Integration Logic ---
  const getCalendarLinks = () => {
    if (!caseData || !caseData.hearingDate) return null;

    // Parse date: "25/06/2024 14:30"
    const [datePart, timePart] = caseData.hearingDate.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duração padrão

    const title = `Audiência: ${caseData.inmateName} (${caseData.caseNumber})`;
    const description = `Tipo: ${caseData.hearingType}\nProcesso: ${caseData.caseNumber}\nLink Virtual: ${caseData.virtualLink || 'N/A'}`;
    const location = caseData.hearingLocation || 'Tribunal de Justiça';

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${encodeURIComponent(location)}`;

    // ICS Content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatGoogleDate(startDate)}
DTEND:${formatGoogleDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    return { googleUrl, outlookUrl, icsContent };
  };

  const downloadIcs = (icsContent: string) => {
    const element = document.createElement("a");
    const file = new Blob([icsContent], {type: 'text/calendar'});
    element.href = URL.createObjectURL(file);
    element.download = `audiencia-${caseData?.caseNumber}.ics`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Caso não encontrado</h2>
        <Button onClick={() => navigate('/meus-casos')}>Voltar para Meus Casos</Button>
      </div>
    );
  }

  const uniqueTypes = Array.from(new Set(classificacoes.map(c => c.tipo)));
  const availableMaterias = classificacoes
    .filter(c => c.tipo === tempClassification.tipo)
    .map(c => c.materia);
    
  const calendarLinks = getCalendarLinks();

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/meus-casos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-primary">Revisão do Processo</h2>
            <Badge variant="outline" className="font-mono">{caseData.caseNumber}</Badge>
          </div>
          <p className="text-muted-foreground">
            Apenado: <span className="font-medium text-foreground">{caseData.inmateName}</span>
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
            {/* Sentence Calculator Button - VISIBLE ON MOBILE NOW */}
            <Button 
                variant="secondary" 
                className="gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                onClick={() => setIsCalculatorOpen(true)}
            >
                <Calculator className="h-4 w-4" />
                <span className="hidden md:inline">Simular Pena</span>
            </Button>

            {/* Focus Mode Button */}
            <Button 
                variant="outline" 
                className="gap-2 border-primary/30 hover:bg-primary/5 hidden md:flex"
                onClick={() => setIsFocusMode(true)}
            >
                <Maximize2 className="h-4 w-4" />
                Modo Foco
            </Button>

            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded border border-dashed border-muted-foreground/30">
                <span className="text-xs font-mono text-muted-foreground hidden md:inline">Simular Role:</span>
                <select 
                    className="text-xs bg-transparent border-none font-bold text-primary focus:ring-0 cursor-pointer"
                    value={mockUserRole}
                    onChange={(e) => setMockUserRole(e.target.value as any)}
                >
                    <option value="JUIZ">JUIZ</option>
                    <option value="PROMOTOR">PROMOTOR (MP)</option>
                    <option value="ADVOGADO">ADVOGADO</option>
                    <option value="DEFENSOR">DEFENSORIA PÚBLICA</option>
                    <option value="POLICIA">POLÍCIA PENAL</option>
                    <option value="ANALISTA">ANALISTA</option>
                </select>
            </div>

            <Button 
                className={`gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 ${
                    mockUserRole === 'PROMOTOR' ? 'bg-destructive hover:bg-destructive/90' :
                    mockUserRole === 'ADVOGADO' ? 'bg-slate-800 hover:bg-slate-700' : 
                    mockUserRole === 'DEFENSOR' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                    mockUserRole === 'POLICIA' ? 'bg-slate-900 hover:bg-slate-800' : ''
                }`} 
                onClick={handleNavigateToDecision}
            >
                {mockUserRole === 'JUIZ' ? <><Gavel className="h-4 w-4" /> <span className="hidden md:inline">Decidir Agora</span></> :
                 mockUserRole === 'PROMOTOR' ? <><Scale className="h-4 w-4" /> <span className="hidden md:inline">Emitir Parecer</span></> :
                 mockUserRole === 'ADVOGADO' ? <><PenTool className="h-4 w-4" /> <span className="hidden md:inline">Peticionar</span></> :
                 mockUserRole === 'DEFENSOR' ? <><Shield className="h-4 w-4" /> <span className="hidden md:inline">Manifestar (DP)</span></> :
                 mockUserRole === 'POLICIA' ? <><Siren className="h-4 w-4" /> <span className="hidden md:inline">Registrar Ocorrência</span></> :
                 <><FileText className="h-4 w-4" /> <span className="hidden md:inline">Analisar</span></>}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... (Rest of the component remains unchanged) ... */}
        {/* Main Case Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Resumo do Pedido
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={handleOpenEdit}>
                <Edit2 className="h-3 w-3" />
                Classificar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-sm leading-relaxed relative">
                <div className="flex flex-col gap-1 mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Classificação Atual</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                            {currentClassification.tipo}
                        </Badge>
                        <span className="text-muted-foreground">/</span>
                        <Badge variant="default" className="text-sm font-semibold px-3 py-1">
                            {currentClassification.materia}
                        </Badge>
                    </div>
                </div>
                <Separator className="my-3" />
                <p>
                  O apenado solicita o benefício acima com base no cumprimento de 1/6 da pena e bom comportamento carcerário atestado.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Paperclip className="h-5 w-5" />
                    Peças Processuais
                </CardTitle>
                <CardDescription>Documentos digitalizados vinculados a este pedido.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all group cursor-pointer border-primary/20 shadow-sm hover:shadow-md" 
                        onClick={() => setIsDocViewerOpen(true)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">Visualizador de Autos</p>
                                    <Badge variant="default" className="text-[10px] h-4 px-1 bg-red-600 hover:bg-red-700">NOVO</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Clique para abrir o visualizador</p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                    </div>

                    {/* Botão de Análise Psicológica (IA) */}
                    <div 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all group cursor-pointer border-blue-200 shadow-sm hover:shadow-md" 
                        onClick={() => setIsPsychAnalysisOpen(true)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                                <BrainCircuit className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">Exame Criminológico (IA)</p>
                                    <Badge variant="default" className="text-[10px] h-4 px-1 bg-blue-600 hover:bg-blue-700">AI</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Análise de Sentimento & Risco</p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost">
                            <Sparkles className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Similar Cases Section */}
          <Card className="border-primary/20 shadow-md relative overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Scale className="h-5 w-5" />
                    Análise de Similaridade (IA)
                  </CardTitle>
                  <CardDescription>
                    Casos precedentes com alta correlação identificados pelo motor de inferência.
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                    {displayedSimilarCases.length} Casos Encontrados
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6 min-h-[200px]">
              {isRecalculating ? (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-center">
                        <p className="font-semibold text-primary">Recalculando Similaridade...</p>
                    </div>
                </div>
              ) : null}

              {displayedSimilarCases.length > 0 ? (
                displayedSimilarCases.map((simCase) => (
                  <div key={simCase.id} className="group relative">
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <div className={`
                          flex items-center justify-center w-14 h-14 rounded-full border-4 text-sm font-bold transition-all duration-500
                          ${simCase.similarity >= 90 ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}
                        `}>
                          {simCase.similarity}%
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Similaridade</span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <button 
                              onClick={() => setSelectedSimilarCase(simCase)}
                              className="font-mono text-sm font-semibold text-primary hover:underline hover:text-primary/80 flex items-center gap-1 transition-colors text-left"
                            >
                              {simCase.caseNumber}
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </button>
                            <p className="text-xs text-muted-foreground">{simCase.crime}</p>
                          </div>
                          <Badge variant={simCase.decision.includes('Negado') ? 'destructive' : 'default'} 
                            className={simCase.decision.includes('Negado') ? '' : 'bg-success hover:bg-success/90'}>
                            {simCase.decision}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="self-center pl-2 flex flex-col gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedSimilarCase(simCase)}
                          title="Ver Detalhes"
                        >
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        {/* Botão Diff View Destacado */}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 gap-1 ml-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComparatorData({
                              current: caseData.caseNumber,
                              precedent: simCase.caseNumber,
                              score: simCase.similarity
                            });
                          }}
                          title="Comparar Lado a Lado (Diff View)"
                        >
                          <Split className="h-3 w-3" />
                          Comparar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Nenhum caso similar com alta relevância encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            {/* Hearing Schedule Card */}
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Agendamento de Audiência
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {caseData.hearingDate ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-lg text-primary">{caseData.hearingDate.split(' ')[0]}</span>
                                    <span className="text-sm font-medium text-muted-foreground">às {caseData.hearingDate.split(' ')[1]}</span>
                                </div>
                                <Badge variant="outline" className="text-xs bg-background">{caseData.hearingType}</Badge>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-start gap-2 text-sm">
                                    {caseData.isVirtual ? <Video className="h-4 w-4 mt-0.5 text-blue-500" /> : <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />}
                                    <span className="text-muted-foreground leading-tight">{caseData.hearingLocation}</span>
                                </div>
                                {caseData.isVirtual && caseData.virtualLink && (
                                    <Button variant="link" className="h-auto p-0 text-blue-600 text-xs ml-6" onClick={() => window.open(caseData.virtualLink, '_blank')}>
                                        Entrar na Sala Virtual <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Add to Calendar Button */}
                            {calendarLinks && (
                              <div className="pt-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                      <CalendarPlus className="h-4 w-4" />
                                      Adicionar ao Calendário
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => window.open(calendarLinks.googleUrl, '_blank')} className="cursor-pointer">
                                      Google Calendar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(calendarLinks.outlookUrl, '_blank')} className="cursor-pointer">
                                      Outlook / Office 365
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => downloadIcs(calendarLinks.icsContent)} className="cursor-pointer gap-2">
                                      <Download className="h-3 w-3" />
                                      Baixar Arquivo (.ics)
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                            Nenhuma audiência agendada para este processo.
                            <Button variant="link" className="text-xs h-auto p-0 mt-1">Solicitar Agendamento</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Sugestão do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex flex-col items-center text-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                        <span className="font-bold text-success text-lg">Deferimento</span>
                        <p className="text-xs text-muted-foreground">
                            Baseado em 92% de casos similares deferidos com este perfil.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Dialogs and Modals (Classification, PDF Viewer, Comparator, Similar Case Details) */}
      
      {/* Dialog for Classification Edit */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Classificação do Processo</DialogTitle>
            <DialogDescription>
              Ajuste a tipificação para refinar a busca de precedentes e análise de IA.
            </DialogDescription>
          </DialogHeader>
          
          {authError && (
            <Alert variant="destructive" className="mb-2">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Acesso Negado</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {isLoadingClassifications ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando classificações...</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo do Processo</Label>
                <Select 
                  value={tempClassification.tipo} 
                  onValueChange={(val) => setTempClassification(prev => ({ ...prev, tipo: val, materia: "" }))}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="materia">Matéria / Pedido</Label>
                <Select 
                  value={tempClassification.materia} 
                  onValueChange={(val) => setTempClassification(prev => ({ ...prev, materia: val }))}
                  disabled={!tempClassification.tipo}
                >
                  <SelectTrigger id="materia">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaterias.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveClassification} disabled={!tempClassification.materia || isLoadingClassifications}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Salvar e Recalcular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Document Viewer (REAL PDF) */}
      <Dialog open={isDocViewerOpen} onOpenChange={setIsDocViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <div>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Visualizador de Autos
                </DialogTitle>
                <DialogDescription>
                    Selecione a fonte do arquivo (S3 ou Local) para visualização.
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDocViewerOpen(false)}>
                <span className="sr-only">Fechar</span>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 bg-slate-50 overflow-hidden">
              <PdfViewer caseId={id || "unknown"} onLogAction={handleAuditLog} />
            </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Psychological Analysis (IA) */}
      <Dialog open={isPsychAnalysisOpen} onOpenChange={setIsPsychAnalysisOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-blue-50/50">
              <div>
                <DialogTitle className="flex items-center gap-2 text-primary">
                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                    Análise de Sentimento em Laudo Psicológico
                </DialogTitle>
                <DialogDescription>
                    O sistema identificou automaticamente trechos de risco e fatores protetivos.
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPsychAnalysisOpen(false)}>
                <span className="sr-only">Fechar</span>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-6 bg-background overflow-hidden">
              <PsychologicalAnalysis />
            </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Sentence Calculator (NEW) */}
      <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Simulador de Pena Interativo
                </DialogTitle>
                <DialogDescription>
                    Calcule o impacto de atividades de ressocialização na data de progressão de regime.
                </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
                <SentenceCalculator 
                    currentProgressionDate="10/05/2026" // Mock Date
                    onSaveSimulation={handleSaveSimulation}
                />
            </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Comparator (Diff View) */}
      <Dialog open={!!comparatorData} onOpenChange={(open) => !open && setComparatorData(null)}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
                <DialogTitle className="flex items-center gap-2 text-primary">
                    <ArrowRightLeft className="h-5 w-5" />
                    Comparador de Precedentes (Diff View)
                </DialogTitle>
                <DialogDescription>
                    Análise comparativa visual entre os fundamentos do caso atual e a jurisprudência selecionada.
                </DialogDescription>
            </div>
            
            {comparatorData && (
              <div className="flex-1 p-6 bg-background overflow-hidden">
                <PrecedentComparator 
                  currentCaseNumber={comparatorData.current}
                  precedentCaseNumber={comparatorData.precedent}
                  similarityScore={comparatorData.score}
                />
              </div>
            )}
            
            <DialogFooter className="p-4 border-t bg-muted/10">
                <Button variant="outline" onClick={() => setComparatorData(null)}>Fechar Comparação</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Similar Case Details */}
      <Dialog open={!!selectedSimilarCase} onOpenChange={(open) => !open && setSelectedSimilarCase(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 bg-muted/50">
                    <Lock className="h-3 w-3" /> Read Only
                </Badge>
                <span className="text-xs text-muted-foreground">Visualização de Precedente</span>
            </div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Processo {selectedSimilarCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Detalhes do caso correlato para fins de comparação jurisprudencial.
            </DialogDescription>
          </DialogHeader>

          {selectedSimilarCase && (
            <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Crime Principal</span>
                        <p className="font-medium mt-1">{selectedSimilarCase.crime}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Pena Fixada</span>
                        <p className="font-medium mt-1">{selectedSimilarCase.penalty}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Decisão Final</span>
                        <p className={`font-medium mt-1 ${selectedSimilarCase.decision.includes("Negado") ? "text-destructive" : "text-success"}`}>
                            {selectedSimilarCase.decision}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Fatores de Similaridade (Pesos)
                    </h4>
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                        {selectedSimilarCase.factors && selectedSimilarCase.factors.length > 0 ? (
                            selectedSimilarCase.factors.map((factor: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-foreground/80">{factor.name}</span>
                                        <span className="font-bold text-primary">{factor.weight}%</span>
                                    </div>
                                    <Progress value={factor.weight} className="h-2" />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Mesma Tipificação Penal</Badge>
                                <Badge variant="secondary">Reincidência Específica</Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FOCUS MODE OVERLAY */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300">
            {/* Focus Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-primary">Modo de Leitura Imersiva</h2>
                        <p className="text-xs text-muted-foreground">Processo {caseData.caseNumber} • {caseData.inmateName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="animate-pulse border-primary/50 text-primary">
                        <Lock className="h-3 w-3 mr-1" />
                        Ambiente Seguro
                    </Badge>
                    <Button variant="destructive" size="sm" onClick={() => setIsFocusMode(false)} className="gap-2">
                        <Minimize2 className="h-4 w-4" />
                        Sair do Modo Foco
                    </Button>
                </div>
            </div>

            {/* Main Split Content */}
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
                {/* Left: PDF Viewer */}
                <div className="border-r bg-slate-100 p-4 flex flex-col">
                    <PdfViewer caseId={id || "unknown"} onLogAction={handleAuditLog} />
                </div>

                {/* Right: Editor */}
                <div className="p-6 bg-background overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <PenTool className="h-5 w-5 text-primary" />
                                Minuta de Decisão / Anotações
                            </h3>
                            <Badge>Rascunho Automático</Badge>
                        </div>
                        
                        <SmartDecisionEditor 
                            initialValue={focusDraft}
                            onChange={setFocusDraft}
                            userRole={mockUserRole}
                            caseContext={{
                                inmateName: caseData.inmateName,
                                type: caseData.type,
                                status: caseData.status
                            }}
                            documents={caseData.documents} // Passando documentos para o RAG
                        />
                        
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            <h4 className="font-bold flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4" />
                                Sugestão de IA
                            </h4>
                            <p>
                                Com base nos precedentes analisados (92% similaridade), sugere-se o <strong>DEFERIMENTO</strong> do pedido, 
                                visto que o requisito objetivo foi cumprido e não há faltas graves recentes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
