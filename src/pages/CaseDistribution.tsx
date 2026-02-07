import { useState } from 'react';
import { mockDistributionCases } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, User } from 'lucide-react';

export function CaseDistribution() {
  const [items, setItems] = useState(mockDistributionCases);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Distribuição de Processos</h2>
          <p className="text-muted-foreground">Arraste para reordenar a fila de prioridade.</p>
        </div>
        <Button>Distribuir Lote (IA)</Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
            {activeId ? (
                <div className="opacity-80">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <Avatar>
                                    <AvatarImage src={items.find(i => i.id === activeId)?.inmatePhoto} />
                                    <AvatarFallback>CP</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{items.find(i => i.id === activeId)?.inmateName}</p>
                                    <p className="text-xs text-muted-foreground">{items.find(i => i.id === activeId)?.eventType}</p>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-move hover:border-primary/50 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <Avatar>
              <AvatarImage src={props.item.inmatePhoto} />
              <AvatarFallback>CP</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{props.item.inmateName}</p>
                <Badge variant={props.item.priority === 'Alta' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                    {props.item.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {props.item.cpf}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Fila: {props.item.timeInQueue}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm font-medium text-primary">
            {props.item.eventType}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
