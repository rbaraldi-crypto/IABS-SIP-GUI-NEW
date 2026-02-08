import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, CheckCircle2, Clock, FileText, ShieldCheck, 
  HelpCircle, ChevronRight, Download, Calendar, ExternalLink,
  QrCode, User, MessageSquare, Send, X, Bot, ShoppingBag, AlertCircle
} from "lucide-react";
import { mockInmate, mockTimeline } from "@/data/mockData";
import { HorizontalTimeline } from "@/components/business/HorizontalTimeline";

// --- Chatbot Logic & Data ---
const FAQ_DATA: Record<string, string> = {
  "jumbo": "📦 **Itens permitidos no Jumbo:**\n- 2kg de alimentos não perecíveis\n- 1 kit de higiene (sabonete, pasta, escova)\n- 2 maços de cigarro (se fumante)\n- Roupas brancas ou bege (sem estampas)\n\n🚫 *Proibido:* Latas, vidro, alimentos cozidos e itens de cor preta/azul marinho.",
  "sacola": "📦 **Itens permitidos no Jumbo:**\n- 2kg de alimentos não perecíveis\n- 1 kit de higiene (sabonete, pasta, escova)\n- 2 maços de cigarro (se fumante)\n- Roupas brancas ou bege (sem estampas)\n\n🚫 *Proibido:* Latas, vidro, alimentos cozidos e itens de cor preta/azul marinho.",
  "saidinha": "🗓️ **Próxima Saída Temporária:**\nPrevista para o feriado de **Dia das Crianças (Outubro)**.\n\n⚠️ *Atenção:* Apenas para regime semiaberto com bom comportamento e autorização judicial.",
  "saida": "🗓️ **Próxima Saída Temporária:**\nPrevista para o feriado de **Dia das Crianças (Outubro)**.\n\n⚠️ *Atenção:* Apenas para regime semiaberto com bom comportamento e autorização judicial.",
  "visita": "dias",
  "horario": "dias",
  "dias": "🕒 **Horários de Visita:**\n- Sábados e Domingos: 08:00 às 16:00\n- Entrada permitida até às 10:00\n\nNecessário apresentar a Carteirinha de Visitante (Física ou Digital) e documento com foto.",
  "advogado": "⚖️ **Atendimento Jurídico:**\nAdvogados podem agendar parlatório pelo site da OAB ou presencialmente de Seg a Sex, das 09:00 às 17:00.",
  "default": "Desculpe, não entendi. Tente perguntar sobre: 'Jumbo', 'Saidinha', 'Horários de Visita' ou 'Advogado'.\n\nPara casos complexos, use o botão da Ouvidoria na tela principal."
};

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function CitizenPortal() {
  const [cpf, setCpf] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Olá! Sou o assistente virtual do SAP-SC. Posso tirar dúvidas sobre o que levar na sacola (jumbo), datas de saidinha ou visitas. Como posso ajudar?", sender: 'bot', timestamp: new Date() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // QR Code State
  const [qrCodeValidUntil, setQrCodeValidUntil] = useState<Date | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length > 3) {
      setIsAuthenticated(true);
      // Set initial QR code validity
      const valid = new Date();
      valid.setHours(valid.getHours() + 4);
      setQrCodeValidUntil(valid);
    }
  };

  const openOfficialSite = (url: string) => {
    window.open(url, "_blank");
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now(), text: chatInput, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Bot Logic
    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase();
      let responseText = FAQ_DATA["default"];

      for (const key in FAQ_DATA) {
        if (lowerInput.includes(key) && key !== "default") {
          responseText = FAQ_DATA[key];
          break;
        }
      }

      const botMsg: ChatMessage = { id: Date.now() + 1, text: responseText, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#071D41 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#071D41] text-white mb-4 shadow-xl">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-[#071D41] tracking-tight">Portal do Cidadão</h1>
            <p className="text-muted-foreground">
              Acompanhamento de Execução Penal e Serviços para Familiares
            </p>
          </div>

          <Card className="border-t-4 border-t-[#1351B4] shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Identificação Segura</CardTitle>
              <CardDescription>Informe o CPF para consultar a situação processual e acessar serviços.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#071D41]">CPF do Apenado ou Representante</label>
                  <Input 
                    placeholder="000.000.000-00" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="h-12 text-lg border-slate-300 focus:border-[#1351B4] focus:ring-[#1351B4]"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg bg-[#1351B4] hover:bg-[#071D41] shadow-md transition-all hover:scale-[1.02]">
                  <Search className="mr-2 h-5 w-5" /> Consultar
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-slate-50 text-xs text-muted-foreground justify-center py-3">
              Ambiente Seguro e Monitorado • Governo de Santa Catarina
            </CardFooter>
          </Card>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border hover:shadow-md cursor-pointer transition-all group">
              <HelpCircle className="h-6 w-6 mx-auto text-[#1351B4] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-sm text-[#071D41]">Dúvidas Frequentes</h3>
            </div>
            <div className="p-4 bg-white rounded-lg border hover:shadow-md cursor-pointer transition-all group">
              <Calendar className="h-6 w-6 mx-auto text-[#1351B4] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-sm text-[#071D41]">Agendar Visita</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header Gov.br Style */}
      <header className="bg-[#071D41] text-white py-4 px-6 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold leading-none">Portal do Cidadão</h1>
              <p className="text-[10px] opacity-80 uppercase tracking-wider mt-1">Sistema de Administração Penitenciária</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsAuthenticated(false)}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Status Banner */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-l-green-600 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <h2 className="text-2xl font-bold text-[#071D41] mb-1">Olá, Familiar de {mockInmate.name}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Situação Atual: <strong>Cumprimento Regular de Pena</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="text-lg py-1 px-4 border-[#1351B4] text-[#1351B4] bg-blue-50">
              Regime Semiaberto
            </Badge>
          </div>
        </div>

        {/* Timeline Simplificada */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#071D41] flex items-center gap-2">
            <Clock className="h-5 w-5" /> Linha do Tempo
          </h3>
          <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="pt-6">
              <HorizontalTimeline 
                events={mockTimeline} 
                onEventClick={() => {}} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Serviços e Documentos */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="carteirinha" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
                <TabsTrigger 
                  value="carteirinha" 
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-white data-[state=active]:border-b-white data-[state=active]:shadow-none px-6 py-3 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Carteirinha Digital
                </TabsTrigger>
                <TabsTrigger 
                  value="proximos" 
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-white data-[state=active]:border-b-white data-[state=active]:shadow-none px-6 py-3 gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Próximos Passos
                </TabsTrigger>
                <TabsTrigger 
                  value="documentos" 
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-white data-[state=active]:border-b-white data-[state=active]:shadow-none px-6 py-3 gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Documentos
                </TabsTrigger>
              </TabsList>
              
              {/* ABA: Carteirinha Digital */}
              <TabsContent value="carteirinha" className="p-6 bg-white rounded-b-lg border border-t-0 shadow-sm mt-0">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#071D41] max-w-[280px] w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#071D41]"></div>
                    <div className="text-center mb-4 mt-2">
                        <h4 className="text-[#071D41] font-bold uppercase tracking-widest text-xs">Governo de Santa Catarina</h4>
                        <h3 className="text-lg font-bold mt-1">Visitante Autorizado</h3>
                    </div>
                    
                    <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 mb-4 flex justify-center relative group">
                        {/* QR Code Mock using API */}
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VISITANTE-${mockInmate.id}-${new Date().getDate()}`} 
                            alt="QR Code de Acesso" 
                            className="w-40 h-40 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-40 h-1 bg-red-500/50 animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-[#071D41]">MARIA DA SILVA (MÃE)</p>
                        <p className="text-xs text-muted-foreground">CPF: ***.456.789-**</p>
                        <div className="mt-3 pt-3 border-t border-dashed">
                            <p className="text-[10px] text-muted-foreground uppercase">Válido até</p>
                            <p className="text-sm font-mono font-bold text-green-700">
                                {qrCodeValidUntil?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    {/* Hologram Effect */}
                    <div className="absolute bottom-2 right-2 opacity-20">
                        <ShieldCheck className="h-12 w-12 text-[#071D41]" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#071D41] flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Acesso Liberado
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Apresente este QR Code diretamente na portaria da unidade prisional junto com seu documento oficial com foto (RG ou CNH).
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold flex items-center gap-2 mb-1">
                            <Info className="h-4 w-4" /> Instruções:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                            <li>Aumente o brilho da tela do celular.</li>
                            <li>O código expira automaticamente após 4 horas.</li>
                            <li>Não compartilhe prints desta tela.</li>
                        </ul>
                    </div>

                    <Button className="w-full gap-2 bg-[#071D41] hover:bg-[#1351B4]" onClick={() => window.print()}>
                        <Download className="h-4 w-4" /> Baixar PDF / Imprimir
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="proximos" className="p-6 bg-white rounded-b-lg border border-t-0 shadow-sm mt-0">
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

              <TabsContent value="documentos" className="p-6 bg-white rounded-b-lg border border-t-0 shadow-sm mt-0">
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
            <Card className="bg-[#071D41] text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Precisa de Ajuda?</CardTitle>
                <CardDescription className="text-white/70">Acesse os canais oficiais do Estado de Santa Catarina</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-between hover:bg-white/90 transition-colors text-[#071D41] font-semibold"
                  onClick={() => openOfficialSite("https://www.defensoria.sc.def.br/")}
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Defensoria Pública SC
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-between hover:bg-white/90 transition-colors text-[#071D41] font-semibold"
                  onClick={() => openOfficialSite("https://www.ouvidoria.sc.gov.br/cidadao/")}
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Ouvidoria Penal (SAP)
                  </span>
                  <ChevronRight className="h-4 w-4" />
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

      {/* CHATBOT FLOATING WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
            <Card className="w-[350px] h-[450px] shadow-2xl border-none flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 mb-4 overflow-hidden rounded-2xl">
                <div className="bg-[#071D41] p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Assistente Virtual SAP</h4>
                            <p className="text-[10px] opacity-80 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online Agora
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsChatOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4 bg-slate-50">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`
                                        max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                                        ${msg.sender === 'user' 
                                            ? 'bg-[#1351B4] text-white rounded-tr-none' 
                                            : 'bg-white text-slate-800 border rounded-tl-none'
                                        }
                                    `}
                                >
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                    <div className={`text-[10px] mt-1 opacity-70 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                <div className="p-2 bg-white border-t">
                    {/* Quick Suggestions */}
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => {setChatInput("O que levar no jumbo?"); handleSendMessage({preventDefault:()=>{}} as any);}}>
                                🛍️ Jumbo
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => {setChatInput("Quando é a saidinha?"); handleSendMessage({preventDefault:()=>{}} as any);}}>
                                🗓️ Saidinha
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => {setChatInput("Horário de visita"); handleSendMessage({preventDefault:()=>{}} as any);}}>
                                🕒 Visitas
                            </Badge>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                        <Input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Digite sua dúvida..." 
                            className="rounded-full border-slate-200 focus-visible:ring-[#071D41]"
                        />
                        <Button type="submit" size="icon" className="rounded-full bg-[#071D41] hover:bg-[#1351B4] shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        )}

        <Button 
            size="lg" 
            className="h-14 w-14 rounded-full bg-[#071D41] hover:bg-[#1351B4] shadow-xl flex items-center justify-center transition-transform hover:scale-110"
            onClick={() => setIsChatOpen(!isChatOpen)}
        >
            {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>

    </div>
  );
}
