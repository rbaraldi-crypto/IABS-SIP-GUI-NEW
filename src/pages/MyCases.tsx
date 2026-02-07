import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockMyCases, mockSubordinates, MyCase, SubordinateUser } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Briefcase, Search, Filter, UserPlus, CalendarClock, 
  Loader2, ArrowDown, ArrowUp, ArrowUpDown, BellRing, Mail, Phone, 
  Plus, Trash2, Save, UserCog 
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface local para contatos de notificação
interface NotificationContact {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

export function MyCases() {
  const [filterText, setFilterText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Local state to manage cases to simulate updates without backend
  const [cases, setCases] = useState<MyCase[]>(mockMyCases);

  // Delegation Modal State
  const [isDelegating, setIsDelegating] = useState(false);
  const [selectedCaseForDelegation, setSelectedCaseForDelegation] = useState<MyCase | null>(null);
  const [delegationStep, setDelegationStep] = useState<'loading' | 'select' | 'confirm'>('loading');
  const [selectedSubordinate, setSelectedSubordinate] = useState<SubordinateUser | null>(null);

  // Priority Change Modal State
  const [priorityDialog, setPriorityDialog] = useState<{ isOpen: boolean; case: MyCase | null }>({
    isOpen: false,
    case: null
  });

  // Notification Settings Modal State
  const [notificationDialog, setNotificationDialog] = useState<{ isOpen: boolean; case: MyCase | null }>({
    isOpen: false,
    case: null
  });
  
  // Mock contacts state (simulando dados vindos do backend para o caso selecionado)
  const [contacts, setContacts] = useState<NotificationContact[]>([
    { id: 1, name: "Dr. Carlos Mendes", role: "Advogado de Defesa", email: "carlos.mendes@adv.oab.br", phone: "(11) 99999-1234", active: true },
    { id: 2, name: "Vara de Execuções", role: "Cartório Judicial", email: "vara.exec@tjsp.jus.br", phone: "", active: true }
  ]);
  
  const [newContact, setNewContact] = useState({ name: '', role: 'Advogado', email: '', phone: '' });

  const filteredCases = cases.filter(item => {
    const matchesText = item.inmateName.toLowerCase().includes(filterText.toLowerCase()) || 
                        item.caseNumber.includes(filterText);
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesText && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
      case 'Média': return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'Baixa': return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'Delegado': return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // --- Delegation Handlers ---

  const handleOpenDelegation = (caseItem: MyCase) => {
    setSelectedCaseForDelegation(caseItem);
    setIsDelegating(true);
    setDelegationStep('loading');
    setSelectedSubordinate(null);

    setTimeout(() => {
      setDelegationStep('select');
    }, 1500);
  };

  const handleConfirmDelegation = () => {
    if (!selectedCaseForDelegation || !selectedSubordinate) return;

    const now = new Date();
    const estimated = new Date();
    estimated.setDate(now.getDate() + 2); // +2 days

    const updatedCases = cases.map(c => {
      if (c.id === selectedCaseForDelegation.id) {
        return {
          ...c,
          priority: 'Delegado' as const,
          delegatedTo: selectedSubordinate,
          delegatedAt: now.toLocaleString('pt-BR'),
          estimatedCompletion: estimated.toLocaleDateString('pt-BR'),
          status: `Atribuído a ${selectedSubordinate.name}`
        };
      }
      return c;
    });

    setCases(updatedCases);
    setIsDelegating(false);
    setSelectedCaseForDelegation(null);
  };

  // --- Priority Change Handlers ---

  const handlePriorityClick = (caseItem: MyCase) => {
    if (caseItem.priority === 'Delegado') return;
    setPriorityDialog({ isOpen: true, case: caseItem });
  };

  const handleChangePriority = async (newPriority: 'Alta' | 'Média' | 'Baixa') => {
    if (!priorityDialog.case) return;
    const updatedCases = cases.map(c => 
      c.id === priorityDialog.case!.id ? { ...c, priority: newPriority } : c
    );
    setCases(updatedCases);
    setPriorityDialog({ isOpen: false, case: null });
  };

  // --- Notification Handlers ---

  const handleOpenNotifications = (caseItem: MyCase) => {
    setNotificationDialog({ isOpen: true, case: caseItem });
    // Aqui você faria um fetch para pegar os contatos reais desse caso
  };

  const handleAddContact = () => {
    if (!newContact.name || (!newContact.email && !newContact.phone)) return;
    
    const newId = Math.max(...contacts.map(c => c.id), 0) + 1;
    setContacts([...contacts, { ...newContact, id: newId, active: true }]);
    setNewContact({ name: '', role: 'Advogado', email: '', phone: '' });
  };

  const handleRemoveContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSaveNotifications = () => {
    // Simulação de salvamento para o motor Python
    console.log(`[SIP Engine] Atualizando lista de transmissão para o caso ${notificationDialog.case?.id}:`, contacts);
    setNotificationDialog({ isOpen: false, case: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-primary">Meus Casos</h2>
          <p className="text-muted-foreground">Gerencie sua fila de trabalho e prioridades.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Fila de Processos</CardTitle>
              <CardDescription>Lista de casos aguardando análise judicial.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome ou processo..." 
                  className="pl-8"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Delegado">Delegado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Prioridade</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Apenado</TableHead>
                <TableHead>Tipo de Ação</TableHead>
                <TableHead>Entrada / Delegação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length > 0 ? (
                filteredCases.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <div className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${getPriorityColor(item.priority)} 
                            ${item.priority !== 'Delegado' ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary/20 transition-all select-none' : 'opacity-80 cursor-not-allowed'}
                          `}
                          onClick={() => handlePriorityClick(item)}
                          title={item.priority !== 'Delegado' ? "Clique para alterar a prioridade" : "Prioridade fixa"}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/meus-casos/${item.id}`}
                        className="font-mono text-xs font-medium text-primary hover:underline hover:text-primary/80 flex items-center gap-1"
                      >
                        {item.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{item.inmateName}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                        {item.priority === 'Delegado' ? (
                            <div className="flex flex-col">
                                <span className="font-medium text-purple-700">{item.delegatedAt?.split(' ')[0]}</span>
                                <span className="text-[10px]">Prev: {item.estimatedCompletion}</span>
                            </div>
                        ) : (
                            item.entryDate
                        )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.priority === 'Delegado' ? 'bg-purple-500' : 'bg-primary/40'}`}></span>
                        <span className="text-sm truncate max-w-[150px]" title={item.status}>{item.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleOpenNotifications(item)}
                          title="Configurar Alertas (SMS/Email)"
                        >
                          <BellRing className="h-4 w-4" />
                        </Button>
                        
                        {item.priority !== 'Delegado' ? (
                          <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 gap-2 shadow-sm transition-all hover:bg-primary hover:text-white"
                              onClick={() => handleOpenDelegation(item)}
                          >
                              <UserPlus className="h-3 w-3" />
                              Delegar
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="h-8 opacity-50">
                              Delegado
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum caso encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delegation Modal */}
      <Dialog open={isDelegating} onOpenChange={setIsDelegating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delegar Tarefa</DialogTitle>
            <DialogDescription>
              Atribuir o processo {selectedCaseForDelegation?.caseNumber} a um subordinado.
            </DialogDescription>
          </DialogHeader>
          {/* ... (Conteúdo do modal de delegação mantido igual) ... */}
          {delegationStep === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Tentando atribuição automática...</p>
            </div>
          )}
          {delegationStep === 'select' && (
            <div className="space-y-4 py-4">
                <div className="space-y-3">
                    <span className="text-sm font-medium">Subordinados Disponíveis:</span>
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
                    <h4 className="text-lg font-semibold">Confirmar Delegação?</h4>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        O caso será adjudicado para <strong>{selectedSubordinate.name}</strong>.
                    </p>
                </div>
             </div>
          )}
          <DialogFooter>
            {delegationStep === 'select' && (
                <Button onClick={() => setDelegationStep('confirm')} disabled={!selectedSubordinate}>Continuar</Button>
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

      {/* Notification Settings Modal */}
      <Dialog open={notificationDialog.isOpen} onOpenChange={(open) => !open && setNotificationDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <BellRing className="h-5 w-5" />
              Configuração de Alertas (SIP Engine)
            </DialogTitle>
            <DialogDescription>
              Cadastre contatos para receber notificações automáticas via SMS/Email sobre andamentos e alertas críticos deste caso.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Add New Contact Form */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <UserCog className="h-4 w-4" />
                Novo Contato
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Nome</Label>
                  <Input 
                    id="name" 
                    placeholder="Nome do contato" 
                    className="h-8"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role" className="text-xs">Papel / Função</Label>
                  <Select 
                    value={newContact.role} 
                    onValueChange={(val) => setNewContact({...newContact, role: val})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Advogado">Advogado</SelectItem>
                      <SelectItem value="Defensor">Defensor Público</SelectItem>
                      <SelectItem value="Juiz">Juiz</SelectItem>
                      <SelectItem value="Promotor">Promotor</SelectItem>
                      <SelectItem value="Parte">Parte / Familiar</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="email@exemplo.com" 
                    className="h-8"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">Telefone (SMS)</Label>
                  <Input 
                    id="phone" 
                    placeholder="(00) 00000-0000" 
                    className="h-8"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full gap-2" 
                onClick={handleAddContact}
                disabled={!newContact.name || (!newContact.email && !newContact.phone)}
              >
                <Plus className="h-4 w-4" /> Adicionar à Lista de Transmissão
              </Button>
            </div>

            <Separator />

            {/* List of Contacts */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Contatos Cadastrados ({contacts.length})</h4>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{contact.name}</span>
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">{contact.role}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:text-destructive/10"
                        onClick={() => handleRemoveContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md">
                      Nenhum contato configurado para este caso.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNotifications} className="gap-2">
              <Save className="h-4 w-4" /> Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Change Modal */}
      <Dialog open={priorityDialog.isOpen} onOpenChange={(open) => !open && setPriorityDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-primary" />
                    Alterar Prioridade
                </DialogTitle>
                <DialogDescription>
                    Ajuste a prioridade deste caso na fila de trabalho.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                {/* ... (Conteúdo do modal de prioridade mantido igual) ... */}
                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between" onClick={() => handleChangePriority('Alta')}>
                        <span>Alta</span><ArrowUp className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between" onClick={() => handleChangePriority('Média')}>
                        <span>Média</span><ArrowUpDown className="h-4 w-4 text-warning" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between" onClick={() => handleChangePriority('Baixa')}>
                        <span>Baixa</span><ArrowDown className="h-4 w-4 text-success" />
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
