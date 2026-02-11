import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GovHeader } from "@/components/layout/GovHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Search, User, Link as LinkIcon, AlertTriangle, 
  CheckCircle2, Fingerprint, ShieldAlert
} from "lucide-react";
import { mockMasterEntities, MasterEntity, EntityRole } from "@/data/mockData";

export function EntityMasterIndex() {
  const navigate = useNavigate();
  const [searchTerm, setSearchText] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<MasterEntity | null>(null);
  const [roleFilter, setRoleFilter] = useState<EntityRole | 'Todos'>('Todos');

  const filteredEntities = mockMasterEntities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entity.cpf.includes(searchTerm);
    const matchesRole = roleFilter === 'Todos' || entity.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: EntityRole) => {
    switch(role) {
      case 'Detento': return 'bg-red-100 text-red-800 border-red-200';
      case 'Visitante': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Advogado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Funcionário': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <GovHeader 
        title="Cadastro Mestre de Entidades (MEI)" 
        description="Base unificada de pessoas físicas e jurídicas. Visão 360º de relacionamentos, histórico de papéis e alertas de inteligência."
        breadcrumbs={[
          { label: "Visão Geral", href: "/dashboard" },
          { label: "Inteligência" },
          { label: "Cadastro Mestre" }
        ]}
      />

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por Nome, CPF, Matrícula ou OAB..." 
            className="pl-10 h-12 text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['Todos', 'Detento', 'Visitante', 'Advogado', 'Funcionário'].map((role) => (
            <Button 
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              onClick={() => setRoleFilter(role as any)}
              className="whitespace-nowrap"
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((entity) => (
          <Card 
            key={entity.id} 
            className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary group"
            onClick={() => setSelectedEntity(entity)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage src={entity.photoUrl} />
                  <AvatarFallback>{entity.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{entity.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono mb-2">{entity.cpf}</p>
                  <div className="flex flex-wrap gap-2">
                    {entity.roles.map(role => (
                      <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {entity.alerts.length > 0 && (
                <div className="mt-4 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{entity.alerts.length} Alerta(s) de Inteligência</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredEntities.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma entidade encontrada</p>
            <p className="text-sm">Tente ajustar os termos de busca ou filtros.</p>
          </div>
        )}
      </div>

      {/* Entity Details Dialog (Golden Record View) */}
      <Dialog open={!!selectedEntity} onOpenChange={(open) => !open && setSelectedEntity(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {selectedEntity && (
            <>
              {/* Header */}
              <div className="p-6 bg-[#071D41] text-white flex flex-col md:flex-row gap-6 items-center md:items-start shrink-0">
                <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={selectedEntity.photoUrl} />
                  <AvatarFallback>{selectedEntity.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <DialogTitle className="text-2xl font-bold">{selectedEntity.name}</DialogTitle>
                  <DialogDescription className="sr-only">
                    Detalhes completos do cadastro mestre da entidade {selectedEntity.name}.
                  </DialogDescription>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center opacity-90 text-sm">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{selectedEntity.cpf}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> ID Biométrico: {selectedEntity.biometricsId}</span>
                    <span>•</span>
                    <span className={`font-bold ${selectedEntity.status === 'Ativo' ? 'text-green-400' : 'text-gray-400'}`}>
                      {selectedEntity.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    {selectedEntity.roles.map(role => (
                      <Badge key={role} className="bg-white text-[#071D41] hover:bg-white/90">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block text-right text-xs opacity-60">
                  <p>Última Atualização</p>
                  <p className="font-mono">{selectedEntity.lastUpdate}</p>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col">
                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                  <div className="px-6 pt-4 bg-white border-b">
                    <TabsList className="w-full justify-start h-12 bg-transparent p-0 space-x-6">
                      <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 bg-transparent">Visão Geral</TabsTrigger>
                      <TabsTrigger value="relationships" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 bg-transparent">Relacionamentos ({selectedEntity.relationships.length})</TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 bg-transparent">Histórico de Papéis</TabsTrigger>
                      <TabsTrigger value="alerts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 bg-transparent flex gap-2">
                        Alertas 
                        {selectedEntity.alerts.length > 0 && <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">{selectedEntity.alerts.length}</Badge>}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" /> Dados Pessoais
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Nome Completo</span>
                              <span className="font-medium">{selectedEntity.name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">CPF</span>
                              <span className="font-medium font-mono">{selectedEntity.cpf}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Endereço Principal</span>
                              <span className="font-medium text-right max-w-[200px]">{selectedEntity.address}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Fingerprint className="h-4 w-4 text-primary" /> Biometria & Identificação
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-bold text-green-800">Biometria Confirmada</p>
                                <p className="text-xs text-green-700">Conferido com base ABIS Nacional em 10/01/2024</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>• Impressões Digitais: Coletadas (10 dedos)</p>
                              <p>• Reconhecimento Facial: Alta Qualidade</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="relationships" className="mt-0">
                      <div className="space-y-4">
                        {selectedEntity.relationships.map((rel, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                {rel.targetName.substring(0,2)}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{rel.targetName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3" /> {rel.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{rel.date}</Badge>
                              {rel.details && <p className="text-xs text-muted-foreground mt-1">{rel.details}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6 py-2">
                        {selectedEntity.roles.includes('Detento') && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                            <h4 className="font-bold text-sm text-slate-800">Ingresso como Detento</h4>
                            <p className="text-xs text-muted-foreground">10/05/2024 • Unidade Prisional Regional</p>
                            <p className="text-sm mt-1 bg-slate-100 p-2 rounded">Art. 157 - Roubo Majorado</p>
                          </div>
                        )}
                        {selectedEntity.roles.includes('Visitante') && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                            <h4 className="font-bold text-sm text-slate-800">Cadastro como Visitante</h4>
                            <p className="text-xs text-muted-foreground">15/03/2022 • Visitante de "Irmão"</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-0">
                      {selectedEntity.alerts.length > 0 ? (
                        <div className="space-y-3">
                          {selectedEntity.alerts.map((alert, idx) => (
                            <div key={idx} className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-bold text-sm">Alerta de Inteligência</h4>
                                <p className="text-sm">{alert}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                          <p>Nenhum alerta de inteligência ativo para esta entidade.</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
