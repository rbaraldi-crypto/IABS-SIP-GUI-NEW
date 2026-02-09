import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine,
  ComposedChart, Bar, BarChart
} from 'recharts';
import { 
  ArrowLeft, Filter, AlertTriangle, CheckCircle2, 
  Clock, Users, BrainCircuit, FileDown, Loader2,
  LayoutDashboard, CalendarRange, TrendingUp, Search, ArrowRight,
  TrendingDown, ShieldAlert, Zap, Map, DollarSign, PiggyBank, Scale,
  Network
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PrisonHeatmap } from '@/components/business/PrisonHeatmap';
import { LinkAnalysisGraph } from '@/components/business/LinkAnalysisGraph';

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

// Dados Financeiros Mockados
const financialData = [
  { month: 'Jan', custoReal: 4500000, economia: 120000 },
  { month: 'Fev', custoReal: 4480000, economia: 150000 },
  { month: 'Mar', custoReal: 4600000, economia: 180000 },
  { month: 'Abr', custoReal: 4550000, economia: 210000 },
  { month: 'Mai', custoReal: 4400000, economia: 290000 },
  { month: 'Jun', custoReal: 4250000, economia: 450000 }, // Salto devido ao uso do sistema
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

// --- Predictive Logic ---
const generatePredictionData = (scenario: 'neutral' | 'high_crime' | 'mass_release') => {
  const data = [];
  const currentMonth = new Date();
  let currentOccupancy = summaryData.total;
  const capacity = 2000; // Capacidade hipotética da unidade
  
  // Fatores de cenário
  let entryFactor = 1.0;
  let exitFactor = 1.0;

  if (scenario === 'high_crime') {
    entryFactor = 1.3; // 30% mais prisões
  } else if (scenario === 'mass_release') {
    exitFactor = 1.5; // 50% mais solturas (mutirão)
  }

  for (let i = 0; i < 24; i++) {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(currentMonth.getMonth() + i);
    
    // Simula saídas baseadas em "estimatedCompletion" (sazonalidade em Dezembro/Indulto)
    const isDecember = monthDate.getMonth() === 11;
    let baseExits = Math.floor(Math.random() * 40) + 30;
    if (isDecember) baseExits += 40; // Indulto Natalino
    
    // Simula entradas
    let baseEntries = Math.floor(Math.random() * 50) + 35;

    const exits = Math.floor(baseExits * exitFactor);
    const entries = Math.floor(baseEntries * entryFactor);
    
    currentOccupancy = Math.max(0, currentOccupancy + entries - exits);
    
    // Calcula risco
    const occupationRate = (currentOccupancy / capacity) * 100;
    let riskLevel = 'Normal';
    if (occupationRate > 120) riskLevel = 'Colapso';
    else if (occupationRate > 100) riskLevel = 'Superlotação';
    else if (occupationRate > 90) riskLevel = 'Alerta';

    data.push({
      month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      occupancy: currentOccupancy,
      capacity: capacity,
      entries,
      exits,
      riskLevel,
      occupationRate: occupationRate.toFixed(1)
    });
  }
  return data;
};

export function StatsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [selectedSlice, setSelectedSlice] = useState<any | null>(null);
  const [filterText, setFilterText] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Predictive State
  const [scenario, setScenario] = useState<'neutral' | 'high_crime' | 'mass_release'>('neutral');
  const [predictionData, setPredictionData] = useState(generatePredictionData('neutral'));

  // Tab State
  const defaultTab = location.state?.defaultTab || 'roi';
  const defaultTacticalMode = location.state?.tacticalMode || false;

  useEffect(() => {
    setPredictionData(generatePredictionData(scenario));
  }, [scenario]);

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

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="roi" className="gap-2">
                <DollarSign className="h-4 w-4" /> Eficiência Financeira (ROI)
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-2">
                <BrainCircuit className="h-4 w-4" /> Inteligência & Predição
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
                <Map className="h-4 w-4" /> Mapa de Calor
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
                <Network className="h-4 w-4" /> Inteligência de Vínculos
            </TabsTrigger>
            <TabsTrigger value="productivity" className="gap-2">
                <TrendingUp className="h-4 w-4" /> Produtividade
            </TabsTrigger>
          </TabsList>

          {/* NOVA ABA: Eficiência Financeira (ROI) */}
          <TabsContent value="roi" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-t-4 border-t-green-600 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <PiggyBank className="h-6 w-6" />
                            Economia Gerada (Redução de Superlotação)
                        </CardTitle>
                        <CardDescription>
                            Impacto financeiro direto da aceleração de progressões de regime e livramentos condicionais.
                            <br/><span className="text-xs text-muted-foreground">*Custo médio mensal por detento estimado em R$ 2.500,00 (Fonte: CNJ)</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(val) => `R$ ${val/1000}k`} />
                                    <RechartsTooltip 
                                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, "Valor"]}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="custoReal" name="Custo Operacional" fill="#94a3b8" radius={[4, 4, 0, 0]} stackId="a" />
                                    <Bar dataKey="economia" name="Economia Gerada (Eficiência)" fill="#16a34a" radius={[4, 4, 0, 0]} stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-green-800">Economia Acumulada (Ano)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-700">R$ 1.4 Mi</div>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                +15% vs ano anterior
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scale className="h-5 w-5 text-primary" />
                                Dias de Pena Remidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">12.450 dias</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Equivalente a <strong>34 anos</strong> de encarceramento evitados através de trabalho e estudo monitorados.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold mb-1 flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Insight de Gestão:
                        </p>
                        <p>
                            A implementação do módulo de <strong>IA para Triagem</strong> reduziu o tempo médio de concessão de benefícios em <strong>42%</strong>, liberando vagas mais rapidamente.
                        </p>
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-purple-600" />
                  Inteligência Penitenciária (Predição de Ocupação)
                </h2>
                <p className="text-sm text-muted-foreground">
                  Projeção de superlotação para os próximos 24 meses baseada em datas de término de pena e tendências de entrada.
                </p>
              </div>
              <div className="flex bg-muted p-1 rounded-lg">
                <Button 
                  variant={scenario === 'neutral' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setScenario('neutral')}
                  className="text-xs"
                >
                  Cenário Neutro
                </Button>
                <Button 
                  variant={scenario === 'high_crime' ? 'destructive' : 'ghost'} 
                  size="sm" 
                  onClick={() => setScenario('high_crime')}
                  className="text-xs gap-1"
                >
                  <TrendingUp className="h-3 w-3" /> Alta Criminalidade
                </Button>
                <Button 
                  variant={scenario === 'mass_release' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setScenario('mass_release')}
                  className={`text-xs gap-1 ${scenario === 'mass_release' ? 'bg-success hover:bg-success/90' : ''}`}
                >
                  <TrendingDown className="h-3 w-3" /> Mutirão de Soltura
                </Button>
              </div>
            </div>

            <Card className="border-t-4 border-t-purple-600 shadow-md">
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any, name: any) => {
                          if (name === 'occupancy') return [value, 'Ocupação Projetada'];
                          if (name === 'capacity') return [value, 'Capacidade Máxima'];
                          return [value, name];
                        }}
                        labelStyle={{ color: COLORS.primary, fontWeight: 'bold' }}
                      />
                      <Legend />
                      
                      {/* Linha de Capacidade */}
                      <ReferenceLine y={2000} label="Capacidade Máxima (2000)" stroke={COLORS.danger} strokeDasharray="3 3" />
                      
                      {/* Área de Ocupação */}
                      <Area 
                        type="monotone" 
                        dataKey="occupancy" 
                        name="Ocupação Projetada" 
                        stroke={COLORS.primary} 
                        fillOpacity={1} 
                        fill="url(#colorOccupancy)" 
                      />
                      
                      {/* Linha de Tendência */}
                      <Line type="monotone" dataKey="occupancy" stroke={COLORS.accent} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-muted/20 rounded-lg border flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">População Atual</p>
                      <p className="text-xl font-bold text-primary">{summaryData.total}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg border flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Projeção 12 Meses</p>
                      <p className="text-xl font-bold text-purple-700">
                        {predictionData[11]?.occupancy} 
                        <span className={`text-xs ml-2 ${predictionData[11]?.occupancy > 2000 ? 'text-destructive' : 'text-success'}`}>
                          ({((predictionData[11]?.occupancy / 2000) * 100).toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg border flex items-center gap-3">
                    <div className={`p-2 rounded-full ${predictionData[23]?.occupancy > 2000 ? 'bg-red-100' : 'bg-green-100'}`}>
                      <ShieldAlert className={`h-5 w-5 ${predictionData[23]?.occupancy > 2000 ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Risco em 24 Meses</p>
                      <p className={`text-xl font-bold ${predictionData[23]?.occupancy > 2000 ? 'text-destructive' : 'text-success'}`}>
                        {predictionData[23]?.riskLevel}
                      </p>
                    </div>
                  </div>
                </div>
                
                {predictionData.some(d => d.occupancy > 2000) && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-destructive">Alerta de Colapso Identificado</h4>
                      <p className="text-xs text-destructive/80">
                        O modelo preditivo indica que a capacidade máxima será excedida em <strong>{predictionData.find(d => d.occupancy > 2000)?.month}</strong>. 
                        Recomenda-se iniciar planejamento de transferências ou mutirão de revisão processual imediatamente.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => navigate('/plano-contingencia')}
                      >
                        <Zap className="h-3 w-3 mr-1" /> Gerar Plano de Contingência
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Map className="h-6 w-6 text-blue-600" />
                        Mapa de Calor de Facções & Risco
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Visualização tática de pavilhões para gestão de alocação e prevenção de conflitos.
                    </p>
                  </div>
              </div>
              <PrisonHeatmap defaultTacticalMode={defaultTacticalMode} />
          </TabsContent>

          {/* NOVA ABA: Análise de Vínculos */}
          <TabsContent value="links" className="space-y-4 animate-in fade-in">
              <LinkAnalysisGraph />
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4 animate-in fade-in">
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
                      Evolução Mensal (Histórico)
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
          </TabsContent>
        </Tabs>
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
