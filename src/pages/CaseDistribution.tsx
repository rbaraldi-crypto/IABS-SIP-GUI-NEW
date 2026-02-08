import { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  BrainCircuit, ArrowRight, Clock, Filter, MoreHorizontal, 
  CheckCircle2, Sparkles, UserPlus 
} from "lucide-react";
import { mockDistributionCases, DistributionCase } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function CaseDistribution() {
  const [cases, setCases] = useState<DistributionCase[]>(mockDistributionCases);
  const [isDistributing, setIsDistributing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAutoDistribute = () => {
    setIsDistributing(true);
    // Simula processamento da IA
    setTimeout(() => {
      setIsDistributing(false);
      setShowSuccess(true);
      // Remove alguns casos para simular distribuição
      setCases(prev => prev.slice(2)); 
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-secondary" />
            Distribuição Inteligente
          </h2>
          <p className="text-muted-foreground">
            Fila de entrada de processos aguardando triagem e atribuição.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button 
            onClick={handleAutoDistribute} 
            disabled={isDistributing || cases.length === 0}
            className="gap-2 bg-secondary hover:bg-secondary/90 text-white shadow-md transition-all hover:scale-105"
          >
            {isDistributing ? (
              <>
                <BrainCircuit className="h-4 w-4 animate-pulse" />
                Processando IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Auto-Distribuir ({cases.length})
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Fila de Triagem</CardTitle>
            <CardDescription>Processos recebidos do Tribunal de Justiça nas últimas 24h.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apenado</TableHead>
                  <TableHead>Evento / Pedido</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Tempo em Fila</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length > 0 ? (
                  cases.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.inmatePhoto} />
                            <AvatarFallback>{item.inmateName.substring(0,2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{item.inmateName}</span>
                            <span className="text-[10px] text-muted-foreground">{item.cpf}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.eventType}</TableCell>
                      <TableCell>
                        <Badge variant={item.priority === 'Alta' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.timeInQueue}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success/50" />
                      Fila zerada! Todos os processos foram distribuídos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Sugestão da IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Carga da Equipe</span>
                <span className="font-bold text-success">Equilibrada</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">
                O algoritmo sugere distribuir <strong>40%</strong> dos casos de "Progressão" para a equipe de Analistas Jr. devido à baixa complexidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regras Ativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Priorizar Réus Presos</span>
              </div>
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Agrupar por Unidade Prisional</span>
              </div>
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Alerta de Prescrição (48h)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-6 w-6" /> Distribuição Concluída
            </DialogTitle>
            <DialogDescription>
              Os processos foram atribuídos com sucesso baseando-se na especialidade e carga de trabalho atual de cada servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-sm border-b pb-2">
              <span>Processos Distribuídos</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex justify-between text-sm border-b pb-2">
              <span>Tempo Economizado (Est.)</span>
              <span className="font-bold">15 min</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
