import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gavel, Loader2, CheckCircle, ShieldAlert, FileInput, ArrowRight, ArrowLeft, Search, BookOpen, AlertCircle, ShieldCheck, Fingerprint, FileText, User, Briefcase, Scale, PenTool, Shield, Siren, Lock } from "lucide-react";
import { mockMyCases } from "@/data/mockData";
import { SmartDecisionEditor } from "@/components/business/SmartDecisionEditor";
import { dynamoService } from "@/services/awsMock";

const formSchema = z.object({
  actionType: z.string({ required_error: "Selecione um tipo de ação." }),
  dispatchText: z.string().min(10, "O texto deve ter no mínimo 10 caracteres."),
  legalObservation: z.string().optional(),
  humanCheck: z.boolean().refine(val => val === true, {
    message: "Você deve confirmar a responsabilidade pela ação.",
  }),
});

type UserRole = "JUIZ" | "ANALISTA" | "PROMOTOR" | "ADVOGADO" | "DEFENSOR" | "POLICIA";

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
  const [lawNotFound, setLawNotFound] = useState(false);

  // Mock Identity Context
  const [mockUserRole, setMockUserRole] = useState<UserRole>("ANALISTA");

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
      humanCheck: false,
    },
  });

  // Watch humanCheck for UX effects
  const isHumanChecked = form.watch("humanCheck");

  // Reset form status when role changes
  useEffect(() => {
    setIsSuccess(false);
    setAuthError(null);
  }, [mockUserRole]);

  const handleVerifyLaw = async () => {
    const term = form.getValues("legalObservation");
    if (!term || term.length < 3) return;

    setIsVerifyingLaw(true);
    setLawSummary(null);
    setLawNotFound(false);

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
    } else if (lowerTerm.includes("52") || lowerTerm.includes("falta")) {
        setLawSummary({
            title: "Lei de Execução Penal - Art. 52",
            content: "A prática de fato previsto como crime doloso constitui falta grave e, quando ocasione subversão da ordem ou disciplina internas, sujeita o preso provisório, ou condenado, ao regime disciplinar diferenciado."
        });
    } else {
        // Random fallback: 70% success generic, 30% not found
        if (Math.random() > 0.3) {
             setLawSummary({
                title: "Legislação Identificada",
                content: `Resumo automático para a norma citada "${term}": Dispositivo legal aplicável ao caso concreto conforme jurisprudência vigente e base de conhecimento do tribunal.`
            });
        } else {
            setLawNotFound(true);
        }
    }
    setIsVerifyingLaw(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null);

    // --- IDENTITY EXTRACTION (Simulation) ---
    console.log(`[Security] Validating Identity. Role: ${mockUserRole}`);
    
    const isJuiz = mockUserRole === "JUIZ";

    try {
        // Atualiza o Mock Data para refletir a alteração na tela anterior
        const currentCase = mockMyCases.find(c => c.id === taskId);
        
        // --- AUDIT LOGGING (DynamoDB) ---
        await dynamoService.putItem({
          CaseId: taskId || "unknown",
          ActionType: isJuiz ? "JUDICIAL_DECISION" : `${mockUserRole}_ACTION`,
          User: mockUserRole.toLowerCase() + ".user",
          Role: mockUserRole,
          Details: `Ação: ${values.actionType}. Observação Legal: ${values.legalObservation || 'N/A'}`,
          Timestamp: new Date().toISOString()
        });

        if (isJuiz) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (currentCase) {
                currentCase.status = "Julgado / Decisão Proferida";
                currentCase.priority = "Baixa"; // Caso resolvido
            }
            setSuccessMessage("O despacho foi assinado digitalmente e a decisão registrada.");
            setIsSuccess(true);
        } else if (mockUserRole === "POLICIA") {
             // --- FLUXO DE POLÍCIA ---
             await new Promise(resolve => setTimeout(resolve, 1000));
             if (currentCase) {
                 if (values.actionType === 'registro_ocorrencia') {
                    currentCase.status = "Suspenso (Falta Grave)";
                    currentCase.priority = "Alta"; // Prioridade para o Juiz analisar a falta
                 } else {
                    currentCase.status = "Diligência Policial Cumprida";
                 }
             }
             setSuccessMessage("Ocorrência registrada no sistema prisional e notificação enviada ao Juízo da Execução.");
             setIsSuccess(true);
        } else if (mockUserRole === "PROMOTOR") {
             await new Promise(resolve => setTimeout(resolve, 1000));
             if (currentCase) {
                 currentCase.status = "Com Parecer do MP";
             }
             setSuccessMessage("Parecer Ministerial juntado aos autos com sucesso. O processo segue para decisão.");
             setIsSuccess(true);
        } else if (mockUserRole === "ADVOGADO" || mockUserRole === "DEFENSOR") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (currentCase) {
                currentCase.status = "Petição Juntada";
            }
            setSuccessMessage(mockUserRole === "DEFENSOR" 
                ? "Manifestação da Defensoria protocolada com prerrogativa de prazo em dobro." 
                : "Petição protocolada e recibo gerado. O cartório será notificado.");
            setIsSuccess(true);
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (currentCase) {
                currentCase.status = values.actionType === 'concluso' ? "Concluso para Julgamento" : "Em Análise (HITL)";
            }
            setSuccessMessage("Status processual atualizado. O caso foi encaminhado para a próxima fase.");
            setIsSuccess(true);
        }
    } catch (error) {
        console.error(error);
        setAuthError("Erro ao processar solicitação.");
    } finally {
        setIsLoading(false);
    }
  }

  // Helper para renderizar ícone do papel
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

  // Helper para cor do papel
  const getRoleColorClass = () => {
    switch(mockUserRole) {
        case "JUIZ": return "bg-primary text-primary-foreground";
        case "PROMOTOR": return "bg-destructive text-destructive-foreground"; // Vermelho MP
        case "ADVOGADO": return "bg-slate-800 text-white"; // Escuro OAB
        case "DEFENSOR": return "bg-emerald-600 text-white"; // Verde Defensoria
        case "POLICIA": return "bg-slate-900 text-white"; // Polícia Penal (Dark Slate)
        default: return "bg-secondary text-secondary-foreground";
    }
  };

  // --- BLOCKING LOGIC: Mandatory Case Selection ---
  if (!taskId) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Briefcase className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2 max-w-lg px-4">
                <h2 className="text-3xl font-bold text-primary">Seleção de Caso Necessária</h2>
                <p className="text-muted-foreground text-lg">
                    A Tramitação Processual requer um contexto específico. <br/>
                    Por favor, selecione um processo na sua fila de trabalho para iniciar a análise.
                </p>
            </div>
            <Button onClick={() => navigate('/meus-casos')} size="lg" className="gap-2 text-md px-8 h-12">
                <Search className="h-5 w-5" />
                Ir para Meus Casos
            </Button>
        </div>
    );
  }

  if (!currentCase) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Caso não encontrado</h2>
            <p className="text-muted-foreground">O ID fornecido não corresponde a nenhum processo ativo.</p>
            <Button onClick={() => navigate('/meus-casos')} variant="outline">Voltar para Lista</Button>
        </div>
     );
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
        </div>
        
        <div className="flex gap-4">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Tela Anterior
            </Button>
            <Button onClick={() => setIsSuccess(false)}>
                Nova Ação no Mesmo Processo
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
                    {mockUserRole === 'JUIZ' ? "Decisão Judicial" : 
                     mockUserRole === 'PROMOTOR' ? "Parecer Ministerial" :
                     mockUserRole === 'ADVOGADO' ? "Peticionamento Eletrônico" :
                     mockUserRole === 'DEFENSOR' ? "Manifestação Defensoria" :
                     mockUserRole === 'POLICIA' ? "Ocorrência / Escolta" :
                     "Tramitação Processual"}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                    {mockUserRole === 'JUIZ' ? "Supervisão humana final e assinatura de decisão." : 
                     mockUserRole === 'PROMOTOR' ? "Análise do Ministério Público e emissão de parecer." :
                     mockUserRole === 'ADVOGADO' ? "Protocolo de pedidos e manifestações da defesa." :
                     mockUserRole === 'DEFENSOR' ? "Atuação em prol do assistido hipossuficiente." :
                     mockUserRole === 'POLICIA' ? "Registro de incidentes e logística prisional." :
                     "Análise técnica e atualização de andamento."}
                </p>
                </div>
            </div>
        </div>
        
        {/* Role Switcher for Demo */}
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
      <div className="bg-muted/40 border border-primary/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center animate-in fade-in slide-in-from-top-2 shadow-sm">
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
                  <span className="text-xs opacity-50">|</span>
                  <span className="bg-background px-2 py-0.5 rounded border text-xs">{currentCase.type}</span>
              </div>
          </div>
          <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status Atual</span>
                <Badge variant="secondary" className="font-medium">
                  {currentCase.status}
                </Badge>
          </div>
      </div>

      <Card className={`border-l-4 ${
          mockUserRole === 'JUIZ' ? 'border-l-primary' :
          mockUserRole === 'PROMOTOR' ? 'border-l-destructive' :
          mockUserRole === 'ADVOGADO' ? 'border-l-slate-800' :
          mockUserRole === 'DEFENSOR' ? 'border-l-emerald-600' :
          mockUserRole === 'POLICIA' ? 'border-l-slate-900' :
          'border-l-secondary'
      }`}>
        <CardHeader>
          <CardTitle>
            {mockUserRole === 'JUIZ' ? "Registro de Sentença/Despacho" : 
             mockUserRole === 'PROMOTOR' ? "Manifestação do Ministério Público" :
             mockUserRole === 'ADVOGADO' ? "Nova Petição / Requerimento" :
             mockUserRole === 'DEFENSOR' ? "Peticionamento Defensoria" :
             mockUserRole === 'POLICIA' ? "Boletim de Ocorrência / Logística" :
             "Parecer Técnico / Movimentação"}
          </CardTitle>
          <CardDescription>
             Preencha os campos abaixo para formalizar sua ação no processo.
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
                        {mockUserRole === 'JUIZ' ? (
                            <>
                                <SelectItem value="concessao">Concessão de Benefício</SelectItem>
                                <SelectItem value="negacao">Negação de Pedido</SelectItem>
                                <SelectItem value="arquivamento">Arquivamento</SelectItem>
                                <SelectItem value="diligencia">Solicitar Diligência</SelectItem>
                            </>
                        ) : mockUserRole === 'PROMOTOR' ? (
                            <>
                                <SelectItem value="parecer_favoravel">Parecer Favorável</SelectItem>
                                <SelectItem value="parecer_contrario">Parecer Contrário</SelectItem>
                                <SelectItem value="cota_ministerial">Cota (Solicitar Diligência)</SelectItem>
                                <SelectItem value="ciencia">Ciência de Decisão</SelectItem>
                            </>
                        ) : (mockUserRole === 'ADVOGADO' || mockUserRole === 'DEFENSOR') ? (
                            <>
                                <SelectItem value="pedido_progressao">Pedido de Progressão</SelectItem>
                                <SelectItem value="juntada_documento">Juntada de Documento</SelectItem>
                                <SelectItem value="alegacoes_finais">Alegações Finais</SelectItem>
                                <SelectItem value="habeas_corpus">Habeas Corpus</SelectItem>
                            </>
                        ) : mockUserRole === 'POLICIA' ? (
                            <>
                                <SelectItem value="registro_ocorrencia">Registrar Falta Disciplinar (Grave/Média)</SelectItem>
                                <SelectItem value="confirmacao_escolta">Confirmar Agendamento de Escolta</SelectItem>
                                <SelectItem value="captura">Comunicar Recaptura / Prisão</SelectItem>
                                <SelectItem value="atestado_conduta">Emitir Atestado de Conduta</SelectItem>
                            </>
                        ) : (
                            <>
                                <SelectItem value="parecer_favoravel">Parecer Favorável</SelectItem>
                                <SelectItem value="parecer_desfavoravel">Parecer Desfavorável</SelectItem>
                                <SelectItem value="solicitar_documentos">Solicitar Documentos</SelectItem>
                                <SelectItem value="concluso">Remeter para Conclusão</SelectItem>
                            </>
                        )}
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
                    <FormLabel>
                        {mockUserRole === 'JUIZ' ? "Texto da Decisão" : 
                         (mockUserRole === 'ADVOGADO' || mockUserRole === 'DEFENSOR') ? "Teor da Petição" :
                         mockUserRole === 'POLICIA' ? "Relatório da Ocorrência" :
                         "Conteúdo da Manifestação"}
                    </FormLabel>
                    <FormControl>
                      {/* SmartDecisionEditor adaptado para todos os roles */}
                      <SmartDecisionEditor 
                        initialValue={field.value}
                        onChange={field.onChange}
                        userRole={mockUserRole as any}
                        caseContext={{
                            inmateName: currentCase.inmateName,
                            type: currentCase.type,
                            status: currentCase.status
                        }}
                        documents={currentCase.documents} // Passa documentos para o RAG
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
                    <FormLabel>Referência Legal / Súmula</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="Ex: Art. 112 da LEP" {...field} />
                        </FormControl>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleVerifyLaw}
                            disabled={isVerifyingLaw || !field.value}
                            title="Verificar existência da lei"
                            className="shrink-0"
                        >
                            {isVerifyingLaw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Verificar</span>
                        </Button>
                    </div>
                    
                    {/* Law Summary Display */}
                    {lawSummary && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md border border-primary/20 text-sm animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                                <BookOpen className="h-4 w-4" />
                                {lawSummary.title}
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                                {lawSummary.content}
                            </p>
                        </div>
                    )}
                    
                    {lawNotFound && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded-md border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
                            <AlertCircle className="h-4 w-4" />
                            Norma não encontrada na base de conhecimento ou indisponível.
                        </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="humanCheck"
                render={({ field }) => (
                  <FormItem 
                    className={`
                        flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 transition-all duration-300
                        ${field.value 
                            ? "bg-success/10 border-success/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                            : "bg-muted/20 border-border"
                        }
                    `}
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={field.value ? "data-[state=checked]:bg-success data-[state=checked]:border-success" : ""}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none flex-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className={`font-bold transition-colors ${field.value ? "text-success" : ""}`}>
                            Confirmação de Autoria
                        </FormLabel>
                        {field.value && (
                            <div className="flex items-center gap-1 text-xs font-bold text-success animate-in fade-in slide-in-from-right-2">
                                <ShieldCheck className="h-3 w-3" />
                                Assinatura Digital Pronta
                            </div>
                        )}
                      </div>
                      <FormDescription className={field.value ? "text-success/80" : ""}>
                        {mockUserRole === 'JUIZ' ? "Declaro que revisei as sugestões da IA e assumo a autoria desta decisão." :
                         mockUserRole === 'PROMOTOR' ? "Confirmo o teor deste parecer ministerial." :
                         mockUserRole === 'ADVOGADO' ? "Responsabilizo-me pelo teor desta petição e documentos anexos." :
                         mockUserRole === 'DEFENSOR' ? "Certifico a atuação em defesa do assistido." :
                         mockUserRole === 'POLICIA' ? "Certifico a veracidade da ocorrência e anexo provas materiais." :
                         "Declaro que as informações prestadas são verdadeiras."}
                      </FormDescription>
                      
                      {field.value && (
                        <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in">
                            <Fingerprint className="h-3 w-3" />
                            <span>Identidade vinculada: <strong>
                                {mockUserRole === 'JUIZ' ? 'Juiz Dr. Silva' : 
                                 mockUserRole === 'PROMOTOR' ? 'Promotor Dr. Souza' :
                                 mockUserRole === 'ADVOGADO' ? 'Adv. Dr. Carlos' :
                                 mockUserRole === 'DEFENSOR' ? 'Defensor Público Dr. André' :
                                 mockUserRole === 'POLICIA' ? 'Policial Penal Inspetor Gomes' :
                                 'Analista Ana Paula'}
                            </strong></span>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 gap-3">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading || !isHumanChecked} 
                    className={`
                        w-full md:w-auto gap-2 transition-all duration-300
                        ${isHumanChecked ? "shadow-lg scale-105" : "opacity-70 grayscale"}
                        ${mockUserRole === 'PROMOTOR' ? 'bg-destructive hover:bg-destructive/90' : 
                          mockUserRole === 'ADVOGADO' ? 'bg-slate-800 hover:bg-slate-700' : 
                          mockUserRole === 'DEFENSOR' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                          mockUserRole === 'POLICIA' ? 'bg-slate-900 hover:bg-slate-800' : ''}
                    `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    mockUserRole === 'JUIZ' ? <><Gavel className="h-4 w-4" /> Assinar e Decidir</> :
                    mockUserRole === 'PROMOTOR' ? <><Scale className="h-4 w-4" /> Assinar Parecer</> :
                    mockUserRole === 'ADVOGADO' ? <><PenTool className="h-4 w-4" /> Protocolar</> :
                    mockUserRole === 'DEFENSOR' ? <><Shield className="h-4 w-4" /> Protocolar (DP)</> :
                    mockUserRole === 'POLICIA' ? <><Lock className="h-4 w-4" /> Registrar Ocorrência</> :
                    <><ArrowRight className="h-4 w-4" /> Atualizar Status</>
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
