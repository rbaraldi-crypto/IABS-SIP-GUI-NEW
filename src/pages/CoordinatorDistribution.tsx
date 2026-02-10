import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Briefcase, AlertTriangle, 
  ArrowRight, Download, Filter
} from 'lucide-react';
import { mockDistributionUsers } from '@/data/mockData';

const COLORS = ['#0B3C5D', '#1F7A8C', '#328CC1', '#2E7D32', '#ED6C02', '#C62828'];

// Mock Data for Charts
const workloadData = mockDistributionUsers.map(user => ({
  name: user.name.split(' ')[0],
  cases: user.casesCount,
  capacity: user.maxCases,
  role: user.role
}));

const performanceData = [
  { name: 'Seg', completed: 12, incoming: 15 },
  { name: 'Ter', completed: 18, incoming: 14 },
  { name: 'Qua', completed: 10, incoming: 20 },
  { name: 'Qui', completed: 22, incoming: 18 },
  { name: 'Sex', completed: 15, incoming: 12 },
];

const statusDistribution = [
  { name: 'Em Dia', value: 45 },
  { name: 'Atraso Leve', value: 15 },
  { name: 'Crítico', value: 5 },
];

export function CoordinatorDistribution() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Gestão de Carga de Trabalho</h2>
          <p className="text-muted-foreground">Visão gerencial da produtividade e distribuição da equipe.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Casos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe Disponível</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 / 15</div>
            <p className="text-xs text-muted-foreground">3 analistas em férias/licença</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Sobrecarga</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground">Analistas com carga acima de 90%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Carga de Trabalho por Analista</CardTitle>
            <CardDescription>Comparativo entre casos atribuídos e capacidade máxima.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" name="Casos Atuais" fill="#0B3C5D" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="capacity" name="Capacidade" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status dos Prazos</CardTitle>
            <CardDescription>Saúde geral dos prazos processuais da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtividade Semanal</CardTitle>
            <CardDescription>Fluxo de entrada vs. saída de processos nos últimos 5 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incoming" name="Novos Casos" fill="#328CC1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Concluídos" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2">
          Ir para Distribuição Manual <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
