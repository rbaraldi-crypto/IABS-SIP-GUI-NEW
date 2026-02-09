import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockMetrics } from "@/data/mockData";
import { Users, AlertTriangle, Clock, UserCheck, ArrowRight, LayoutGrid, BarChart3, PiggyBank, Tablet, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const iconMap: Record<string, any> = {
  Users,
  AlertTriangle,
  Clock,
  UserCheck
};

const statusData = [
  { name: 'Online', value: 2, color: '#16a34a' }, // success
  { name: 'Latência', value: 1, color: '#ea580c' }, // warning
  { name: 'Offline', value: 0, color: '#dc2626' }, // destructive
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard Operacional</h2>
          <p className="text-muted-foreground mt-2">Visão geral do sistema e alertas prioritários.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
            onClick={() => navigate('/estatisticas')}
          >
            <BarChart3 className="h-4 w-4" />
            Estatísticas Avançadas
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
            onClick={() => navigate('/distribuicao')}
          >
            <LayoutGrid className="h-4 w-4" />
            Configuração / Distribuição
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Card de ROI - Destaque de Vendas */}
        <Card 
          className="border-l-4 border-l-green-600 bg-green-50/30 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => navigate('/estatisticas', { state: { defaultTab: 'roi' } })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-green-800 uppercase tracking-wider">
              Economia (ROI)
            </CardTitle>
            <PiggyBank className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">R$ 450k</div>
            <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
              Ver detalhamento <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Card de Inteligência de Vínculos (NOVO) */}
        <Card 
          className="border-l-4 border-l-purple-600 bg-purple-50/30 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => navigate('/estatisticas', { state: { defaultTab: 'links' } })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-purple-800 uppercase tracking-wider">
              Inteligência (P2)
            </CardTitle>
            <Network className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">Vínculos</div>
            <p className="text-xs text-purple-600 mt-1 font-medium flex items-center gap-1">
              Análise de Rede <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {/* Card de Modo Tático */}
        <Card 
          className="border-l-4 border-l-blue-600 bg-blue-50/30 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => navigate('/estatisticas', { state: { defaultTab: 'heatmap', tacticalMode: true } })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-wider">
              Operação Tática
            </CardTitle>
            <Tablet className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">Modo Pátio</div>
            <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
              Conferência (Tablet) <ArrowRight className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        {mockMetrics.slice(0, 2).map((metric, index) => {
          const Icon = metric.icon ? iconMap[metric.icon] : Users;
          const isCritical = metric.status === 'critical';
          
          return (
            <Card 
              key={index} 
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                isCritical ? "border-l-destructive hover:bg-destructive/5" : 
                metric.status === 'warning' ? "border-l-warning" : "border-l-primary"
              )}
              onClick={() => isCritical ? navigate('/compliance') : null}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className={cn("h-4 w-4", 
                  isCritical ? "text-destructive" : 
                  metric.status === 'warning' ? "text-warning" : "text-primary"
                )} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {isCritical && (
                  <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                    Ação imediata <ArrowRight className="h-3 w-3" />
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente (Status Geral)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#000' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Integração TJ</span>
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-semibold">Online</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Serviço Biométrico (ABIS)</span>
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-semibold">Online</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Motor de Regras (SIP)</span>
                    <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-semibold">Latência Alta</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
