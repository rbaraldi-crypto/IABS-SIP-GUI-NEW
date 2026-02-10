import { GovHeader } from "@/components/layout/GovHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Eye } from "lucide-react";

const complianceData = [
  { unit: 'Unidade A', compliance: 95, alerts: 2 },
  { unit: 'Unidade B', compliance: 82, alerts: 12 },
  { unit: 'Unidade C', compliance: 60, alerts: 25 },
  { unit: 'Unidade D', compliance: 98, alerts: 0 },
];

export function ControlRoom() {
  return (
    <div className="space-y-6">
      <GovHeader 
        title="Painel de Controle e Transparência" 
        description="Módulo de auditoria para Corregedoria e Órgãos de Controle. Monitoramento em tempo real de conformidade legal e eficiência processual."
        breadcrumbs={[
          { label: "Visão Geral", href: "/dashboard" },
          { label: "Controle & Auditoria" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Índice Geral de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">87.5%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas de Ilegalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">23</div>
            <p className="text-xs text-muted-foreground mt-1">Benefícios vencidos não apreciados</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gargalo Processual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">14 dias</div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio de espera na fila "Análise"</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Automação IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">42%</div>
            <p className="text-xs text-muted-foreground mt-1">Decisões com minuta assistida</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList>
          <TabsTrigger value="compliance">Compliance por Unidade</TabsTrigger>
          <TabsTrigger value="audit">Trilha de Auditoria Global</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Conformidade (LEP)</CardTitle>
              <CardDescription>Comparativo de unidades prisionais quanto ao cumprimento de prazos legais.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="unit" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliance" name="Conformidade (%)" fill="#0B3C5D" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="alerts" name="Alertas Críticos" fill="#C62828" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" /> Logs de Acesso Sensível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Acesso a Processo Sigiloso</p>
                        <p className="text-xs text-muted-foreground">Usuário: juiz.silva | IP: 192.168.1.{i+10}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">10/06/2024 14:3{i}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
