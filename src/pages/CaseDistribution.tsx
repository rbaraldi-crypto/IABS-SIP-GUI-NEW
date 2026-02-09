import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockDistributionCases, mockDistributionUsers, DistributionCase, DistributionUser } from '@/data/mockData';
import { GripVertical, UserPlus, Clock, AlertCircle } from 'lucide-react';

// --- Draggable Case Item Component ---
function SortableCaseItem({ id, data }: { id: string, data: DistributionCase }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none">
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 border-l-primary">
        <CardContent className="p-3 flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm truncate">{data.inmateName}</span>
              <Badge variant={data.priority === 'Alta' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                {data.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{data.eventType}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Fila: {data.timeInQueue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Droppable User Column Component ---
function UserColumn({ user, cases, id }: { user: DistributionUser, cases: DistributionCase[], id: string }) {
  const { setNodeRef } = useSortable({ id, data: { type: 'container', user } });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full bg-muted/30 rounded-lg border p-2">
      <div className="flex items-center gap-3 p-2 mb-2 bg-background rounded border shadow-sm">
        <div className="relative">
            <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === 'Disponível' ? 'bg-green-500' : user.status === 'Ocupado' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate">{user.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
        </div>
        <div className="text-right">
            <span className={`text-xs font-bold ${cases.length >= user.maxCases ? 'text-destructive' : 'text-primary'}`}>
                {cases.length}/{user.maxCases}
            </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-1">
        <SortableContext items={cases.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {cases.map((c) => (
                <SortableCaseItem key={c.id} id={c.id} data={c} />
            ))}
            {cases.length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-md m-1">
                    <UserPlus className="h-5 w-5 mb-1 opacity-50" />
                    <span className="text-xs">Arraste para atribuir</span>
                </div>
            )}
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

export function CaseDistribution() {
  const [unassignedCases, setUnassignedCases] = useState<DistributionCase[]>(mockDistributionCases);
  // Simulating user assignments state
  const [assignments, setAssignments] = useState<Record<string, DistributionCase[]>>({
    'user-001': [],
    'user-002': [],
    'user-003': [],
    'user-004': []
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
        setActiveId(null);
        return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Find source container
    let sourceContainer = 'unassigned';
    let sourceItem = unassignedCases.find(c => c.id === activeIdStr);
    
    if (!sourceItem) {
        // Look in assignments
        for (const userId in assignments) {
            const found = assignments[userId].find(c => c.id === activeIdStr);
            if (found) {
                sourceContainer = userId;
                sourceItem = found;
                break;
            }
        }
    }

    // Determine target container
    let targetContainer = 'unassigned';
    if (mockDistributionUsers.find(u => u.id === overIdStr)) {
        targetContainer = overIdStr;
    } else if (overIdStr === 'unassigned-container') {
        targetContainer = 'unassigned';
    } else {
        // Dropped over an item in a container?
         for (const userId in assignments) {
            if (assignments[userId].find(c => c.id === overIdStr)) {
                targetContainer = userId;
                break;
            }
        }
        if (unassignedCases.find(c => c.id === overIdStr)) {
            targetContainer = 'unassigned';
        }
    }

    if (sourceContainer !== targetContainer && sourceItem) {
        // Move logic
        if (sourceContainer === 'unassigned') {
            setUnassignedCases(prev => prev.filter(c => c.id !== activeIdStr));
        } else {
            setAssignments(prev => ({
                ...prev,
                [sourceContainer]: prev[sourceContainer].filter(c => c.id !== activeIdStr)
            }));
        }

        if (targetContainer === 'unassigned') {
            setUnassignedCases(prev => [...prev, sourceItem!]);
        } else {
            setAssignments(prev => ({
                ...prev,
                [targetContainer]: [...prev[targetContainer], sourceItem!]
            }));
        }
    }

    setActiveId(null);
  };

  const activeCase = 
    unassignedCases.find(c => c.id === activeId) || 
    Object.values(assignments).flat().find(c => c.id === activeId);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between flex-none">
        <div>
            <h2 className="text-3xl font-bold text-primary">Distribuição de Casos</h2>
            <p className="text-muted-foreground">Arraste os processos para atribuir aos analistas disponíveis.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
                Atualizar Fila
            </Button>
            <Button>
                Distribuição Automática (IA)
            </Button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Unassigned Column */}
            <div className="w-80 flex flex-col flex-none bg-muted/10 rounded-xl border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        Fila de Entrada
                    </h3>
                    <Badge variant="secondary">{unassignedCases.length}</Badge>
                </div>
                
                <ScrollArea className="flex-1 pr-2">
                    <SortableContext items={unassignedCases.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[100px]" id="unassigned-container">
                            {unassignedCases.map((c) => (
                                <SortableCaseItem key={c.id} id={c.id} data={c} />
                            ))}
                            {unassignedCases.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    Fila vazia!
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </ScrollArea>
            </div>

            {/* Users Columns */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-max pb-4">
                    {mockDistributionUsers.map((user) => (
                        <div key={user.id} className="w-72 h-full">
                            <UserColumn 
                                id={user.id} 
                                user={user} 
                                cases={assignments[user.id]} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeCase ? (
                <Card className="w-72 shadow-2xl cursor-grabbing border-l-4 border-l-primary opacity-90 rotate-3">
                    <CardContent className="p-3">
                        <div className="font-bold text-sm">{activeCase.inmateName}</div>
                        <div className="text-xs text-muted-foreground">{activeCase.eventType}</div>
                    </CardContent>
                </Card>
            ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
