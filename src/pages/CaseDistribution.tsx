import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { mockDistributionCases, mockDistributionUsers, DistributionCase, DistributionUser } from '@/data/mockData';
import { Clock, GripVertical, AlertCircle, CheckCircle2 } from 'lucide-react';

// Sortable Item Component
function SortableItem({ id, caseItem }: { id: string, caseItem: DistributionCase }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 touch-none">
      <div className="flex items-center p-3 bg-white border rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={caseItem.inmatePhoto} />
          <AvatarFallback>{caseItem.inmateName.substring(0,2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{caseItem.inmateName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{caseItem.eventType}</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1">{caseItem.priority}</Badge>
          </div>
        </div>
        <div className="text-right pl-2">
          <div className="flex items-center text-xs text-orange-600 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            {caseItem.timeInQueue}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseDistribution() {
  const [unassignedCases, setUnassignedCases] = useState<DistributionCase[]>(mockDistributionCases);
  const [users, setUsers] = useState<DistributionUser[]>(mockDistributionUsers);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Logic to assign case to user would go here
      // For this mock, we just remove it from the unassigned list to simulate assignment
      const caseId = active.id as string;
      const userId = over.id as string;

      // Check if dropped on a user card
      if (userId.startsWith('user-')) {
        setUnassignedCases((items) => items.filter((item) => item.id !== caseId));
        setUsers((prevUsers) => prevUsers.map(user => {
          if (user.id === userId) {
            return { ...user, casesCount: user.casesCount + 1, workload: Math.min(100, user.workload + 5) };
          }
          return user;
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Distribuição de Casos</h2>
          <p className="text-muted-foreground">Arraste os processos da fila para a caixa de entrada dos analistas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Distribuição Automática (IA)</Button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Unassigned Queue */}
          <Card className="bg-slate-50/50 border-dashed border-2 h-full flex flex-col">
            <div className="p-4 border-b bg-white rounded-t-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Fila de Espera ({unassignedCases.length})
              </h3>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <SortableContext 
                items={unassignedCases.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {unassignedCases.map((caseItem) => (
                  <SortableItem key={caseItem.id} id={caseItem.id} caseItem={caseItem} />
                ))}
                {unassignedCases.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>Fila zerada!</p>
                  </div>
                )}
              </SortableContext>
            </CardContent>
          </Card>

          {/* Team Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
            {users.map((user) => (
              <SortableContext key={user.id} items={[]} id={user.id}>
                {/* We use SortableContext here just to make the user card a droppable target */}
                <UserDropZone user={user} />
              </SortableContext>
            ))}
          </div>

        </div>
      </DndContext>
    </div>
  );
}

function UserDropZone({ user }: { user: DistributionUser }) {
  const { setNodeRef } = useSortable({ id: user.id });

  return (
    <div ref={setNodeRef} className="h-fit">
      <Card className={`border-2 transition-colors ${user.status === 'Disponível' ? 'border-green-100' : 'border-slate-100 opacity-80'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-sm">{user.name}</h4>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Badge variant={user.status === 'Disponível' ? 'default' : 'secondary'} className={user.status === 'Disponível' ? 'bg-green-500' : ''}>
              {user.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Carga de Trabalho</span>
              <span>{user.casesCount}/{user.maxCases} casos</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${user.workload > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${user.workload}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
