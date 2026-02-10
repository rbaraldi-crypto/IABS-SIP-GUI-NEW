import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Gavel, Loader2, CheckCircle, ShieldAlert, FileInput, ArrowRight, ArrowLeft, 
  Search, BookOpen, ShieldCheck, FileText, User, 
  Briefcase, Scale, Shield, Siren, Usb, RefreshCw, Key
} from "lucide-react";
import { mockMyCases } from "@/data/mockData";
import { SmartDecisionEditor } from "@/components/business/SmartDecisionEditor";
import { dynamoService } from "@/services/awsMock";
import { webPkiService, Certificate } from "@/services/webpkiMock";

const formSchema = z.object({
  actionType: z.string({ required_error: "Selecione um tipo de ação." }),
  dispatchText: z.string().min(10, "O texto deve ter no mínimo 10 caracteres."),
  legalObservation: z.string().optional(),
  // humanCheck agora é controlado pelo fluxo de assinatura
  signatureHash: z.string().optional(),
});

type UserRole = "JUIZ" | "ANALISTA" | "PROMOTOR" | "ADVOGADO" | "DEFENSOR" | "POLICIA";
type SignatureStep = 'idle' | 'detecting' | 'selecting' | 'signing' | 'signed';

export function HITL() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Law Verification State
  const [isVerifyingLaw, setIsVerifyingLaw] = useState(false);
  const [lawSummary, setLawSummary] = useState<{title: string, content: string} | null>(null);

  // Mock Identity Context
  const [mockUserRole, setMockUserRole] = useState<UserRole>("ANALISTA");

  // WebPKI / Signature State
  const [sigStep, setSigStep] = useState<SignatureStep>('idle');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<string>("");
  const [signatureData, setSignatureData] = useState<{hash: string, cert: Certificate} | null>(null);

  // Recupera o caso atual com base no ID da URL
  const currentCase = mockMyCases.find(c => c.id === taskId);

  // Tenta recuperar o role passado via navegação (se houver)
  useEffect(() => {
    if (location.state?.role) {
      setMockUserRole(location.state.role);
    }
  }, [location.state]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dispatchText: "",
      legalObservation: "",
    },
  });

  // Reset form status when role changes
  useEffect(() => {
    setIsSuccess(false);
    setAuthError(null);
    setSigStep('idle');
    setSignatureData(null);
    setCertificates([]);
  }, [mockUserRole]);

  const handleVerifyLaw = async () => {
    const term = form.getValues("legalObservation");
    if (!term || term.length < 3) return;

    setIsVerifyingLaw(true);
    setLawSummary(null);

    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Logic for Law Verification
    const lowerTerm = term.toLowerCase();
    
    if (lowerTerm.includes("112") || lowerTerm.includes("lep")) {
        setLawSummary({
            title: "Lei de Execução Penal - Art. 112",
            content: "A pena privativa de liberdade será executada em forma progressiva com a transferência para regime menos rigoroso, a ser determinada pelo juiz, quando o preso tiver cumprido ao menos: I - 16% (dezesseis por cento) da pena, se o apenado for primário e o crime tiver sido cometido sem violência à pessoa..."
        });
    } else if (lowerTerm.includes("súmula") || lowerTerm.includes("sumula")) {
        setLawSummary({
            title: "Súmula Vinculante / STJ",
            content: "Precedente consolidado: É inadmissível a chamada progressão per saltum de regime prisional, mas a inexistência de vaga no regime adequado não pode prejudicar o apenado (Súmula Vinculante 56)."
        });
    } else {
        if (Math.random() > 0.3) {
             setLawSummary({
                title: "Legislação Identificada",
                content: `Resumo automático para a norma citada "${term}": Dispositivo legal aplicável ao caso concreto conforme jurisprudência vigente e base de conhecimento do tribunal.`
            });
        }
    }
    setIsVerifyingLaw(false);
  };

  // --- WebPKI Handlers ---
  const startSignatureFlow = async () => {
    setSigStep('detecting');
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
    if (!selectedCert) return;
    setSigStep('signing');
    
    try {
      const certObj = certificates.find(c => c.thumbprint === selectedCert);
      if (!certObj) throw new Error("Certificado inválido");

      const dataToSign = form.getValues("dispatchText") || "Conteúdo Vazio";
      const hash = await webPkiService.signData(selectedCert, dataToSign);
      
      setSignatureData({ hash, cert: certObj });
      form.setValue("signatureHash", hash);
      setSigStep('signed');
    } catch (e) {
      setAuthError("Falha na operação criptográfica. Senha do Token incorreta ou bloqueada.");
      setSigStep('selecting');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validar se foi assinado
    if (!signatureData) {
        setAuthError("A assinatura digital com Token ICP-Brasil é obrigatória.");
        return;
    }

    setIsLoading(true);
    setAuthError(null);
    const isJuiz = mockUserRole === "JUIZ";

    try {
        const currentCase = mockMyCases.find(c => c.id === taskId);
        
        await dynamoService.putItem({
          CaseId: taskId || "unknown",
          ActionType: isJuiz ? "JUDICIAL_DECISION_SIGNED" : `${mockUserRole}_ACTION_SIGNED`,
          User: mockUserRole.toLowerCase() + ".user",
          Role: mockUserRole,
          Details: `Ação: ${values.actionType}. Hash ICP: ${signatureData.hash}`,
          Timestamp: new Date().toISOString()
        });

        // Simulações de sucesso baseadas no Role (mantido da versão anterior)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isJuiz) {
            if (currentCase) {
                currentCase.status = "Julgado / Decisão Proferida";
                currentCase.priority = "Baixa";
            }
            setSuccessMessage("Decisão assinada digitalmente e registrada no Blockchain do TJ.");
        } else {
            if (currentCase) {
                currentCase.status = "Movimentação Assinada";
            }
            setSuccessMessage("Documento assinado e protocolado com sucesso.");
        }
        setIsSuccess(true);

    } catch (error) {
        console.error(error);
        setAuthError("Erro ao processar solicitação.");
    } finally {
        setIsLoading(false);
    }
  }

  const getRoleIcon = () => {
    switch(mockUserRole) {
        case "JUIZ": return <Gavel className="h-6 w-6" />;
        case "PROMOTOR": return <Scale className="h-6 w-6" />;
        case "ADVOGADO": return <Briefcase className="h-6 w-6" />;
        case "DEFENSOR": return <Shield className="h-6 w-6" />;
        case "POLICIA": return <Siren className="h-6 w-6" />;
        default: return <FileInput className="h-6 w-6" />;
    }
  };

  const getRoleColorClass = () => {
    switch(mockUserRole) {
        case "JUIZ": return "bg-primary text-primary-foreground";
        case "PROMOTOR": return "bg-destructive text-destructive-foreground";
        case "ADVOGADO": return "bg-slate-800 text-white";
        case "DEFENSOR": return "bg-emerald-600 text-white";
        case "POLICIA": return "bg-slate-900 text-white";
        default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (!taskId || !currentCase) {
    return <div>Caso não encontrado</div>;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">
                Ação Registrada com Sucesso
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
            {successMessage}
            </p>
            {signatureData && (
                <div className="mt-4 p-3 bg-muted/30 rounded border text-xs font-mono text-muted-foreground break-all max-w-lg">
                    <strong>Hash ICP-Brasil:</strong> {signatureData.hash}
                </div>
            )}
        </div>
        
        <div className="flex gap-4">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>
            <Button onClick={() => setIsSuccess(false)}>
                Nova Ação
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Voltar">
                <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-primary" />
            </Button>
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg shadow-sm ${getRoleColorClass()}`}>
                    {getRoleIcon()}
                </div>
                <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                    {mockUserRole === 'JUIZ' ? "Decisão Judicial" : "Tramitação Processual"}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                    Assinatura Digital ICP-Brasil
                </p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded border border-dashed border-muted-foreground/30 self-start md:self-center">
            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">Simular Role:</span>
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
      </div>

      {authError && (
        <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {/* Case Context Header */}
      <div className="bg-muted/40 border border-primary/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center shadow-sm">
          <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                  <FileText className="h-5 w-5" />
                  <span className="font-mono font-bold text-lg tracking-tight">{currentCase.caseNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-foreground/80">{currentCase.inmateName}</span>
                  </div>
              </div>
          </div>
          <Badge variant="secondary" className="font-medium">
            {currentCase.status}
          </Badge>
      </div>

      <Card className={`border-l-4 ${
          mockUserRole === 'JUIZ' ? 'border-l-primary' :
          mockUserRole === 'PROMOTOR' ? 'border-l-destructive' :
          'border-l-secondary'
      }`}>
        <CardHeader>
          <CardTitle>Formalização da Ação</CardTitle>
          <CardDescription>
             Preencha e assine digitalmente com seu Token A3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a ação..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="concessao">Concessão de Benefício</SelectItem>
                        <SelectItem value="negacao">Negação de Pedido</SelectItem>
                        <SelectItem value="diligencia">Solicitar Diligência</SelectItem>
                        <SelectItem value="parecer">Emitir Parecer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dispatchText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teor do Documento</FormLabel>
                    <FormControl>
                      <SmartDecisionEditor 
                        initialValue={field.value}
                        onChange={field.onChange}
                        userRole={mockUserRole as any}
                        caseContext={{
                            inmateName: currentCase.inmateName,
                            type: currentCase.type,
                            status: currentCase.status
                        }}
                        documents={currentCase.documents}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalObservation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência Legal</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="Ex: Art. 112 da LEP" {...field} />
                        </FormControl>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleVerifyLaw}
                            disabled={isVerifyingLaw || !field.value}
                        >
                            {isVerifyingLaw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                    {lawSummary && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md border border-primary/20 text-sm">
                            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                                <BookOpen className="h-4 w-4" />
                                {lawSummary.title}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {lawSummary.content}
                            </p>
                        </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* WebPKI Signature Section */}
              <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <Usb className="h-4 w-4" />
                        Assinatura Digital (Token A3)
                    </h3>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Icp-brasil.png" alt="ICP-Brasil" className="h-6 opacity-80" />
                </div>

                {sigStep === 'idle' && (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">
                            Conecte seu Token USB ou Smartcard para assinar este documento.
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
                            <h4 className="text-sm font-bold text-green-800">Documento Assinado com Sucesso</h4>
                            <p className="text-xs text-green-700 mt-1">
                                <strong>Certificado:</strong> {signatureData.cert.subjectName}<br/>
                                <strong>CPF:</strong> {signatureData.cert.pkiBrazil.cpf}<br/>
                                <strong>Carimbo de Tempo:</strong> {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
              </div>

              <div className="flex justify-end pt-2 gap-3">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading || sigStep !== 'signed'} 
                    className="gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Protocolando...</>
                  ) : (
                    <><ArrowRight className="h-4 w-4" /> Finalizar Protocolo</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
