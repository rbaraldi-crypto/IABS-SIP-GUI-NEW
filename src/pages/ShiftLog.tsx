import { useState } from 'react';
import { GovHeader } from "@/components/layout/GovHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardList, Clock, Shield, AlertTriangle, Plus, 
  User, MapPin, Lock, Siren, FileSignature, Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Occurrence {
  id: string;
  time: string;
  type: 'Rotina' | 'Disciplinar' | 'Médico' | 'Segurança' | 'Logística';
  description: string;
  agent: string;
  location: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  attachments?: number;
}

const mockOccurrences: Occurrence[] = [
  {
    id: "occ-001",
    time: "08:15",
    type: "Rotina",
    description: "Confere matinal realizado no Pavilhão A. Contagem confere com o sistema (240 detentos).",
    agent: "Agente Souza",
    location: "Pavilhão A",
    severity: "Baixa"
  },
  {
    id: "occ-002",
    time: "09:30",
    type: "Médico",
    description: "Detento Carlos Eduardo (SIP-8921) encaminhado à enfermaria com queixa de dores abdominais.",
    agent: "Enf. Carla",
    location: "Enfermaria",
    severity: "Média"
  },
  {
    id: "occ-003",
    time: "10:45",
    type: "Logística",
    description: "Entrada do caminhão de abastecimento (Alimentação). Vistoria realizada, nada ilícito encontrado.",
    agent: "Agente Mendes",
    location: "Portaria Principal",
    severity: "Baixa"
  },
  {
    id: "occ-004",
    time: "13:20",
    type: "Disciplinar",
    description: "Princípio de tumulto na Cela 14 durante o banho de sol. Detentos isolados preventivamente. Apreensão de um objeto perfurocortante artesanal (estoque).",
    agent: "Chefe de Plantão Rocha",
    location: "Pátio B",
    severity: "Alta",
    attachments: 2
  }
];

export function ShiftLog() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(mockOccurrences);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [shiftStatus, setShiftStatus] = useState<'open' | 'closed'>('open');
  
  // Form State
  const [newType, setNewType] = useState<string>('Rotina');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<string>('Baixa');

  const handleAddOccurrence = () => {
    const newOcc: Occurrence = {
      id: `occ-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newType as any,
      description: newDesc,
      agent: "Eu (Logado)",
      location: "Posto de Controle",
      severity: newSeverity as any
    };
    
    setOccurrences([newOcc, ...occurrences]);
    setIsNewOpen(false);
    setNewDesc("");
  };

  const handleCloseShift = () => {
    setShiftStatus('closed');
    setIsClosingShift(false);
  };

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'Baixa': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Média': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Alta': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Crítica': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Rotina': return <ClipboardList className="h-4 w-4" />;
      case 'Disciplinar': return <AlertTriangle className="h-4 w-4" />;
      case 'Médico': return <Siren className="h-4 w-4" />;
      case 'Segurança': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <GovHeader 
        title="Livro de Ocorrências Digital" 
        description="Registro oficial de eventos do plantão. Dados auditáveis e imutáveis após o fechamento do turno."
        breadcrumbs={[
          { label: "Visão Geral", href: "/dashboard" },
          { label: "Operacional" },
          { label: "Livro de Plantão" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Shift Info */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                Plantão Atual
                {shiftStatus === 'open' ? (
                  <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">Em Andamento</Badge>
                ) : (
                  <Badge variant="secondary">Fechado</Badge>
                )}
              </CardTitle>
              <CardDescription>Equipe Charlie - 08:00 às 20:00</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src="https://i.pravatar.cc/150?u=chief" />
                  <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">Inspetor Rocha</p>
                  <p className="text-xs text-muted-foreground">Chefe de Plantão</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início:</span>
                  <span className="font-mono">08:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efetivo Presente:</span>
                  <span className="font-bold">12 Agentes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocorrências:</span>
                  <span className="font-bold">{occurrences.length}</span>
                </div>
              </div>

              {shiftStatus === 'open' ? (
                <Button 
                  className="w-full gap-2 bg-slate-800 hover:bg-slate-700"
                  onClick={() => setIsClosingShift(true)}
                >
                  <FileSignature className="h-4 w-4" />
                  Passagem de Plantão (Fechar)
                </Button>
              ) : (
                <div className="p-3 bg-slate-100 rounded text-center text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 mx-auto mb-1" />
                  Plantão encerrado e assinado digitalmente em 20:00.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Filtros Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar no histórico..." className="pl-8" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Disciplinar</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Médico</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Alta Gravidade</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Feed de Eventos
            </h2>
            {shiftStatus === 'open' && (
              <Button onClick={() => setIsNewOpen(true)} className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Registrar Ocorrência
              </Button>
            )}
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 ml-4">
              {occurrences.map((occ) => (
                <div key={occ.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 border-white shadow-sm ${occ.severity === 'Alta' || occ.severity === 'Crítica' ? 'bg-red-500' : 'bg-primary'}`}></div>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono bg-slate-50">
                            {occ.time}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {getTypeIcon(occ.type)} {occ.type}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(occ.severity)}>
                          {occ.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {occ.description}
                      </p>
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {occ.agent}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {occ.location}
                          </span>
                        </div>
                        {occ.attachments && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium cursor-pointer hover:underline">
                            <FileSignature className="h-3 w-3" /> {occ.attachments} Anexos
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Dialog: Nova Ocorrência */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do evento. O registro será carimbado com data e hora atuais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rotina">Rotina</SelectItem>
                    <SelectItem value="Disciplinar">Disciplinar</SelectItem>
                    <SelectItem value="Médico">Médico</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gravidade</label>
                <Select value={newSeverity} onValueChange={setNewSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição Detalhada</label>
              <Textarea 
                placeholder="Descreva o ocorrido..." 
                className="h-32"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddOccurrence} disabled={!newDesc.trim()}>Salvar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Fechar Plantão */}
      <Dialog open={isClosingShift} onOpenChange={setIsClosingShift}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Lock className="h-5 w-5" />
              Encerrar Plantão
            </DialogTitle>
            <DialogDescription>
              Esta ação irá gerar um relatório consolidado e assinado digitalmente. Nenhuma alteração poderá ser feita após o fechamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você tem <strong>1 ocorrência de Alta Gravidade</strong> registrada neste turno. Certifique-se de que o relatório detalhado foi anexado.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações Finais para o Próximo Turno</label>
              <Textarea placeholder="Ex: Atenção redobrada na Ala C..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsClosingShift(false)}>Cancelar</Button>
            <Button onClick={handleCloseShift} className="bg-slate-800 hover:bg-slate-700 gap-2">
              <FileSignature className="h-4 w-4" /> Assinar e Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
