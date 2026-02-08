import { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, BarChart3, AlertTriangle, CheckCircle2, MoreVertical, 
  ArrowRightLeft, Briefcase 
} from "lucide-react";
import { mockDistributionUsers, DistributionUser } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function CoordinatorDistribution() {
  const [users, setUsers] = useState<DistributionUser[]>(mockDistributionUsers);

  const getWorkloadColor = (load: number) => {
    if (load > 80) return "bg-destructive";
    if (load > 60) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestão de Equipe
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de carga de trabalho e rebalanceamento.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" /> Relatório de Produtividade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
            {user.workload > 80 && (
              <div className="absolute top-0 right-0 p-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> SOBRECARGA
                </div>
              </div>
            )}
            
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <CardTitle className="text-base truncate" title={user.name}>{user.name}</CardTitle>
                <CardDescription className="text-xs truncate">{user.role}</CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ocupação</span>
                  <span className="font-bold">{user.workload}%</span>
                </div>
                <Progress value={user.workload} className="h-2" indicatorClassName={getWorkloadColor(user.workload)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <span className="block font-bold text-lg">{user.casesCount}</span>
                  <span className="text-muted-foreground">Casos Ativos</span>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <span className="block font-bold text-lg">{user.maxCases}</span>
                  <span className="text-muted-foreground">Capacidade</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className={
                  user.status === 'Disponível' ? 'text-success border-success/30 bg-success/5' : 
                  user.status === 'Ausente' ? 'text-muted-foreground' : 'text-warning border-warning/30 bg-warning/5'
                }>
                  {user.status}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Briefcase className="h-4 w-4" /> Ver Casos
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <ArrowRightLeft className="h-4 w-4" /> Redistribuir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/20 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-semibold text-muted-foreground">Tudo sob controle</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            A carga de trabalho está distribuída dentro dos parâmetros aceitáveis. Nenhuma ação crítica necessária no momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
