import { useState } from "react";
import { mockInmate, mockTimeline } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Fingerprint, FileText, Hash, AlertTriangle, ShieldCheck, Database, Clock } from "lucide-react";
import { dynamoService, AuditLogItem } from "@/services/awsMock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { HorizontalTimeline } from "@/components/business/HorizontalTimeline";

export function Profile() {
  const [selectedEvent, setSelectedEvent] = useState<typeof mockTimeline[0] | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await dynamoService.queryLogs(mockInmate.id);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary">{mockInmate.name}</h2>
          <p className="text-muted-foreground font-mono mt-1">ID Penal: {mockInmate.id}</p>
        </div>
        <Badge variant="outline" className="w-fit text-sm py-1 px-3 border-primary text-primary">
          Regime Semiaberto
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Identity & Bio */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <Card className="overflow-hidden border-t-4 border-t-primary h-full">
            <CardHeader className="bg-muted/30 pb-8">
              <div className="flex justify-center">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={mockInmate.photoUrl} />
                  <AvatarFallback>CE</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="pt-0 -mt-4 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-semibold cursor-help border border-success/20">
                      <Fingerprint className="h-4 w-4" />
                      Identidade Confirmada
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Identidade confirmada via ABIS externo. O IABS não armazena biometria bruta.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">CPF</span>
                  <span className="text-sm font-medium font-mono">{mockInmate.cpf}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Nascimento</span>
                  <span className="text-sm font-medium">{mockInmate.dateOfBirth}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Mãe</span>
                  <span className="text-sm font-medium truncate max-w-[150px]" title={mockInmate.motherName}>{mockInmate.motherName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Details */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          
          {/* Timeline Component (New Horizontal Version) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Linha do Tempo Penal
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  Pena Total: 5a 4m
                </Badge>
              </div>
              <CardDescription>
                Visualização cronológica de eventos, progressões e incidentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorizontalTimeline 
                events={mockTimeline} 
                onEventClick={setSelectedEvent}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dossiê Jurídico</CardTitle>
              <CardDescription>Informações consolidadas do processo de execução.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="situacao">
                <AccordionItem value="situacao">
                  <AccordionTrigger className="text-lg font-semibold text-primary">Situação da Pena</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/20 rounded-lg border">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Pena Total</span>
                        <p className="text-xl font-bold mt-1">5 anos e 4 meses</p>
                      </div>
                      <div className="p-4 bg-muted/20 rounded-lg border">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Pena Cumprida</span>
                        <p className="text-xl font-bold mt-1 text-success">1 ano e 2 meses</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="compliance">
                  <AccordionTrigger className="text-lg font-semibold text-primary">Compliance</AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
                      <h4 className="font-semibold text-destructive mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Alerta de Benefício Vencido
                      </h4>
                      <p className="text-sm text-destructive/80">
                        Detectado possível atraso na concessão de saída temporária. Verifique a aba de Compliance para mais detalhes.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="audit">
                  <AccordionTrigger 
                    className="text-lg font-semibold text-primary"
                    onClick={() => { if(auditLogs.length === 0) fetchLogs() }}
                  >
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Auditoria (DynamoDB)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Registros imutáveis de acesso e modificação.
                        </p>
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                          <ShieldCheck className="h-3 w-3" /> AWS DynamoDB
                        </Badge>
                      </div>
                      
                      {isLoadingLogs ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-[140px]">Data/Hora</TableHead>
                                <TableHead>Ação</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Detalhes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {auditLogs.map((log, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="text-xs font-mono">
                                    {new Date(log.Timestamp).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="font-medium text-xs">
                                    {log.ActionType}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {log.User} <span className="opacity-50">({log.Role})</span>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={log.Details}>
                                    {log.Details}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {auditLogs.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                    Nenhum log encontrado.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Evento Penal – Prova Digital
            </DialogTitle>
            <DialogDescription>
              Detalhes técnicos e jurídicos do evento selecionado.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Tipo</span>
                  <p className="text-sm font-medium">{selectedEvent.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Data</span>
                  <p className="text-sm font-medium">{selectedEvent.date}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Origem</span>
                  <p className="text-sm font-medium">{selectedEvent.origin}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Detalhes</span>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{selectedEvent.details}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Hash ICP-Brasil (Imutável)
                </span>
                <code className="text-xs font-mono break-all bg-background p-2 rounded border block select-all">
                  {selectedEvent.hashICP}
                </code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
