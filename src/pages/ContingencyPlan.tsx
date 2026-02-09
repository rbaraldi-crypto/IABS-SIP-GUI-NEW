import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BrainCircuit, CheckCircle2, AlertTriangle, 
  TrendingDown, Users, DollarSign, Clock, ShieldAlert, 
  FileText, Zap, ChevronRight, Loader2, Building2, Gavel,
  Usb, RefreshCw, Key, ShieldCheck, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { webPkiService, Certificate } from "@/services/webpkiMock";
import { dynamoService } from "@/services/awsMock";

interface PlanOption {
  id: string;
  title: string;
  type: 'Transferência' | 'Jurídico' | 'Infraestrutura';
  description: string;
  impact: string; // Ex: -150 vagas
  cost: string; // Ex: R$ 50.000
  time: string; // Ex: 15 dias
  feasibility: number; // 0-100
  risk: 'Baixo' | 'Médio' | 'Alto';
  steps: string[];
}

type SignatureStep = 'idle' | 'detecting' | 'selecting' | 'signing' | 'signed';

export function ContingencyPlan() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'analyzing' | 'results'>('analyzing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState("Iniciando motor de inferência...");

  // Signature State
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [sigStep, setSigStep] = useState<SignatureStep>('idle');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<string>("");
  const [signatureData, setSignatureData] = useState<{hash: string, cert: Certificate} | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedPlans, setExecutedPlans] = useState<string[]>([]);

  const plans: PlanOption[] = [
    {
      id: "plan-a",
      title: "Operação Redistribuição Regional",
      type: "Transferência",
      description: "Transferência imediata de detentos de baixa periculosidade para unidades regionais com déficit de ocupação (Vagas ociosas identificadas na Região Sul).",
      impact: "Redução de 12% na ocupação (aprox. 240 detentos)",
      cost: "R$ 45.000,00 (Logística)",
      time: "Imediato (3-5 dias)",
      feasibility: 92,
      risk: "Baixo",
      steps: [
        "Identificar 240 detentos perfil 'Baixo Risco' sem facção rival.",
        "Solicitar autorização da VEP (Vara de Execuções Penais).",
        "Mobilizar escolta do SOE para comboio.",
        "Notificar familiares via Portal do Cidadão."
      ]
    },
    {
      id: "plan-b",
      title: "Mutirão Jurídico Emergencial (IA + Defensoria)",
      type: "Jurídico",
      description: "Força-tarefa utilizando IA para triagem automática de benefícios vencidos (Livramento/Progressão) e atuação conjunta com Defensoria Pública.",
      impact: "Liberação estimada de 150-180 vagas",
      cost: "R$ 15.000,00 (Horas extras)",
      time: "Curto Prazo (15-20 dias)",
      feasibility: 85,
      risk: "Médio",
      steps: [
        "Rodar script de varredura de benefícios vencidos no BNMP.",
        "Gerar minutas automáticas de concessão para o Juiz Corregedor.",
        "Instalar gabinete de crise com MP e Defensoria.",
        "Priorizar casos de crimes sem violência."
      ]
    },
    {
      id: "plan-c",
      title: "Expansão Modular Rápida",
      type: "Infraestrutura",
      description: "Instalação de estruturas modulares de contenção (celas container) em área anexa para absorver excedente temporário.",
      impact: "Criação de 100 novas vagas provisórias",
      cost: "R$ 850.000,00",
      time: "Médio Prazo (45-60 dias)",
      feasibility: 60,
      risk: "Alto",
      steps: [
        "Abertura de licitação emergencial.",
        "Preparação do terreno anexo ao Pavilhão C.",
        "Instalação de rede elétrica e hidráulica.",
        "Contratação de agentes temporários."
      ]
    }
  ];

  useEffect(() => {
    if (step === 'analyzing') {
      const texts = [
        "Conectando ao Banco Nacional (BNMP)...",
        "Analisando perfil criminológico da massa carcerária...",
        "Verificando vagas ociosas em unidades vizinhas...",
        "Calculando custos logísticos e jurídicos...",
        "Gerando cenários preditivos..."
      ];
      
      let currentTextIndex = 0;
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('results');
            return 100;
          }
          return prev + 2;
        });

        if (analysisProgress % 20 === 0 && currentTextIndex < texts.length) {
          setAnalysisText(texts[currentTextIndex]);
          currentTextIndex++;
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step, analysisProgress]);

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Transferência': return <Users className="h-5 w-5 text-blue-500" />;
      case 'Jurídico': return <Gavel className="h-5 w-5 text-purple-500" />;
      case 'Infraestrutura': return <Building2 className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // --- Signature Handlers ---

  const handleOpenExecutionDialog = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setExecutionDialogOpen(true);
    setSigStep('idle');
    setSignatureData(null);
    setAuthError(null);
    setIsExecuting(false);
    setCertificates([]);
    setSelectedCert("");
  };

  const startSignatureFlow = async () => {
    setSigStep('detecting');
    setAuthError(null);
    try {
      const isReady = await webPkiService.init();
      if (isReady) {
        const certs = await webPkiService.listCertificates();
        setCertificates(certs);
        setSigStep('selecting');
        if (certs.length > 0) setSelectedCert(certs[0].thumbprint);
      }
    } catch (e) {
      setAuthError("Erro ao comunicar com componente WebPKI. Verifique se o Token está conectado.");
      setSigStep('idle');
    }
  };

  const performSignature = async () => {
    if (!selectedCert || !selectedPlan) return;
    setSigStep('signing');
    setAuthError(null);
    
    try {
      const certObj = certificates.find(c => c.thumbprint === selectedCert);
      if (!certObj) throw new Error("Certificado inválido");

      const dataToSign = `EXECUTE_PLAN:${selectedPlan.id}|TIMESTAMP:${new Date().toISOString()}`;
      const hash = await webPkiService.signData(selectedCert, dataToSign);
      
      setSignatureData({ hash, cert: certObj });
      setSigStep('signed');
    } catch (e) {
      setAuthError("Falha na operação criptográfica. Senha do Token incorreta ou bloqueada.");
      setSigStep('selecting');
    }
  };

  const confirmExecution = async () => {
    if (!selectedPlan || !signatureData) return;
    
    setIsExecuting(true);
    try {
      // Log audit
      await dynamoService.putItem({
        CaseId: "CONTINGENCY-PLAN",
        ActionType: "EXECUTE_PLAN_SIGNED",
        User: signatureData.cert.subjectName,
        Role: "GESTOR",
        Details: `Execução do plano: ${selectedPlan.title}. Hash ICP: ${signatureData.hash}`,
        Timestamp: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setExecutedPlans(prev => [...prev, selectedPlan.id]);
      setExecutionDialogOpen(false);
    } catch (error) {
      console.error(error);
      setAuthError("Erro ao registrar execução no sistema.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white">
            <ArrowLeft className="h-6 w-6 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              Plano de Contingência Assistido por IA
            </h1>
            <p className="text-muted-foreground">
              Análise estratégica para mitigação de risco de colapso carcerário.
            </p>
          </div>
        </div>

        {step === 'analyzing' ? (
          <Card className="border-none shadow-lg mt-10">
            <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-slate-100"></div>
                <div className="h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Zap className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-800">{analysisText}</h3>
                <Progress value={analysisProgress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground font-mono">{analysisProgress}% concluído</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800 font-bold">Diagnóstico Crítico</AlertTitle>
              <AlertDescription className="text-red-700">
                A projeção indica <strong>superlotação de 135%</strong> em 6 meses. Ação imediata é necessária para evitar rebeliões e sanções internacionais.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {plans.map((plan, index) => {
                const isExecuted = executedPlans.includes(plan.id);
                return (
                  <Card key={plan.id} className={`overflow-hidden border-l-4 transition-shadow ${isExecuted ? 'border-l-success bg-success/5' : 'border-l-primary hover:shadow-md'}`}>
                    <CardHeader className={`${isExecuted ? 'bg-success/10' : 'bg-white'} pb-2`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {getTypeIcon(plan.type)}
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">{plan.type}</Badge>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {plan.title}
                              {isExecuted && <Badge className="bg-success text-white">Em Execução</Badge>}
                            </CardTitle>
                          </div>
                        </div>
                        {index === 0 && !isExecuted && (
                          <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Recomendado
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-3 bg-slate-50 rounded border">
                          <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Impacto
                          </span>
                          <p className="font-semibold text-slate-800">{plan.impact}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border">
                          <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Custo Est.
                          </span>
                          <p className="font-semibold text-slate-800">{plan.cost}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border">
                          <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Tempo
                          </span>
                          <p className="font-semibold text-slate-800">{plan.time}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border">
                          <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Viabilidade
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getFeasibilityColor(plan.feasibility)}`}>{plan.feasibility}%</span>
                            <Progress value={plan.feasibility} className="h-1.5 flex-1" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Plano de Ação Sugerido:</h4>
                        <ul className="space-y-2">
                          {plan.steps.map((step, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className={`${isExecuted ? 'bg-success/5' : 'bg-slate-50'} border-t flex justify-end gap-3 p-4`}>
                      <Button variant="outline" disabled={isExecuted}>Ver Detalhes</Button>
                      <Button 
                        className={`gap-2 ${isExecuted ? 'bg-success hover:bg-success cursor-default' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={() => !isExecuted && handleOpenExecutionDialog(plan)}
                        disabled={isExecuted}
                      >
                        {isExecuted ? (
                          <><CheckCircle2 className="h-4 w-4" /> Execução Iniciada</>
                        ) : (
                          <><Zap className="h-4 w-4" /> Iniciar Execução</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Signature Dialog */}
      <Dialog open={executionDialogOpen} onOpenChange={setExecutionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Lock className="h-5 w-5" />
              Autorização de Execução
            </DialogTitle>
            <DialogDescription>
              A execução de planos de contingência exige assinatura digital (ICP-Brasil) do gestor responsável.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {selectedPlan && (
              <div className="p-3 bg-muted/30 rounded border text-sm">
                <span className="font-bold block mb-1">Plano Selecionado:</span>
                {selectedPlan.title}
                <div className="text-xs text-muted-foreground mt-1">
                  Custo: {selectedPlan.cost} • Impacto: {selectedPlan.impact}
                </div>
              </div>
            )}

            {authError && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Erro de Autenticação</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* WebPKI Flow */}
            <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <Usb className="h-4 w-4" />
                        Token A3 / Smartcard
                    </h3>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Icp-brasil.png" alt="ICP-Brasil" className="h-6 opacity-80" />
                </div>

                {sigStep === 'idle' && (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">
                            Conecte seu Token USB para assinar a ordem de execução.
                        </p>
                        <Button type="button" onClick={startSignatureFlow} className="gap-2 bg-slate-800 hover:bg-slate-700">
                            <RefreshCw className="h-4 w-4" />
                            Detectar Certificados
                        </Button>
                    </div>
                )}

                {sigStep === 'detecting' && (
                    <div className="flex flex-col items-center py-6 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Comunicando com WebPKI...</p>
                    </div>
                )}

                {(sigStep === 'selecting' || sigStep === 'signing') && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Certificado Selecionado</label>
                            <Select value={selectedCert} onValueChange={setSelectedCert} disabled={sigStep === 'signing'}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {certificates.map(cert => (
                                        <SelectItem key={cert.thumbprint} value={cert.thumbprint}>
                                            {cert.subjectName} (Val: {new Date(cert.validityEnd).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {sigStep === 'signing' ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-primary font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processando Assinatura no Hardware...
                            </div>
                        ) : (
                            <Button type="button" onClick={performSignature} className="w-full gap-2" disabled={!selectedCert}>
                                <Key className="h-4 w-4" />
                                Assinar Digitalmente
                            </Button>
                        )}
                    </div>
                )}

                {sigStep === 'signed' && signatureData && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 flex items-start gap-3 animate-in zoom-in">
                        <ShieldCheck className="h-8 w-8 text-green-600 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-green-800">Ordem Assinada com Sucesso</h4>
                            <p className="text-xs text-green-700 mt-1">
                                <strong>Certificado:</strong> {signatureData.cert.subjectName}<br/>
                                <strong>Hash:</strong> {signatureData.hash.substring(0, 20)}...
                            </p>
                        </div>
                    </div>
                )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setExecutionDialogOpen(false)}>Cancelar</Button>
            <Button 
                onClick={confirmExecution} 
                disabled={sigStep !== 'signed' || isExecuting}
                className="gap-2"
            >
                {isExecuting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                ) : (
                    <><Zap className="h-4 w-4" /> Autorizar Execução</>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
