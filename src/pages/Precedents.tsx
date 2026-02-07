import { useState } from "react";
import { mockSimilarCases, SimilarCase } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Scale, AlertCircle, ExternalLink, FileText, Lock, PieChart } from "lucide-react";

export function Precedents() {
  const [selectedCase, setSelectedCase] = useState<SimilarCase | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-primary">Jurisprudência & Precedentes</h2>
          <p className="text-muted-foreground">Análise comparativa de casos similares.</p>
        </div>
      </div>

      {/* Changed text color to black as requested */}
      <Alert className="bg-warning/10 border-warning/30 text-black">
        <AlertCircle className="h-5 w-5 text-warning" />
        <AlertTitle className="text-black font-bold ml-2">Atenção</AlertTitle>
        <AlertDescription className="ml-2 text-black/90">
          Casos similares são apresentados apenas como referência informativa e não vinculam a decisão judicial.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Casos Correlatos Identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Similaridade</TableHead>
                <TableHead>Caso / Processo</TableHead>
                <TableHead>Crime</TableHead>
                <TableHead>Pena</TableHead>
                <TableHead>Decisão</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSimilarCases.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={item.similarity > 90 ? "default" : "secondary"} className={item.similarity > 90 ? "bg-primary" : ""}>
                      {item.similarity}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.caseNumber}</TableCell>
                  <TableCell>{item.crime}</TableCell>
                  <TableCell>{item.penalty}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${item.decision.includes("Negado") ? "text-destructive" : "text-success"}`}>
                      {item.decision}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedCase(item)}
                      title="Visualizar Caso"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Read-Only Case Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 bg-muted/50">
                    <Lock className="h-3 w-3" /> Read Only
                </Badge>
                <span className="text-xs text-muted-foreground">Visualização de Precedente</span>
            </div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Processo {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              Detalhes do caso correlato para fins de comparação jurisprudencial.
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Crime Principal</span>
                        <p className="font-medium mt-1">{selectedCase.crime}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Pena Fixada</span>
                        <p className="font-medium mt-1">{selectedCase.penalty}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Decisão Final</span>
                        <p className={`font-medium mt-1 ${selectedCase.decision.includes("Negado") ? "text-destructive" : "text-success"}`}>
                            {selectedCase.decision}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Fatores de Similaridade (Pesos)
                    </h4>
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                        {selectedCase.factors && selectedCase.factors.length > 0 ? (
                            selectedCase.factors.map((factor, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-foreground/80">{factor.name}</span>
                                        <span className="font-bold text-primary">{factor.weight}%</span>
                                    </div>
                                    <Progress value={factor.weight} className="h-2" />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Mesma Tipificação Penal</Badge>
                                <Badge variant="secondary">Reincidência Específica</Badge>
                                <Badge variant="secondary">Tempo de Pena Similar (+/- 10%)</Badge>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-primary">Ementa da Decisão</h4>
                    <div className="p-4 bg-muted/10 border rounded-md text-sm leading-relaxed text-justify">
                        <p>
                            PENAL. PROCESSO PENAL. EXECUÇÃO. PROGRESSÃO DE REGIME. REQUISITO OBJETIVO PREENCHIDO. 
                            BOM COMPORTAMENTO CARCERÁRIO ATESTADO. AUSÊNCIA DE FALTA GRAVE NOS ÚLTIMOS 12 MESES. 
                            SÚMULA 491 DO STJ. DECISÃO MANTIDA.
                        </p>
                        <p className="mt-2 text-muted-foreground">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
