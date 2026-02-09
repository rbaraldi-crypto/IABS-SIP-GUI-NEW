import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network, AlertTriangle, User, Users, MapPin, 
  Search, ZoomIn, ZoomOut, RefreshCw, ShieldAlert, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---
type NodeType = 'inmate' | 'visitor';
type FactionType = 'CV' | 'PCC' | 'Neutro' | 'N/A';

interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  label: string;
  faction: FactionType;
  unit?: string;
  risk: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  x: number;
  y: number;
  avatar?: string;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: 'visita_social' | 'advogado' | 'familiar';
  date: string;
  isSuspicious: boolean;
}

// --- Mock Data Generation ---
const generateGraphData = () => {
  const nodes: GraphNode[] = [
    // Visitante Suspeito (Hub)
    { id: 'v1', type: 'visitor', name: 'Maria da Silva', label: 'Visitante', faction: 'N/A', risk: 'Alto', x: 400, y: 300, avatar: 'MS' },
    
    // Detentos Conectados (Spokes)
    { id: 'i1', type: 'inmate', name: 'Carlos "Vapor"', label: 'Detento', faction: 'CV', unit: 'Unidade A', risk: 'Alto', x: 200, y: 150, avatar: 'CV' },
    { id: 'i2', type: 'inmate', name: 'João "Bomba"', label: 'Detento', faction: 'CV', unit: 'Unidade B', risk: 'Médio', x: 600, y: 150, avatar: 'JB' },
    { id: 'i3', type: 'inmate', name: 'Pedro "Magro"', label: 'Detento', faction: 'CV', unit: 'Unidade C', risk: 'Alto', x: 400, y: 500, avatar: 'PM' },
    
    // Outro Cluster (Sem conexão direta com o primeiro, mas talvez futuro)
    { id: 'v2', type: 'visitor', name: 'Ana Souza', label: 'Advogada', faction: 'N/A', risk: 'Baixo', x: 700, y: 400, avatar: 'AS' },
    { id: 'i4', type: 'inmate', name: 'Marcos "Líder"', label: 'Detento', faction: 'PCC', unit: 'Unidade A', risk: 'Crítico', x: 750, y: 250, avatar: 'ML' },
  ];

  const links: GraphLink[] = [
    { id: 'l1', source: 'v1', target: 'i1', type: 'visita_social', date: '10/06/2024', isSuspicious: false },
    { id: 'l2', source: 'v1', target: 'i2', type: 'visita_social', date: '12/06/2024', isSuspicious: true }, // Conexão entre unidades diferentes
    { id: 'l3', source: 'v1', target: 'i3', type: 'visita_social', date: '15/06/2024', isSuspicious: true },
    
    { id: 'l4', source: 'v2', target: 'i4', type: 'advogado', date: '11/06/2024', isSuspicious: false },
  ];

  return { nodes, links };
};

export function LinkAnalysisGraph() {
  const [data, setData] = useState(generateGraphData());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Identificar alertas automaticamente
  const alerts = useMemo(() => {
    const suspiciousLinks = data.links.filter(l => l.isSuspicious);
    const bridgeVisitors = new Set(suspiciousLinks.map(l => l.source)); // Assumindo source = visitor
    
    return Array.from(bridgeVisitors).map(visitorId => {
      const visitor = data.nodes.find(n => n.id === visitorId);
      const connections = data.links.filter(l => l.source === visitorId || l.target === visitorId);
      const connectedInmates = connections.map(l => 
        data.nodes.find(n => n.id === (l.source === visitorId ? l.target : l.source))
      ).filter(Boolean) as GraphNode[];

      const units = new Set(connectedInmates.map(i => i.unit));
      
      return {
        visitor,
        inmateCount: connectedInmates.length,
        unitCount: units.size,
        details: `Visitou ${connectedInmates.length} detentos em ${units.size} unidades diferentes.`
      };
    });
  }, [data]);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'visitor') return node.risk === 'Alto' ? '#ef4444' : '#3b82f6'; // Red for high risk visitor
    switch (node.faction) {
      case 'CV': return '#dc2626'; // Red
      case 'PCC': return '#2563eb'; // Blue
      default: return '#64748b'; // Slate
    }
  };

  const getNodeShape = (node: GraphNode) => {
    return node.type === 'visitor' ? 'circle' : 'rect';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Graph Area */}
      <Card className="lg:col-span-3 flex flex-col overflow-hidden border-2 border-slate-200">
        <CardHeader className="pb-2 bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Mapa de Vínculos (Link Analysis)
            </CardTitle>
            <CardDescription>
              Visualização de conexões entre visitantes e detentos.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => { setData(generateGraphData()); setSelectedNode(null); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 bg-slate-100 relative overflow-hidden cursor-move">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 800 600`}
            className="w-full h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
              <marker id="arrowhead-alert" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>

            {/* Links */}
            {data.links.map(link => {
              const source = data.nodes.find(n => n.id === link.source)!;
              const target = data.nodes.find(n => n.id === link.target)!;
              
              return (
                <g key={link.id}>
                  <line 
                    x1={source.x} y1={source.y} 
                    x2={target.x} y2={target.y} 
                    stroke={link.isSuspicious ? '#ef4444' : '#94a3b8'} 
                    strokeWidth={link.isSuspicious ? 3 : 2}
                    strokeDasharray={link.isSuspicious ? "5,5" : "0"}
                    markerEnd={`url(#${link.isSuspicious ? 'arrowhead-alert' : 'arrowhead'})`}
                    className="transition-all duration-300"
                  />
                  {link.isSuspicious && (
                    <circle 
                      cx={(source.x + target.x) / 2} 
                      cy={(source.y + target.y) / 2} 
                      r="8" 
                      fill="#fee2e2" 
                      stroke="#ef4444" 
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {data.nodes.map(node => (
              <g 
                key={node.id} 
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {node.type === 'visitor' ? (
                  <circle 
                    cx={node.x} cy={node.y} r="25" 
                    fill="white" 
                    stroke={getNodeColor(node)} 
                    strokeWidth="4" 
                  />
                ) : (
                  <rect 
                    x={node.x - 25} y={node.y - 25} width="50" height="50" rx="8"
                    fill="white" 
                    stroke={getNodeColor(node)} 
                    strokeWidth="4" 
                  />
                )}
                
                {/* Avatar / Icon */}
                <text 
                  x={node.x} y={node.y} dy=".3em" 
                  textAnchor="middle" 
                  className="text-xs font-bold fill-slate-700 pointer-events-none"
                  fontSize="12"
                >
                  {node.avatar}
                </text>

                {/* Label */}
                <text 
                  x={node.x} y={node.y + 40} 
                  textAnchor="middle" 
                  className="text-[10px] font-medium fill-slate-600 uppercase tracking-wider"
                >
                  {node.type === 'inmate' ? `(${node.faction})` : node.label}
                </text>
                <text 
                  x={node.x} y={node.y + 52} 
                  textAnchor="middle" 
                  className="text-xs font-bold fill-slate-800"
                >
                  {node.name.split(' ')[0]}
                </text>

                {/* Alert Badge if Risk is High */}
                {(node.risk === 'Alto' || node.risk === 'Crítico') && (
                  <circle cx={node.x + 20} cy={node.y - 20} r="8" fill="#ef4444" />
                )}
                {(node.risk === 'Alto' || node.risk === 'Crítico') && (
                  <text x={node.x + 20} y={node.y - 17} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
                )}
              </g>
            ))}
          </svg>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg border shadow-sm text-xs space-y-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white"></div>
              <span>Visitante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-red-600 bg-white"></div>
              <span>Detento (Facção)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-red-500 border-dashed"></div>
              <span>Vínculo Suspeito</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Sidebar: Details & Alerts */}
      <div className="flex flex-col gap-6 h-full">
        {/* Alerts Panel */}
        <Card className="border-l-4 border-l-red-500 shadow-md bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2 text-base">
              <ShieldAlert className="h-5 w-5" />
              Alertas de Inteligência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-red-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Pombo-Correio Detectado</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>{alert.visitor?.name}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-tight">
                          {alert.details}
                        </p>
                        <Button size="sm" variant="outline" className="mt-2 w-full h-7 text-xs border-red-200 text-red-700 hover:bg-red-50">
                          Investigar Vínculos
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum padrão suspeito identificado.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Node Details */}
        <Card className="flex-1">
          <CardHeader className="pb-2 bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Detalhes da Entidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                    {selectedNode.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedNode.name}</h3>
                    <Badge variant={selectedNode.type === 'inmate' ? 'default' : 'secondary'}>
                      {selectedNode.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedNode.type === 'inmate' && (
                    <>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Facção</span>
                        <span className="font-bold text-red-600">{selectedNode.faction}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Unidade</span>
                        <span>{selectedNode.unit}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Risco</span>
                    <Badge variant="outline" className={selectedNode.risk === 'Alto' || selectedNode.risk === 'Crítico' ? 'text-red-600 border-red-200 bg-red-50' : ''}>
                      {selectedNode.risk}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2">
                  <Button className="w-full gap-2">
                    <Search className="h-4 w-4" /> Ver Ficha Completa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm text-center p-4">
                <MapPin className="h-8 w-8 mb-2 opacity-20" />
                <p>Clique em um nó do gráfico para ver detalhes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
