import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, Calendar, Clock, BookOpen, Hammer, GraduationCap, 
  ArrowRight, Save, RotateCcw, TrendingDown 
} from 'lucide-react';
import { addDays, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SentenceCalculatorProps {
  currentProgressionDate: string; // Formato DD/MM/YYYY
  onSaveSimulation?: (data: any) => void;
}

export function SentenceCalculator({ currentProgressionDate, onSaveSimulation }: SentenceCalculatorProps) {
  // Estados dos Sliders
  const [workDays, setWorkDays] = useState(0);
  const [studyHours, setStudyHours] = useState(0);
  const [booksRead, setBooksRead] = useState(0);

  // Estados Calculados
  const [remissionDays, setRemissionDays] = useState(0);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [originalDateObj, setOriginalDateObj] = useState<Date>(new Date());

  // Inicialização
  useEffect(() => {
    try {
      // Parse da data original (DD/MM/YYYY)
      const [day, month, year] = currentProgressionDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      setOriginalDateObj(date);
      setNewDate(date);
    } catch (e) {
      console.error("Erro ao parsear data", e);
    }
  }, [currentProgressionDate]);

  // Lógica de Cálculo de Remição (LEP)
  useEffect(() => {
    // Trabalho: 1 dia de pena a cada 3 dias trabalhados
    const workRemission = Math.floor(workDays / 3);
    
    // Estudo: 1 dia de pena a cada 12 horas de frequência escolar
    const studyRemission = Math.floor(studyHours / 12);
    
    // Leitura: 4 dias de pena por obra lida (Recomendação CNJ 44/2013)
    const readingRemission = booksRead * 4;

    const totalRemission = workRemission + studyRemission + readingRemission;
    
    setRemissionDays(totalRemission);
    
    // Calcula nova data (subtraindo dias)
    if (originalDateObj) {
      // addDays com valor negativo subtrai
      setNewDate(addDays(originalDateObj, -totalRemission));
    }
  }, [workDays, studyHours, booksRead, originalDateObj]);

  const handleReset = () => {
    setWorkDays(0);
    setStudyHours(0);
    setBooksRead(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Painel de Resultados (Topo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data Atual Prevista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <span className="text-2xl font-bold text-slate-700">
                {originalDateObj ? format(originalDateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '--'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Calculator className="h-24 w-24 text-green-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 uppercase tracking-wider flex items-center gap-2">
              Nova Data Projetada
              {remissionDays > 0 && <Badge className="bg-green-600 hover:bg-green-700">-{remissionDays} dias</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {newDate ? format(newDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '--'}
              </span>
            </div>
            {remissionDays > 0 && (
               <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                 <TrendingDown className="h-3 w-3" /> Antecipação da liberdade
               </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Controles Deslizantes (Sliders) */}
      <div className="space-y-8 px-2">
        
        {/* Trabalho */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Dias Trabalhados</h4>
                <p className="text-xs text-muted-foreground">1 dia remido a cada 3 trabalhados</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-600">{workDays}</span>
              <span className="text-xs text-muted-foreground ml-1">dias</span>
            </div>
          </div>
          <Slider 
            value={[workDays]} 
            onValueChange={(val) => setWorkDays(val[0])} 
            max={365} 
            step={1} 
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0</span>
            <span>180</span>
            <span>365 dias</span>
          </div>
        </div>

        {/* Estudo */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Horas de Estudo</h4>
                <p className="text-xs text-muted-foreground">1 dia remido a cada 12 horas</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{studyHours}</span>
              <span className="text-xs text-muted-foreground ml-1">horas</span>
            </div>
          </div>
          <Slider 
            value={[studyHours]} 
            onValueChange={(val) => setStudyHours(val[0])} 
            max={1200} 
            step={12} 
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0</span>
            <span>600</span>
            <span>1200 horas</span>
          </div>
        </div>

        {/* Leitura */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Livros Lidos (Resenha Aprovada)</h4>
                <p className="text-xs text-muted-foreground">4 dias remidos por obra (Max 12/ano)</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-600">{booksRead}</span>
              <span className="text-xs text-muted-foreground ml-1">livros</span>
            </div>
          </div>
          <Slider 
            value={[booksRead]} 
            onValueChange={(val) => setBooksRead(val[0])} 
            max={12} 
            step={1} 
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0</span>
            <span>6</span>
            <span>12 livros</span>
          </div>
        </div>

      </div>

      <Separator />

      {/* Rodapé com Resumo */}
      <div className="bg-slate-100 p-4 rounded-lg border flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-6 text-sm">
            <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Remido</span>
                <span className="font-bold text-lg">{remissionDays} dias</span>
            </div>
            <div className="w-px bg-slate-300 h-10"></div>
            <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Impacto na Pena</span>
                <span className="font-bold text-lg text-green-700">
                    {((remissionDays / (365 * 5)) * 100).toFixed(1)}%
                </span>
            </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none gap-2">
                <RotateCcw className="h-4 w-4" /> Limpar
            </Button>
            <Button 
                className="flex-1 md:flex-none gap-2 bg-primary hover:bg-primary/90"
                onClick={() => onSaveSimulation && onSaveSimulation({ remissionDays, newDate })}
                disabled={remissionDays === 0}
            >
                <Save className="h-4 w-4" /> Salvar Simulação nos Autos
            </Button>
        </div>
      </div>
    </div>
  );
}
