import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, Users, ShieldAlert, Ban, Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Tipos para o Mapa
type FactionType = 'CV' | 'PCC' | 'PGC' | 'Neutro' | 'Seguro';
type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

interface CellData {
  id: string;
  label: string;
  capacity: number;
  occupancy: number;
  faction: FactionType;
  risk: RiskLevel;
  leaders: string[];
  notes?: string;
}

interface WingData {
  id: string;
  name: string;
  type: 'Fechado' | 'Semiaberto' | 'Rdd';
  cells: CellData[];
}

// Mock Data Específico para o Mapa
const mockWings: WingData[] = [
  {
    id: 'pavilhao-a',
    name: 'Pavilhão A (Facções)',
    type: 'Fechado',
    cells: Array.from({ length: 24 }, (_, i) => {
      const row = Math.floor(i / 6);
      // Simula distribuição geográfica de facções
      let faction: FactionType = 'Neutro';
      if (row === 0) faction = 'CV'; // Ala Superior dominada por CV
      if (row === 3) faction = 'PCC'; // Ala Inferior dominada por PCC
      
      // Simula Risco nas fronteiras (meio do pavilhão)
      let risk: RiskLevel = 'Baixo';
      if (row === 1 || row === 2) risk = 'Médio'; // Zona neutra/mista
      
      // Cria um ponto de conflito crítico
      if (i === 9) { faction = 'CV'; risk = 'Crítico'; } // Célula do CV infiltrada/próxima
      if (i === 15) { faction = 'PCC'; risk = 'Alto'; }

      const occupancy = Math.floor(Math.random() * 5) + 6; // 6 a 10 presos
      
      return {
        id: `A-${i + 1}`,
        label: `A-${(i + 1).toString().padStart(2, '0')}`,
        capacity: 8,
        occupancy: occupancy,
        faction,
        risk: occupancy > 8 ? 'Alto' : risk, // Superlotação aumenta risco
        leaders: occupancy > 9 ? ['Vulgo "Chefe"'] : []
      };
    })
  },
  {
    id: 'pavilhao-b',
    name: 'Pavilhão B (Triagem/Seguro)',
    type: 'Fechado',
    cells: Array.from({ length: 12 }, (_, i) => ({
      id: `B-${i + 1}`,
      label: `B-${(i + 1).toString().padStart(2, '0')}`,
      capacity: 4,
      occupancy: Math.floor(Math.random() * 4),
      faction: i < 4 ? 'Seguro' : 'Neutro',
      risk: 'Baixo',
      leaders: []
    }))
  }
];

const getFactionColor = (faction: FactionType) => {
  switch (faction) {
    case 'CV': return 'bg-red-500 hover:bg-red-600 border-red-700';
    case 'PCC': return 'bg-blue-500 hover:bg-blue-600 border-blue-700';
    case 'PGC': return 'bg-green-500 hover:bg-green-600 border-green-700';
    case 'Seguro': return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-yellow-950';
    default: return 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700';
  }
};

const getFactionDisplayName = (faction: string) => {
  switch(faction) {
      case 'CV': return 'Facção A';
      case 'PCC': return 'Facção B';
      default: return faction;
  }
};

const getRiskBorder = (risk: RiskLevel) => {
  switch (risk) {
    case 'Crítico': return 'ring-4 ring-destructive ring-offset-2 animate-pulse z-10';
    case 'Alto': return 'ring-2 ring-orange-500 z-10';
    case 'Médio': return 'ring-1 ring-yellow-400';
    default: return '';
  }
};

export function PrisonHeatmap() {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-xs font-medium">Facção A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-xs font-medium">Facção B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
            <span className="text-xs font-medium">Seguro/Isolamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 rounded-sm border border-slate-300"></div>
            <span className="text-xs font-medium">Neutro</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            <span>Borda Pulsante = Risco de Conflito Iminente</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockWings.map((wing) => (
          <Card key={wing.id} className="overflow-hidden">
            <CardHeader className="bg-muted/20 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {wing.name}
                </CardTitle>
                <Badge variant="outline">{wing.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-6 gap-3">
                <TooltipProvider>
                  {wing.cells.map((cell) => (
                    <Tooltip key={cell.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedCell(cell)}
                          className={cn(
                            "aspect-square rounded-md flex flex-col items-center justify-center transition-all relative",
                            getFactionColor(cell.faction),
                            getRiskBorder(cell.risk),
                            cell.faction === 'Neutro' ? 'text-slate-600' : 'text-white'
                          )}
                        >
                          <span className="text-[10px] font-bold">{cell.label}</span>
                          <div className="flex items-center gap-0.5 mt-1">
                            <Users className="h-3 w-3" />
                            <span className="text-[10px]">{cell.occupancy}</span>
                          </div>
                          
                          {/* Indicador de Superlotação */}
                          {cell.occupancy > cell.capacity && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white" title="Superlotado" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-3">
                        <div className="space-y-1">
                            <p className="font-bold text-sm border-b pb-1 mb-1">Cela {cell.label}</p>
                            <p className="text-xs">Facção: <strong>{getFactionDisplayName(cell.faction)}</strong></p>
                            <p className="text-xs">Ocupação: {cell.occupancy}/{cell.capacity}</p>
                            <p className={`text-xs font-bold ${cell.risk === 'Crítico' ? 'text-red-500' : ''}`}>
                                Risco: {cell.risk}
                            </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes da Cela (Dialog) */}
      <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    Cela {selectedCell?.label}
                    <Badge variant={selectedCell?.risk === 'Crítico' ? 'destructive' : 'outline'}>
                        Risco {selectedCell?.risk}
                    </Badge>
                </DialogTitle>
                <DialogDescription>
                    Detalhamento da ocupação e inteligência.
                </DialogDescription>
            </DialogHeader>

            {selectedCell && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded border">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Facção Dominante</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-3 h-3 rounded-full ${getFactionColor(selectedCell.faction).split(' ')[0]}`} />
                                <span className="font-bold">{getFactionDisplayName(selectedCell.faction)}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded border">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Ocupação</span>
                            <div className="mt-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{selectedCell.occupancy} detentos</span>
                                    <span>Cap: {selectedCell.capacity}</span>
                                </div>
                                <Progress value={(selectedCell.occupancy / selectedCell.capacity) * 100} className="h-2" />
                            </div>
                        </div>
                    </div>

                    {selectedCell.leaders.length > 0 && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-md">
                            <h4 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-2">
                                <ShieldAlert className="h-4 w-4" /> Lideranças Identificadas
                            </h4>
                            <ul className="list-disc list-inside text-sm text-red-700">
                                {selectedCell.leaders.map((l, i) => <li key={i}>{l}</li>)}
                            </ul>
                        </div>
                    )}

                    {selectedCell.risk === 'Crítico' && (
                        <div className="flex items-start gap-3 p-3 bg-destructive/10 text-destructive rounded-md">
                            <Ban className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <strong>Alocação Bloqueada:</strong> Esta cela está em nível crítico de tensão. Transferências para este local exigem autorização do Diretor de Segurança.
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                        <Info className="h-4 w-4" />
                        <span>Dados atualizados pela Inteligência em {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
