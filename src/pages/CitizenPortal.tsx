import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, CheckCircle2, Clock, FileText, ShieldCheck, 
  HelpCircle, ChevronRight, Download, Calendar 
} from "lucide-react";
import { mockInmate, mockTimeline } from "@/data/mockData";
import { HorizontalTimeline } from "@/components/business/HorizontalTimeline";

export function CitizenPortal() {
  const [cpf, setCpf] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length > 3) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#071D41] text-white mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-[#071D41]">Portal do Cidadão</h1>
            <p className="text-muted-foreground">
              Acompanhamento de Execução Penal e Serviços para Familiares
            </p>
          </div>

          <Card className="border-t-4 border-t-[#1351B4] shadow-lg">
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
              <CardDescription>Informe o CPF para consultar a situação processual.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#071D41]">CPF do Apenado ou Representante</label>
                  <Input 
                    placeholder="000.000.000-00" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg bg-[#1351B4] hover:bg-[#071D41]">
                  <Search className="mr-2 h-5 w-5" /> Consultar
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border hover:shadow-md cursor-pointer transition-all">
              <HelpCircle className="h-6 w-6 mx-auto text-[#1351B4] mb-2" />
              <h3 className="font-semibold text-sm">Dúvidas Frequentes</h3>
            </div>
            <div className="p-4 bg-white rounded-lg border hover:shadow-md cursor-pointer transition-all">
              <Calendar className="h-6 w-6 mx-auto text-[#1351B4] mb-2" />
              <h3 className="font-semibold text-sm">Agendar Visita</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header Gov.br Style */}
      <header className="bg-[#071D41] text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Portal do Cidadão</h1>
              <p className="text-xs opacity-80">Execução Penal Transparente</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsAuthenticated(false)}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Status Banner */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-8 border-l-green-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#071D41] mb-1">Olá, Familiar de {mockInmate.name}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Situação Atual: <strong>Cumprimento Regular de Pena</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="text-lg py-1 px-4 border-[#1351B4] text-[#1351B4]">
              Regime Semiaberto
            </Badge>
          </div>
        </div>

        {/* Timeline Simplificada */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#071D41] flex items-center gap-2">
            <Clock className="h-5 w-5" /> Linha do Tempo
          </h3>
          <Card>
            <CardContent className="pt-6">
              <HorizontalTimeline 
                events={mockTimeline} 
                onEventClick={() => {}} // No click action for citizen for simplicity
              />
            </CardContent>
          </Card>
        </div>

        {/* Serviços e Documentos */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="proximos" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="proximos" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1351B4] data-[state=active]:text-[#1351B4] px-6 py-3"
                >
                  Próximos Passos
                </TabsTrigger>
                <TabsTrigger 
                  value="documentos" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1351B4] data-[state=active]:text-[#1351B4] px-6 py-3"
                >
                  Documentos Disponíveis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="proximos" className="p-6 bg-white rounded-b-lg border border-t-0">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-[#1351B4] flex items-center justify-center shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-[#071D41]">Audiência de Justificação</h4>
                      <p className="text-sm text-muted-foreground mt-1">Agendada para 25/06/2024. O apenado participará por videoconferência.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start opacity-50">
                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="font-bold">Análise de Livramento Condicional</h4>
                      <p className="text-sm text-muted-foreground mt-1">Previsão para Outubro/2024.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="p-6 bg-white rounded-b-lg border border-t-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Atestado de Pena a Cumprir</span>
                    </div>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Certidão Carcerária</span>
                    </div>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#071D41] text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-between">
                  Defensoria Pública <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" className="w-full justify-between">
                  Ouvidoria Penal <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dias de Visita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <span className="block text-2xl font-bold text-green-700">Sábados</span>
                  <span className="text-sm text-green-600">08:00 às 16:00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
