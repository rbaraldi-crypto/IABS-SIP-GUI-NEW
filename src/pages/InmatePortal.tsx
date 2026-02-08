import { useState } from "react";
import { mockInmate } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, BookOpen, Hammer, GraduationCap, Star, 
  TrendingUp, Clock, Target, ShieldCheck, Medal, 
  CalendarCheck, ChevronRight, Lock, Info
} from "lucide-react";

export function InmatePortal() {
  // Mock Data específico para Gamificação
  const gamificationData = {
    score: 850,
    level: "Ressocialização Avançada",
    nextLevelScore: 1000,
    remission: {
      booksRead: 2,
      booksTarget: 3, // A cada 3 livros = X dias (exemplo simplificado)
      workHours: 140,
      workTarget: 160, // A cada 3 dias de trabalho = 1 dia de pena
      studyHours: 40,
      studyTarget: 100
    },
    achievements: [
      { id: 1, title: "Leitor Voraz", desc: "Leu 5 livros no ano", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100" },
      { id: 2, title: "Mão na Massa", desc: "30 dias de trabalho ininterrupto", icon: Hammer, color: "text-orange-500", bg: "bg-orange-100" },
      { id: 3, title: "Conduta Exemplar", desc: "6 meses sem faltas disciplinares", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-100" }
    ],
    missions: [
      { id: 1, title: "Projeto Leitura", target: "Ler 'Dom Casmurro'", reward: "4 dias de remição", progress: 60, icon: BookOpen },
      { id: 2, title: "Curso Profissionalizante", target: "Finalizar Módulo de Elétrica", reward: "Certificado + Pontos", progress: 85, icon: GraduationCap }
    ]
  };

  const scorePercentage = (gamificationData.score / 1000) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Kiosk Header */}
      <header className="bg-[#0B3C5D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-4 border-white/20 overflow-hidden bg-white">
               <img src={mockInmate.photoUrl} alt="Foto" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mockInmate.name}</h1>
              <div className="flex items-center gap-2 opacity-90">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {mockInmate.id}
                </Badge>
                <span className="text-sm">Pavilhão B - Cela 14</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm opacity-70 uppercase tracking-wider">Seu Score Atual</p>
            <div className="text-4xl font-bold flex items-center justify-end gap-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              {gamificationData.score}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8 -mt-8">
        
        {/* Score Card Principal */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
                {/* Circular Progress Mock (SVG) */}
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <circle 
                    className="text-[#0B3C5D] transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={`${251.2 * (scorePercentage/100)} 251.2`} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-[#0B3C5D]">{gamificationData.score}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Pontos</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    Nível: {gamificationData.level}
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </h2>
                  <p className="text-muted-foreground">
                    Você está indo muito bem! Mantenha o bom comportamento para desbloquear benefícios de progressão.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Evolução</span>
                    <p className="font-bold text-blue-700">+50 pts</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <ShieldCheck className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Conduta</span>
                    <p className="font-bold text-green-700">Ótima</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <Target className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Meta</span>
                    <p className="font-bold text-purple-700">1000 pts</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missões e Remição */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Coluna da Esquerda: Remição Ativa */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#0B3C5D]" />
              Painel de Remição (Redução de Pena)
            </h3>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Leitura</h4>
                      <p className="text-sm text-muted-foreground">Remição por Livro Lido</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600">Em Andamento</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Livros lidos este mês: {gamificationData.remission.booksRead}</span>
                    <span className="text-blue-600">Meta: {gamificationData.remission.booksTarget}</span>
                  </div>
                  <Progress value={(gamificationData.remission.booksRead / gamificationData.remission.booksTarget) * 100} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    Falta <strong>1 livro</strong> para remir <strong>4 dias</strong> de pena.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <Hammer className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Trabalho</h4>
                      <p className="text-sm text-muted-foreground">Oficina de Marcenaria</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-600">Ativo</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Horas trabalhadas: {gamificationData.remission.workHours}h</span>
                    <span className="text-orange-600">Meta Ciclo: {gamificationData.remission.workTarget}h</span>
                  </div>
                  <Progress value={(gamificationData.remission.workHours / gamificationData.remission.workTarget) * 100} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Cada 3 dias trabalhados (6h-8h) = 1 dia a menos de pena.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: Conquistas e Missões */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Medal className="h-6 w-6 text-[#0B3C5D]" />
              Conquistas & Missões
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {gamificationData.missions.map((mission) => (
                <Card key={mission.id} className="bg-gradient-to-r from-slate-50 to-white border-dashed border-2">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-white shadow-sm rounded-full border">
                      <mission.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{mission.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{mission.target}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={mission.progress} className="h-2 flex-1" />
                        <span className="text-xs font-bold">{mission.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
                         {mission.reward}
                       </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h4 className="text-sm font-bold text-muted-foreground uppercase mb-4">Galeria de Medalhas</h4>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {gamificationData.achievements.map((ach) => (
                  <div key={ach.id} className="flex flex-col items-center text-center min-w-[100px] p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`h-12 w-12 rounded-full ${ach.bg} flex items-center justify-center mb-2 shadow-sm`}>
                      <ach.icon className={`h-6 w-6 ${ach.color}`} />
                    </div>
                    <span className="text-xs font-bold leading-tight">{ach.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">{ach.desc}</span>
                  </div>
                ))}
                
                {/* Locked Achievement */}
                <div className="flex flex-col items-center text-center min-w-[100px] p-2 opacity-50 grayscale">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 border-2 border-dashed border-slate-300">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold leading-tight">???</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Bloqueado</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Informativo */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold">Como funciona o Score?</p>
            <p>
              Seu score é calculado com base na sua conduta, participação em atividades de trabalho/estudo e ausência de faltas. 
              Um score alto pode acelerar a análise de benefícios como progressão de regime e saídas temporárias.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
