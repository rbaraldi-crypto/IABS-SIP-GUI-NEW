import { mockDistributionUsers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, AlertTriangle, TrendingUp, Download } from 'lucide-react';

export function CoordinatorDistribution() {
  const workloadData = mockDistributionUsers.map(u => ({
    name: u.name.split(' ')[0],
    completed: Math.floor(Math.random() * 20) + 5,
    pending: u.casesCount,
    role: u.role
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Gestão de Equipe</h2>
          <p className="text-muted-foreground">Painel do Coordenador para balanceamento de carga.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Relatório</Button>
            <Button>Redistribuir Cargas</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total na Equipe</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockDistributionUsers.length}</div>
                <p className="text-xs text-muted-foreground">Analistas ativos</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {mockDistributionUsers.reduce((acc, u) => acc + u.casesCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Em análise técnica</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sobrecarga</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">
                    {mockDistributionUsers.filter(u => u.workload > 80).length}
                </div>
                <p className="text-xs text-muted-foreground">Analistas acima de 80%</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-success">+12%</div>
                <p className="text-xs text-muted-foreground">Em relação à semana anterior</p>
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
            <CardHeader>
                <CardTitle>Carga de Trabalho por Analista</CardTitle>
                <CardDescription>Comparativo entre processos pendentes e concluídos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workloadData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="pending" name="Pendentes" stackId="a" fill="#0B3C5D" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="completed" name="Concluídos" stackId="a" fill="#1F7A8C" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
