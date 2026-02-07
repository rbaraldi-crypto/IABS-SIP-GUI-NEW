import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Info, CheckSquare, ExternalLink, Link as LinkIcon, Loader2, WifiOff, SearchX, UserPlus, CalendarClock, CheckCircle2 } from "lucide-react";
import { mockSubordinates, SubordinateUser } from "@/data/mockData";

export function Compliance() {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Estados para a busca de legislação
  const [isLoadingLegislation, setIsLoadingLegislation] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Estados para Delegação
  const [isDelegating, setIsDelegating] = useState(false);
  const [delegationStep, setDelegationStep] = useState<'loading' | 'select' | 'confirm'>('loading');
  const [selectedSubordinate, setSelectedSubordinate] = useState<SubordinateUser | null>(null);
  
  // Estado do Alerta Principal (Simulando refresh/remoção após ação)
  const [mainAlertStatus, setMainAlertStatus] = useState<'active' | 'delegated'>('active');

  // Dados da Regra (Extraídos para uso na lógica)
  const ruleData = {
    rule: "LEP Art. 112 - Progressão de Regime (16%)",
    base: "10/01/2024",
    searchQuery: "Lei de Execução Penal Artigo 112 Planalto"
  };

  // Alertas com rotas de navegação definidas
  const activeAlerts = [
    { 
      id: 1, 
      title: 'Documentação Pendente', 
      desc: 'Falta laudo criminológico atualizado para análise de progressão.', 
      link: '/meus-casos/case-rev-001', 
      priority: 'high'
    },
    { 
      id: 2, 
      title: 'Inconsistência de Dados', 
      desc: 'Data de prisão conflitante com registro do BNMP.', 
      link: '/acao-humana/task-bnmp-sync', 
      priority: 'medium'
    },
    { 
      id: 3, 
      title: 'Prazo de Recurso', 
      desc: 'Vencimento de prazo para MP em 2 dias.', 
      link: '/meus-casos/case-rev-002', 
      priority: 'high'
    }
  ];

  const handleConsultLegislation = async () => {
    setIsLoadingLegislation(true);
    setShowErrorDialog(false);

    // Simulação de busca na internet / banco de dados de leis
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 70% de chance de sucesso, 30% de chance de erro
    const isSuccess = Math.random() > 0.3;

    if (isSuccess) {
        window.open("https://www.planalto.gov.br/ccivil_03/leis/l7210.htm#art112", "_blank");
    } else {
        setShowErrorDialog(true);
    }

    setIsLoadingLegislation(false);
  };

  const handleOpenDelegation = () => {
    setIsDelegating(true);
    setDelegationStep('loading');
    setSelectedSubordinate(null);

    // Simula carregamento de analistas disponíveis
    setTimeout(() => {
      setDelegationStep('select');
    }, 1000);
  };

  const handleConfirmDelegation = () => {
    // Simula a ação de delegar e "refrescar" a tela
    setIsDelegating(false);
    
    // Atualiza o estado do alerta principal para refletir que foi tratado
    setMainAlertStatus('delegated');
    
    // Reseta seleção
    setSelectedSubordinate(null);
  };

  return (
    <div className="space-y-6">
      {mainAlertStatus === 'active' ? (
        <Alert variant="destructive" className="border-l-4 border-l-destructive bg-destructive/5 text-destructive-foreground shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold ml-2">POSSÍVEL ILEGALIDADE DETECTADA</AlertTitle>
          <AlertDescription className="ml-2 mt-1 text-destructive/90">
            Benefício vencido não concedido (Base legal: Art. 112 LEP). O sistema identificou que o requisito temporal foi atingido há 15 dias sem movimentação processual.
          </AlertDescription>
          <div className="flex gap-3 mt-4 ml-2">
            <Button 
              variant="outline" 
              className="bg-white text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setShowExplanation(true)}
            >
              <Info className="mr-2 h-4 w-4" /> Ver explicação
            </Button>
            <Button 
              variant="default" 
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleOpenDelegation}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Encaminhar / Delegar
            </Button>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
              <CheckSquare className="mr-2 h-4 w-4" /> Registrar ciência
            </Button>
          </div>
        </Alert>
      ) : (
        <Alert className="bg-success/10 border-success/20 text-success-foreground animate-in fade-in zoom-in duration-300">
             <CheckCircle2 className="h-5 w-5 text-success" />
             <AlertTitle className="ml-2 font-bold text-success">Alerta Delegado com Sucesso</AlertTitle>
             <AlertDescription className="ml-2 text-success/80">
                A tarefa foi encaminhada para a fila do analista responsável. A tela foi atualizada.
                <Button variant="link" className="p-0 h-auto ml-2 text-success underline font-semibold" onClick={() => setMainAlertStatus('active')}>Desfazer</Button>
             </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200 group cursor-pointer hover:shadow-sm hover:border-primary/30"
                  onClick={() => navigate(alert.link)}
                >
                  <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${alert.priority === 'high' ? 'bg-destructive' : 'bg-warning'}`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.desc}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0" title="Ir para origem">
                    <LinkIcon className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Histórico de Resoluções</CardTitle>
          </CardHeader>
          <CardContent>
            {mainAlertStatus === 'delegated' ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 animate-in fade-in">
                    <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                        <button 
                            onClick={handleConsultLegislation}
                            disabled={isLoadingLegislation}
                            className="text-sm font-medium hover:underline text-primary flex items-center gap-1 group"
                            title="Clique para consultar a legislação"
                        >
                            Ilegalidade Art. 112 LEP
                            {isLoadingLegislation ? (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            ) : (
                                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                        <p className="text-xs text-muted-foreground">Delegado há instantes</p>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                Nenhuma resolução registrada nos últimos 7 dias.
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Explicação do Alerta */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Info className="h-5 w-5" />
              Explicação do Alerta: Benefício Vencido
            </DialogTitle>
            <DialogDescription>
              Detalhamento do cálculo e base legal utilizada pelo motor de regras.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded border">
                <span className="text-xs font-bold text-muted-foreground uppercase">Regra Aplicada</span>
                <p className="font-medium mt-1">{ruleData.rule}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded border">
                <span className="text-xs font-bold text-muted-foreground uppercase">Data Base</span>
                <p className="font-medium mt-1">{ruleData.base}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-primary">Fórmula de Cálculo</h4>
              <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`Requisito_Temporal = Pena_Total * 0.16
Data_Vencimento = Data_Base + Requisito_Temporal
Status = (Data_Atual > Data_Vencimento) ? "VENCIDO" : "EM_PRAZO"`}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-primary">Dados Processados</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Pena Total: 5 anos e 4 meses</li>
                <li>Fração: 1/6 (Primário, sem violência)</li>
                <li>Tempo Cumprido: 1 ano e 2 meses</li>
                <li>Dias Remidos: 32</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={handleConsultLegislation}
                disabled={isLoadingLegislation}
              >
                {isLoadingLegislation ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                    </>
                ) : (
                    <>
                        <ExternalLink className="h-4 w-4" /> Consultar Legislação
                    </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Erro de Acesso */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="border-destructive/50 sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                    <WifiOff className="h-5 w-5" />
                    Erro de Acesso à Legislação
                </DialogTitle>
                <DialogDescription>
                    Não foi possível conectar ao repositório jurídico externo.
                </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <SearchX className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <p className="font-medium text-foreground">
                        Norma não encontrada ou indisponível
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        A busca automática por <strong>"{ruleData.rule}"</strong> falhou. O servidor de destino pode estar offline ou o link foi alterado.
                    </p>
                </div>
            </div>

            <DialogFooter className="sm:justify-center gap-2">
                <Button variant="ghost" onClick={() => setShowErrorDialog(false)}>
                    Cancelar
                </Button>
                <Button 
                    variant="destructive" 
                    onClick={handleConsultLegislation}
                    className="gap-2"
                >
                    <Loader2 className={`h-4 w-4 ${isLoadingLegislation ? 'animate-spin' : 'hidden'}`} />
                    Tentar Novamente
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Delegação (Novo) */}
      <Dialog open={isDelegating} onOpenChange={setIsDelegating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delegar Resolução do Alerta</DialogTitle>
            <DialogDescription>
              Atribuir a análise da ilegalidade (Art. 112 LEP) a um subordinado.
            </DialogDescription>
          </DialogHeader>

          {delegationStep === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando analistas disponíveis...</p>
            </div>
          )}

          {delegationStep === 'select' && (
            <div className="space-y-4 py-4">
                <div className="space-y-3">
                    <span className="text-sm font-medium">Equipe Disponível:</span>
                    <div className="grid gap-2">
                        {mockSubordinates.map(user => (
                            <div 
                                key={user.id}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                    ${selectedSubordinate?.id === user.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}
                                `}
                                onClick={() => setSelectedSubordinate(user)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">{user.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground block mb-1">Carga</span>
                                    <Progress value={user.workload} className="w-16 h-1.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {delegationStep === 'confirm' && selectedSubordinate && (
             <div className="py-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold">Confirmar Atribuição?</h4>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        O alerta será movido para a fila de <strong>{selectedSubordinate.name}</strong> com prioridade Alta.
                    </p>
                </div>
             </div>
          )}

          <DialogFooter>
            {delegationStep === 'select' && (
                <>
                    <Button variant="ghost" onClick={() => setIsDelegating(false)}>Cancelar</Button>
                    <Button 
                        onClick={() => setDelegationStep('confirm')} 
                        disabled={!selectedSubordinate}
                    >
                        Continuar
                    </Button>
                </>
            )}
            {delegationStep === 'confirm' && (
                <>
                    <Button variant="outline" onClick={() => setDelegationStep('select')}>Voltar</Button>
                    <Button onClick={handleConfirmDelegation}>Confirmar Delegação</Button>
                </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
