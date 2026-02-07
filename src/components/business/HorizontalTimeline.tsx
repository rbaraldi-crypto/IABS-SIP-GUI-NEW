import { useMemo } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  Gavel, 
  ArrowRight,
  Timer
} from "lucide-react";
import { PenalEvent } from '@/data/mockData';

interface HorizontalTimelineProps {
  events: PenalEvent[];
  onEventClick: (event: PenalEvent) => void;
  className?: string;
}

// Helper para parsear datas DD/MM/YYYY
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// Helper para formatar datas
const formatDate = (date: Date) => {
  if (!date) return 'Data inválida';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function HorizontalTimeline({ events, onEventClick, className }: HorizontalTimelineProps) {
  
  // Processamento dos dados para a timeline
  const timelineData = useMemo(() => {
    // Ordenar eventos cronologicamente
    const sortedEvents = [...events].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    if (sortedEvents.length === 0) return { items: [], totalDuration: 0, startDate: new Date(), endDate: new Date() };

    // Definir Início (Data do primeiro evento ou simulado um pouco antes)
    const firstEventDate = parseDate(sortedEvents[0].date);
    const startDate = new Date(firstEventDate);
    startDate.setMonth(startDate.getMonth() - 2); // Recua 2 meses para dar contexto de "Início"

    // Definir Fim (Data do último evento + projeção ou data atual)
    const lastEventDate = parseDate(sortedEvents[sortedEvents.length - 1].date);
    const endDate = new Date(lastEventDate);
    endDate.setFullYear(endDate.getFullYear() + 2); // Projeta 2 anos para frente (Término Previsto)

    const totalDuration = endDate.getTime() - startDate.getTime();

    // Mapear eventos com posição percentual
    const items = sortedEvents.map(event => {
      const eventDate = parseDate(event.date);
      const position = ((eventDate.getTime() - startDate.getTime()) / totalDuration) * 100;
      
      // Determinar ícone e cor baseado no tipo
      let icon = Gavel;
      let colorClass = "bg-primary text-primary-foreground";
      let borderClass = "border-primary";

      if (event.type.includes("Falta") || event.type.includes("Regressão")) {
        icon = AlertTriangle;
        colorClass = "bg-destructive text-destructive-foreground";
        borderClass = "border-destructive";
      } else if (event.type.includes("Progressão") || event.type.includes("Livramento")) {
        icon = ArrowRight;
        colorClass = "bg-success text-success-foreground";
        borderClass = "border-success";
      } else if (event.type.includes("Bom Comportamento")) {
        icon = CheckCircle2;
        colorClass = "bg-blue-500 text-white";
        borderClass = "border-blue-500";
      }

      return {
        ...event,
        position, // 0 a 100
        dateObj: eventDate,
        icon,
        colorClass,
        borderClass
      };
    });

    return { items, startDate, endDate };
  }, [events]);

  return (
    <div className={cn("w-full py-6", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card/50 p-4">
        <div className="relative min-w-[800px] h-[180px] flex items-center px-12">
          
          {/* Linha Base */}
          <div className="absolute left-12 right-12 top-1/2 h-1 bg-muted-foreground/20 -translate-y-1/2 rounded-full" />
          
          {/* Marcador de Início */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-muted-foreground/30 flex items-center justify-center">
              <Flag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Início</span>
              <span className="text-[10px] text-muted-foreground font-mono">{formatDate(timelineData.startDate)}</span>
            </div>
          </div>

          {/* Eventos */}
          <TooltipProvider>
            {timelineData.items.map((item) => (
              <div 
                key={item.id}
                className="absolute top-1/2 -translate-y-1/2 group"
                style={{ left: `calc(${item.position}% + 48px)` }} // Offset inicial
              >
                {/* Linha vertical de conexão */}
                <div className={`absolute left-1/2 -translate-x-1/2 h-8 w-0.5 -top-4 bg-border group-hover:bg-primary transition-colors ${item.position % 2 === 0 ? '-top-4' : 'top-4'}`} />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onEventClick(item)}
                      className={cn(
                        "relative z-20 flex h-10 w-10 items-center justify-center rounded-full border-4 shadow-sm transition-all hover:scale-110 hover:shadow-md",
                        item.colorClass,
                        item.borderClass,
                        "border-background" // Borda branca interna para destaque
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] p-3 text-center">
                    <p className="font-bold text-sm mb-1">{item.type}</p>
                    <p className="text-xs text-muted-foreground mb-2">{formatDate(item.dateObj)}</p>
                    <p className="text-[10px] bg-muted/20 p-1 rounded border">{item.origin}</p>
                    <p className="text-[10px] text-primary mt-2 font-medium">Clique para ver detalhes</p>
                  </TooltipContent>
                </Tooltip>

                {/* Data abaixo/acima do node */}
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-32 text-center transition-all opacity-70 group-hover:opacity-100",
                  item.position % 2 === 0 ? "top-12" : "-top-16" // Alterna posição para evitar sobreposição
                )}>
                  <span className="text-xs font-semibold block truncate">{item.type}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                </div>
              </div>
            ))}
          </TooltipProvider>

          {/* Marcador de Término Previsto */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Término (Prev)</span>
              <span className="text-[10px] text-muted-foreground font-mono">{formatDate(timelineData.endDate)}</span>
            </div>
          </div>

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-success"></div>
            <span>Progressão/Benefício</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive"></div>
            <span>Falta/Regressão</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span>Decisão Judicial</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Administrativo</span>
        </div>
      </div>
    </div>
  );
}
