import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { GovHeader } from "@/components/layout/GovHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Calendar, MapPin, User, AlertTriangle, 
  Video, ChevronLeft, ChevronRight, GripVertical, Sparkles
} from "lucide-react";
import { mockHearings, mockCourtRooms, mockUnscheduledHearings, HearingEvent } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

// --- Components for Drag & Drop ---

function DraggableHearing({ hearing, isOverlay = false }: { hearing: HearingEvent, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: hearing.id,
    data: hearing
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 rounded-lg border bg-white shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
        isDragging && "opacity-50",
        isOverlay && "shadow-xl scale-105 rotate-2 z-50",
        hearing.conflicts && hearing.conflicts.length > 0 && "border-l-4 border-l-destructive"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <Badge variant="outline" className="text-[10px] h-5">{hearing.type}</Badge>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="font-bold text-sm truncate">{hearing.inmateName}</p>
      <p className="text-xs text-muted-foreground truncate">{hearing.caseNumber}</p>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <User className="h-3 w-3" /> {hearing.lawyer}
      </div>
      {hearing.conflicts && hearing.conflicts.length > 0 && (
        <div className="mt-2 text-[10px] text-destructive flex items-center gap-1 font-bold">
          <AlertTriangle className="h-3 w-3" /> Conflito Detectado
        </div>
      )}
    </div>
  );
}

function DroppableSlot({ 
  roomId, 
  time, 
  children, 
  isOver 
}: { 
  roomId: string, 
  time: string, 
  children: React.ReactNode, 
  isOver: boolean 
}) {
  const { setNodeRef } = useDroppable({
    id: `${roomId}|${time}`,
    data: { roomId, time }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-32 border-b border-r p-2 transition-colors relative",
        isOver ? "bg-primary/10" : "bg-background"
      )}
    >
      {children}
    </div>
  );
}

// --- Main Page Component ---

export function HearingCalendar() {
  const [date, setDate] = useState<Date>(new Date(2024, 5, 25)); // Mock Date: 25/06/2024
  const [scheduledHearings, setScheduledHearings] = useState<HearingEvent[]>(mockHearings);
  const [backlog, setBacklog] = useState<HearingEvent[]>(mockUnscheduledHearings);
  const [activeHearing, setActiveHearing] = useState<HearingEvent | null>(null);
  
  // Conflict Dialog
  const [conflictDialog, setConflictDialog] = useState<{ isOpen: boolean, conflicts: string[], pendingEvent: HearingEvent | null, targetSlot: {roomId: string, time: string} | null }>({
    isOpen: false,
    conflicts: [],
    pendingEvent: null,
    targetSlot: null
  });

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const handleDragStart = (event: DragStartEvent) => {
    const hearing = [...backlog, ...scheduledHearings].find(h => h.id === event.active.id);
    setActiveHearing(hearing || null);
  };

  const checkConflicts = (hearing: HearingEvent, roomId: string, time: string): string[] => {
    const conflicts: string[] = [];
    
    // 1. Check if room is already booked at this time
    const roomBusy = scheduledHearings.find(h => h.roomId === roomId && h.time === time && h.id !== hearing.id);
    if (roomBusy) {
      conflicts.push(`Sala ocupada por: ${roomBusy.inmateName}`);
    }

    // 2. Check Lawyer Conflict (Same time, different room)
    const lawyerBusy = scheduledHearings.find(h => 
      h.lawyer === hearing.lawyer && 
      h.time === time && 
      h.id !== hearing.id
    );
    if (lawyerBusy) {
      conflicts.push(`Advogado (${hearing.lawyer}) já tem audiência na ${mockCourtRooms.find(r => r.id === lawyerBusy.roomId)?.name}`);
    }

    return conflicts;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHearing(null);

    if (!over) return;

    const hearingId = active.id as string;
    const [roomId, time] = (over.id as string).split('|');

    // Find the hearing (could be in backlog or already scheduled)
    let hearing = backlog.find(h => h.id === hearingId);
    let isFromBacklog = true;

    if (!hearing) {
      hearing = scheduledHearings.find(h => h.id === hearingId);
      isFromBacklog = false;
    }

    if (!hearing) return;

    // Check Conflicts
    const conflicts = checkConflicts(hearing, roomId, time);

    if (conflicts.length > 0) {
      setConflictDialog({
        isOpen: true,
        conflicts,
        pendingEvent: hearing,
        targetSlot: { roomId, time }
      });
      return;
    }

    // Move Event
    moveEvent(hearing, roomId, time, isFromBacklog);
  };

  const moveEvent = (hearing: HearingEvent, roomId: string, time: string, isFromBacklog: boolean) => {
    const updatedHearing = { ...hearing, roomId, time, date: date.toISOString().split('T')[0], status: 'Agendada' as const, conflicts: [] };

    if (isFromBacklog) {
      setBacklog(backlog.filter(h => h.id !== hearing.id));
      setScheduledHearings([...scheduledHearings, updatedHearing]);
    } else {
      setScheduledHearings(scheduledHearings.map(h => h.id === hearing.id ? updatedHearing : h));
    }
  };

  const handleForceSchedule = () => {
    if (conflictDialog.pendingEvent && conflictDialog.targetSlot) {
      const isFromBacklog = backlog.some(h => h.id === conflictDialog.pendingEvent!.id);
      
      // Mark with conflict flag
      const forcedHearing = { 
        ...conflictDialog.pendingEvent, 
        conflicts: conflictDialog.conflicts 
      };

      // Move logic duplicated but with forced hearing
      if (isFromBacklog) {
        setBacklog(backlog.filter(h => h.id !== forcedHearing.id));
        setScheduledHearings([...scheduledHearings, { ...forcedHearing, roomId: conflictDialog.targetSlot!.roomId, time: conflictDialog.targetSlot!.time, status: 'Agendada' }]);
      } else {
        setScheduledHearings(scheduledHearings.map(h => h.id === forcedHearing.id ? { ...forcedHearing, roomId: conflictDialog.targetSlot!.roomId, time: conflictDialog.targetSlot!.time } : h));
      }
    }
    setConflictDialog({ isOpen: false, conflicts: [], pendingEvent: null, targetSlot: null });
  };

  // --- AI Suggestion Logic ---
  const handleAISuggestion = () => {
    const newScheduled = [...scheduledHearings];
    const newBacklog = [...backlog];
    const assignedIds: string[] = [];

    // Helper: Verifica se o slot está livre considerando gaps
    const isSlotAvailable = (roomId: string, timeIndex: number) => {
        const time = timeSlots[timeIndex];
        
        // 1. Colisão Direta
        if (newScheduled.some(h => h.roomId === roomId && h.time === time)) return false;

        // 2. Regra de Gap (Intervalo)
        const room = mockCourtRooms.find(r => r.id === roomId);
        if (!room) return false;

        if (room.type === 'Presencial') {
            // Presencial: Exige 1 hora de gap.
            // Se houver audiência no slot anterior (index-1), ela termina no início deste slot.
            // Precisamos pular este slot para dar 1h de intervalo.
            const prevTime = timeSlots[timeIndex - 1];
            if (prevTime && newScheduled.some(h => h.roomId === roomId && h.time === prevTime)) {
                return false; // Bloqueado pelo gap da anterior
            }

            // Também verifica se o slot seguinte (index+1) está ocupado.
            // Se estiver, não podemos agendar aqui pois nossa audiência terminaria colada na próxima.
            const nextTime = timeSlots[timeIndex + 1];
            if (nextTime && newScheduled.some(h => h.roomId === roomId && h.time === nextTime)) {
                return false; // Bloqueado pelo gap da próxima
            }
        } 
        // Virtual: Gap de 15 min.
        // Como a grade é horária, assumimos que a audiência virtual dura 45min.
        // Logo, 09:00-09:45 + 15min gap = 10:00.
        // Portanto, slots consecutivos (09:00, 10:00) são permitidos. Nenhuma verificação extra necessária.
        
        return true;
    };

    // Algoritmo Guloso (Greedy)
    for (const hearing of [...newBacklog]) {
        let assigned = false;
        
        // Tenta encontrar o primeiro slot livre em qualquer sala
        for (const room of mockCourtRooms) {
            if (assigned) break;
            
            for (let i = 0; i < timeSlots.length; i++) {
                const time = timeSlots[i];
                if (isSlotAvailable(room.id, i)) {
                    // Verifica conflito de advogado antes de agendar
                    const lawyerBusy = newScheduled.some(h => h.lawyer === hearing.lawyer && h.time === time);
                    if (lawyerBusy) continue;

                    // Agendar
                    newScheduled.push({
                        ...hearing,
                        roomId: room.id,
                        time: time,
                        date: date.toISOString().split('T')[0],
                        status: 'Agendada',
                        conflicts: []
                    });
                    assignedIds.push(hearing.id);
                    assigned = true;
                    break;
                }
            }
        }
    }

    if (assignedIds.length > 0) {
        setScheduledHearings(newScheduled);
        setBacklog(newBacklog.filter(h => !assignedIds.includes(h.id)));
        toast.success(`${assignedIds.length} audiências agendadas automaticamente pela IA.`, {
            description: "Respeitando intervalos de 1h (Presencial) e 15min (Virtual)."
        });
    } else {
        toast.info("Não foi possível agendar mais audiências automaticamente.", {
            description: "Verifique a disponibilidade de salas ou conflitos de advogados."
        });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
        <GovHeader 
          title="Gestão de Pauta & Audiências" 
          description="Agendamento inteligente com detecção de conflitos de advogados e salas."
          breadcrumbs={[
            { label: "Visão Geral", href: "/dashboard" },
            { label: "Órgão Judicial" },
            { label: "Calendário" }
          ]}
        />

        <div className="flex flex-1 gap-6 overflow-hidden">
          
          {/* LEFT SIDEBAR: BACKLOG */}
          <Card className="w-80 flex flex-col shrink-0 border-r bg-slate-50/50">
            <CardHeader className="pb-2 bg-white border-b space-y-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Audiências Pendentes</span>
                <Badge variant="secondary">{backlog.length}</Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={handleAISuggestion}
                disabled={backlog.length === 0}
              >
                <Sparkles className="h-3 w-3" /> Sugestão por IA
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-2 overflow-hidden">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {backlog.map(hearing => (
                    <DraggableHearing key={hearing.id} hearing={hearing} />
                  ))}
                  {backlog.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      Nenhuma audiência pendente.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* MAIN CALENDAR GRID */}
          <div className="flex-1 flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden">
            
            {/* Calendar Header Controls */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-bold text-lg capitalize">
                    {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                </div>
                <Button variant="outline" size="icon" onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-xs mr-4">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Virtual</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div> Presencial</span>
                </div>
                <Button variant="default" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" /> Hoje
                </Button>
              </div>
            </div>

            {/* Grid Header (Rooms) */}
            <div className="flex border-b">
              <div className="w-20 shrink-0 border-r bg-slate-50 p-2 text-xs font-bold text-muted-foreground flex items-center justify-center">
                Horário
              </div>
              {mockCourtRooms.map(room => (
                <div key={room.id} className="flex-1 border-r p-3 text-center bg-slate-50">
                  <div className="font-bold text-sm flex items-center justify-center gap-2">
                    {room.type === 'Virtual' ? <Video className="h-4 w-4 text-blue-500" /> : <MapPin className="h-4 w-4 text-slate-500" />}
                    {room.name}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1 bg-white">
                    Cap: {room.capacity}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Grid Body (Time Slots) */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {timeSlots.map(time => (
                  <div key={time} className="flex min-h-[128px]">
                    {/* Time Label */}
                    <div className="w-20 shrink-0 border-r border-b bg-slate-50 p-2 text-xs font-mono text-muted-foreground flex items-start justify-center pt-4">
                      {time}
                    </div>
                    
                    {/* Room Slots */}
                    {mockCourtRooms.map(room => {
                      const hearingInSlot = scheduledHearings.find(
                        h => h.roomId === room.id && h.time === time
                      );

                      return (
                        <div key={`${room.id}-${time}`} className="flex-1 min-w-[200px]">
                          <DroppableSlot roomId={room.id} time={time} isOver={false}>
                            {hearingInSlot && (
                              <DraggableHearing hearing={hearingInSlot} />
                            )}
                          </DroppableSlot>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeHearing ? <DraggableHearing hearing={activeHearing} isOverlay /> : null}
      </DragOverlay>

      {/* Conflict Dialog */}
      <Dialog open={conflictDialog.isOpen} onOpenChange={(open) => !open && setConflictDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Conflito de Agendamento Detectado
            </DialogTitle>
            <DialogDescription>
              O sistema identificou impedimentos para este horário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {conflictDialog.conflicts.map((conflict, idx) => (
              <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {conflict}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleForceSchedule}>
              Forçar Agendamento (Ignorar)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
