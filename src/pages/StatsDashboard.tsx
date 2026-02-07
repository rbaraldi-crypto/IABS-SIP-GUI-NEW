import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  ArrowLeft, Filter, AlertTriangle, CheckCircle2, 
  Clock, Users, BrainCircuit, FileDown, Loader2,
  LayoutDashboard, CalendarRange, TrendingUp, Search, ArrowRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Mock Data ---

const summaryData = {
  total: 1847,
  pending: 214,
  completionRate: 92,
  criticalDelays: 47
};

const COLORS = {
  primary: '#0B3C5D',
  secondary: '#1F7A8C',
  accent: '#328CC1',
  success: '#2E7D32',
  warning: '#ED6C02',
  danger: '#C62828',
  muted: '#94a3b8'
};

const statusData = [
  { name: 'Aguardando Distribuição', value: 214, color: COLORS.warning },
  { name: 'Em Análise/Audiência', value: 682, color: COLORS.secondary },
  { name: 'Em Cumprimento', value: 748, color: COLORS.primary },
  { name: 'Progressão Solicitada', value: 153, color: COLORS.success },
  { name: 'Extinção/Soltura', value: 38, color: COLORS.accent },
  { name: 'Arquivado', value: 32, color: COLORS.muted },
];

const evolutionData = [
  { month: 'Jan', novos: 120, concluidos: 100 },
  { month: 'Fev', novos: 132, concluidos: 110 },
  { month: 'Mar', novos: 101, concluidos: 120 },
  { month: 'Abr', novos: 134, concluidos: 140 },
  { month: 'Mai', novos: 90, concluidos: 115 },
  { month: 'Jun', novos: 230, concluidos: 180 },
];

const staffData = [
  { id: 1, name: 'Dra. Ana Silva', role: 'Juiz da Execução', avatar: 'AS', load: 18, maxLoad: 25, completed: 42, delayRate: 8, critical: 3, avgTime: 14 },
  { id: 2, name: 'Roberto Mendes', role: 'Analista Penal', avatar: 'RM', load: 22, maxLoad: 30, completed: 56, delayRate: 12, critical: 0, avgTime: 8 },
  { id: 3, name: 'Carla Dias', role: 'Psicóloga', avatar: 'CD', load: 12, maxLoad: 15, completed: 28, delayRate: 5, critical: 1, avgTime: 21 },
  { id: 4, name: 'Marcos Rocha', role: 'Assistente Social', avatar: 'MR', load: 19, maxLoad: 20, completed: 35, delayRate: 2, critical: 0, avgTime: 10 },
  { id: 5, name: 'Dr. Paulo Koerich', role: 'Coordenador', avatar: 'PK', load: 5, maxLoad: 10, completed: 12, delayRate: 0, critical: 0, avgTime: 5 },
];

const initialLogs = [
  "Iniciando módulo de estatísticas avançadas...",
  "Conectando ao Data Warehouse Judiciário...",
  "Sincronização de 1.847 registros concluída.",
  "Caso #47291 – Extinção de Pena homologada por Juiz Silva",
  "Alerta de latência detectado no nó de processamento de imagem (ABIS).",
];

export function StatsDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [selectedSlice, setSelectedSlice] = useState<any | null>(null);
  const [filterText, setFilterText] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        `Caso #${Math.floor(Math.random() * 90000) + 10000} atribuído a ${staffData[Math.floor(Math.random() * staffData.length)].name}`,
        `Atualização de status: Processo ${Math.floor(Math.random() * 90000) + 10000} -> Em Análise`,
        `IA Sugestiva: Padrão de deferimento identificado em lote de processos`,
        `Sincronizando dados com BNMP... OK`
      ];
      const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
      setLogs(prev => [randomLog, ...prev].slice(0, 6));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredStaff = staffData.filter(staff => {
    const matchesText = staff.name.toLowerCase().includes(filterText.toLowerCase()) || staff.role.toLowerCase().includes(filterText.toLowerCase());
    const matchesCritical = criticalOnly ? staff.critical > 0 : true;
    return matchesText && matchesCritical;
  });

  const generatePDF = async () => {
    if (!statsRef.current) return;
    
    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(statsRef.current, {
        scale: 2,
        backgroundColor: '#F5F7FA',
        useCORS: true,
        logging: false,
        ignoreElements: (element) => element.classList.contains('no-print')
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" ref={statsRef}>
      
      <header className="border-b bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="no-print">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              Estatísticas & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão consolidada de produtividade e fluxo processual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarRange className="h-4 w-4" /> Últimos 30 dias
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Todas Unidades
            </Button>
          </div>
          
          <Button 
            variant="outline"
            className="gap-2 no-print"
            onClick={generatePDF}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Exportar PDF
          </Button>

          <Button className="gap-2 no-print bg-primary hover:bg-primary/90">
            <BrainCircuit className="h-4 w-4" />
            Atualizar Dados (IA)
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard 
            title="Casos em Execução" 
            value={summaryData.total.toLocaleString()} 
            icon={<Users className="h-5 w-5 text-primary" />}
            trend="+2.5% este mês"
          />
          <SummaryCard 
            title="Pendentes Distribuição" 
            value={summaryData.pending.toLocaleString()} 
            icon={<Clock className="h-5 w-5 text-warning" />}
            className="border-l-4 border-l-warning cursor-pointer hover:bg-warning/5"
            onClick={() => navigate('/coordenador')}
            actionLabel="Gerenciar Fila"
          />
          <SummaryCard 
            title="Taxa de Conclusão" 
            value={`${summaryData.completionRate}%`} 
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            trend="+1.2% vs média"
          />
          <SummaryCard 
            title="Atrasos Críticos" 
            value={summaryData.criticalDelays.toLocaleString()} 
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            className="border-l-4 border-l-destructive bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors group"
            valueClassName="text-destructive"
            onClick={() => navigate('/compliance')}
            actionLabel="Resolver em Compliance"
            showArrow
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">Distribuição por Status Processual</CardTitle>
                <CardDescription>Volume atual de processos em cada fase da execução.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data) => setSelectedSlice(data)}
                        cursor="pointer"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b' }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução Mensal
                </CardTitle>
                <CardDescription>Comparativo entre novos casos e casos concluídos/arquivados.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                      <Line name="Novos Casos" type="monotone" dataKey="novos" stroke={COLORS.secondary} strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                      <Line name="Concluídos" type="monotone" dataKey="concluidos" stroke={COLORS.primary} strokeWidth={2} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-primary">Produtividade da Equipe</CardTitle>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-muted-foreground">Apenas Críticos</span>
                     <div 
                      className={`w-9 h-5 rounded-full cursor-pointer transition-colors p-0.5 ${criticalOnly ? 'bg-destructive' : 'bg-slate-200'}`}
                      onClick={() => setCriticalOnly(!criticalOnly)}
                     >
                       <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${criticalOnly ? 'translate-x-4' : ''}`} />
                     </div>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar por nome ou cargo..." 
                    className="pl-8"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[600px]">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="group relative bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${staff.id}`} />
                          <AvatarFallback className="bg-primary/10 text-primary">{staff.avatar}</AvatarFallback>
                        </Avatar>
                        {staff.critical > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{staff.name}</h4>
                            <span className="text-xs text-muted-foreground">{staff.role}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground block">Carga</span>
                            <div className="text-sm font-bold text-primary">
                              {staff.load}<span className="text-muted-foreground font-normal">/{staff.maxLoad}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                          <div className="text-center">
                            <span className="text-[10px] text-muted-foreground uppercase block">Concluídos</span>
                            <span className="text-sm font-bold text-success">{staff.completed}</span>
                          </div>
                          <div className="text-center border-l">
                            <span className="text-[10px] text-muted-foreground uppercase block">Atraso</span>
                            <span className={`text-sm font-bold ${staff.delayRate > 10 ? 'text-destructive' : 'text-foreground'}`}>
                              {staff.delayRate}%
                            </span>
                          </div>
                          <div className="text-center border-l">
                            <span className="text-[10px] text-muted-foreground uppercase block">T. Médio</span>
                            <span className="text-sm font-bold text-foreground">{staff.avgTime}d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t px-8 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-2 font-semibold text-primary">
            <LayoutDashboard className="h-3 w-3" />
            Log de Atividades do Sistema
        </div>
        <div className="space-y-1 font-mono bg-muted/30 p-3 rounded border max-h-24 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-primary/70">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </footer>

      <Dialog open={!!selectedSlice} onOpenChange={() => setSelectedSlice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedSlice?.color }} />
              {selectedSlice?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">Detalhamento dos {selectedSlice?.value} casos nesta categoria.</p>
            <div className="space-y-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-3 bg-muted/20 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-foreground">Processo 000{Math.floor(Math.random()*9000)}-24.2024</div>
                    <div className="text-xs text-muted-foreground">Apenado: João da Silva {i+1}</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">Ver Detalhes</Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="secondary">
              Ver Lista Completa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ title, value, icon, trend, className, valueClassName, onClick, actionLabel, showArrow }: any) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon}
        </div>
        <div className={cn("text-3xl font-bold tracking-tight text-primary", valueClassName)}>
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
            {trend && (
            <p className="text-xs text-muted-foreground">
                {trend}
            </p>
            )}
            {actionLabel && (
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide opacity-80 group-hover:opacity-100 group-hover:underline">
                    {actionLabel}
                    {showArrow && <ArrowRight className="h-3 w-3" />}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
