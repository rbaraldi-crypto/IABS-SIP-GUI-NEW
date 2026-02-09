import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Briefcase, AlertTriangle, CheckCircle2, 
  ArrowRight, Download, Filter
} from 'lucide-react';
import { mockDistributionUsers } from '@/data/mockData';

const workloadData = mockDistributionUsers.map(u => ({
  name: u.name.split(' ')[0],
  atual: u.casesCount,
  capacidade: u.maxCases,
  role: u.role
}));

const statusData = [
  { name: 'Disponível', value: 2, color: '#22c55e' },
  { name: 'Ocupado', value: 1, color: '#eab308' },
  { name: 'Ausente', value: 1, color: '#ef4444' },
];

export function CoordinatorDistribution() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Gestão de Equipe</h2>
          <p className="text-muted-foreground">Visão geral de carga de trabalho e produtividade dos analistas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Analistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDistributionUsers.length}</div>
            <p className="text-xs text-muted-foreground">2 em licença médica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos em Aberto</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">49</div>
            <p className="text-xs text-muted-foreground">-12% em relação à semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Sobrecarga</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">1 analista acima de 90% da capacidade</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Carga de Trabalho por Analista</CardTitle>
            <CardDescription>Comparativo entre casos atuais e capacidade máxima.</CardDescription>
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
                  <Bar dataKey="atual" name="Casos Atuais" fill="#0B3C5D" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="capacidade" name="Capacidade Total" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Disponibilidade da Equipe</CardTitle>
            <CardDescription>Status atual dos colaboradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
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
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDistributionUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${user.status === 'Disponível' ? 'bg-green-500' : user.status === 'Ocupado' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Ocupação</span>
                    <span className="font-bold">{user.workload}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Casos</span>
                    <span className="font-bold">{user.casesCount}/{user.maxCases}</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
