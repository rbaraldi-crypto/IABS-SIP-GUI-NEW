import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  FileText, Search, Stamp, Eraser, 
  Eye, AlertCircle, ShieldCheck, Lock,
  MoreVertical, Download, Printer, ExternalLink, Gavel, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CaseDocument } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Configuração do Worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export interface EvidenceItem {
  id: string;
  pageIndex: number;
  label: string;
  documentTitle: string;
  status: 'pending' | 'admitted';
}

interface DigitalDossierProps {
  documents: CaseDocument[];
  onLogAction: (action: string, details: string) => void;
  onAdmitEvidence?: (evidence: EvidenceItem) => void;
}

interface Redaction {
  id: string;
  pageIndex: number; // Global Page Index
  x: number;
  y: number;
  w: number;
  h: number;
}

interface EvidenceStamp {
  id: string;
  pageIndex: number;
  label: string;
  x: number;
  y: number;
  status: 'pending' | 'admitted';
}

export function DigitalDossier({ documents, onLogAction, onAdmitEvidence }: DigitalDossierProps) {
  // --- State Management ---
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [currentPageInDoc, setCurrentPageInDoc] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [toolMode, setToolMode] = useState<'view' | 'redact' | 'evidence'>('view');
  
  // Annotations State
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [evidences, setEvidences] = useState<EvidenceStamp[]>([]);
  
  // Search State
  const [searchText, setSearchText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Derived Data ---
  const currentDoc = documents[currentDocIndex];
  const totalGlobalPages = documents.reduce((acc, doc) => acc + doc.pages, 0);
  
  // Calculate Global Page Number based on current doc and page
  const currentGlobalPage = documents.slice(0, currentDocIndex).reduce((acc, doc) => acc + doc.pages, 0) + currentPageInDoc;

  // --- Navigation Handlers ---
  const handleNextPage = () => {
    if (currentPageInDoc < currentDoc.pages) {
      setCurrentPageInDoc(prev => prev + 1);
    } else if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(prev => prev + 1);
      setCurrentPageInDoc(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageInDoc > 1) {
      setCurrentPageInDoc(prev => prev - 1);
    } else if (currentDocIndex > 0) {
      setCurrentDocIndex(prev => prev - 1);
      setCurrentPageInDoc(documents[currentDocIndex - 1].pages);
    }
  };

  const jumpToDoc = (index: number) => {
    setCurrentDocIndex(index);
    setCurrentPageInDoc(1);
  };

  // --- Tool Handlers ---
  const handlePageClick = (e: React.MouseEvent) => {
    if (toolMode === 'view') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale; // Normalize coords relative to scale
    const y = (e.clientY - rect.top) / scale;

    if (toolMode === 'redact') {
      const newRedaction: Redaction = {
        id: `redact-${Date.now()}`,
        pageIndex: currentGlobalPage,
        x: x - 50, // Center the box
        y: y - 15,
        w: 100,
        h: 30
      };
      setRedactions([...redactions, newRedaction]);
      onLogAction("ADD_REDACTION", `Tarja preta adicionada na pág. global ${currentGlobalPage}`);
    } else if (toolMode === 'evidence') {
      const newEvidence: EvidenceStamp = {
        id: `evid-${Date.now()}`,
        pageIndex: currentGlobalPage,
        label: `EVIDÊNCIA #${evidences.length + 1}`,
        x: x - 60,
        y: y - 20,
        status: 'pending'
      };
      setEvidences([...evidences, newEvidence]);
      onLogAction("MARK_EVIDENCE", `Página global ${currentGlobalPage} marcada como evidência.`);
    }
    
    // Reset to view mode after action (optional, keeps UX fluid)
    setToolMode('view');
  };

  const removeRedaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRedactions(redactions.filter(r => r.id !== id));
  };

  const removeEvidence = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvidences(evidences.filter(ev => ev.id !== id));
  };

  const handleAdmitEvidence = (evId: string) => {
    const evidence = evidences.find(e => e.id === evId);
    if (evidence && evidence.status === 'pending') {
      // Update local state
      const updatedEvidences = evidences.map(e => 
        e.id === evId ? { ...e, status: 'admitted' as const } : e
      );
      setEvidences(updatedEvidences);
      
      // Notify parent/audit
      onLogAction("ADMIT_EVIDENCE", `Evidência #${evidence.id} admitida formalmente nos autos.`);
      
      if (onAdmitEvidence) {
        onAdmitEvidence({
          id: evidence.id,
          pageIndex: evidence.pageIndex,
          label: evidence.label,
          documentTitle: currentDoc.title, // Note: This assumes evidence is on current doc, might need logic if admitting from list later
          status: 'admitted'
        });
      }
    }
  };

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      
      {/* LEFT SIDEBAR: INDEX / BUNDLE */}
      <div className="w-72 border-r bg-muted/10 flex flex-col shrink-0">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Índice do Processo
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {documents.length} documentos • {totalGlobalPages} páginas
          </p>
        </div>
        
        <div className="p-2 border-b">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input 
                    placeholder="Filtrar documentos..." 
                    className="h-8 pl-8 text-xs bg-background"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {documents.map((doc, idx) => {
                if (searchText && !doc.title.toLowerCase().includes(searchText.toLowerCase())) return null;
                
                const isActive = idx === currentDocIndex;
                const startPage = documents.slice(0, idx).reduce((acc, d) => acc + d.pages, 0) + 1;
                const endPage = startPage + doc.pages - 1;

                return (
                    <button
                        key={doc.id}
                        onClick={() => jumpToDoc(idx)}
                        className={cn(
                            "w-full text-left p-2 rounded-md text-xs transition-all flex items-start gap-2 group",
                            isActive ? "bg-primary/10 text-primary font-medium border border-primary/20" : "hover:bg-muted text-muted-foreground"
                        )}
                    >
                        <div className={cn(
                            "mt-0.5 h-2 w-2 rounded-full shrink-0",
                            doc.isEvidence ? "bg-red-500" : isActive ? "bg-primary" : "bg-slate-300"
                        )} />
                        <div className="flex-1 min-w-0">
                            <div className="truncate" title={doc.title}>{doc.title}</div>
                            <div className="flex justify-between mt-1 opacity-80">
                                <span>{doc.type}</span>
                                <span className="font-mono text-[10px]">Pág {startPage}-{endPage}</span>
                            </div>
                            {doc.tags && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {doc.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1 bg-background">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* CENTER: MAIN VIEWER */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/50 relative">
        
        {/* Toolbar */}
        <div className="h-12 border-b bg-white flex items-center justify-between px-4 shadow-sm z-10">
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={toolMode === 'view' ? 'secondary' : 'ghost'} 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setToolMode('view')}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modo Visualização</TooltipContent>
                    </Tooltip>
                    
                    <div className="h-4 w-px bg-border mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={toolMode === 'redact' ? 'destructive' : 'ghost'} 
                                size="icon" 
                                className={cn("h-8 w-8", toolMode === 'redact' && "bg-red-100 text-red-600 hover:bg-red-200")}
                                onClick={() => setToolMode('redact')}
                            >
                                <Eraser className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ferramenta de Redação (Tarja Preta)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={toolMode === 'evidence' ? 'default' : 'ghost'} 
                                size="icon" 
                                className={cn("h-8 w-8", toolMode === 'evidence' && "bg-blue-100 text-blue-600 hover:bg-blue-200")}
                                onClick={() => setToolMode('evidence')}
                            >
                                <Stamp className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Carimbar Evidência</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 px-3 py-1 rounded-full border">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevPage} disabled={currentGlobalPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-mono font-medium min-w-[100px] text-center">
                    Pág Global {currentGlobalPage} / {totalGlobalPages}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNextPage} disabled={currentGlobalPage === totalGlobalPages}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" /> Baixar PDF Original
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                            <Printer className="h-4 w-4" /> Imprimir Página
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {/* Document Render Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center" ref={containerRef}>
            <div 
                className={cn(
                    "relative shadow-lg transition-all duration-200 bg-white",
                    toolMode === 'redact' && "cursor-crosshair",
                    toolMode === 'evidence' && "cursor-copy"
                )}
                style={{ width: 'fit-content' }}
                onClick={handlePageClick}
            >
                {/* PDF Layer */}
                <Document
                    file={currentDoc.url}
                    loading={
                        <div className="flex items-center justify-center h-[800px] w-[600px] bg-white">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                <p className="text-sm text-muted-foreground">Carregando {currentDoc.title}...</p>
                            </div>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center h-[600px] w-full bg-white border border-destructive/20 p-6 gap-4">
                            <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                            <div className="text-center">
                                <p className="text-destructive font-medium text-lg">Erro ao carregar documento</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                    Não foi possível renderizar o PDF diretamente (Bloqueio de CORS ou Link Inválido).
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => window.open(currentDoc.url, '_blank')} className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Abrir em Nova Aba
                            </Button>
                        </div>
                    }
                >
                    <Page 
                        pageNumber={currentPageInDoc} 
                        scale={scale} 
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="border"
                    />
                </Document>

                {/* Overlay Layer for Redactions & Stamps */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Render Redactions */}
                    {redactions.filter(r => r.pageIndex === currentGlobalPage).map(r => (
                        <div
                            key={r.id}
                            className="absolute bg-black pointer-events-auto group hover:ring-2 hover:ring-red-500 transition-all"
                            style={{
                                left: r.x * scale,
                                top: r.y * scale,
                                width: r.w * scale,
                                height: r.h * scale,
                            }}
                        >
                            <button 
                                onClick={(e) => removeRedaction(r.id, e)}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover Tarja"
                            >
                                <Eraser className="h-3 w-3" />
                            </button>
                            <span className="text-[8px] text-white/50 absolute bottom-0.5 right-1 select-none">REDACTED</span>
                        </div>
                    ))}

                    {/* Render Evidence Stamps */}
                    {evidences.filter(e => e.pageIndex === currentGlobalPage).map(ev => (
                        <div
                            key={ev.id}
                            className="absolute pointer-events-auto group"
                            style={{
                                left: ev.x * scale,
                                top: ev.y * scale,
                            }}
                        >
                            <div className={cn(
                                "border-4 px-4 py-2 font-bold text-xl uppercase tracking-widest opacity-80 rotate-[-15deg] select-none bg-white/10 backdrop-blur-[1px] transition-colors",
                                ev.status === 'admitted' ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                            )}>
                                {ev.status === 'admitted' ? 'ADMITIDO' : ev.label}
                            </div>
                            <button 
                                onClick={(e) => removeEvidence(ev.id, e)}
                                className="absolute -top-4 -right-4 bg-slate-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Eraser className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer Info */}
        <div className="h-8 bg-white border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span>Documento assinado digitalmente por: <strong>{currentDoc.signedBy || "Desconhecido"}</strong></span>
            </div>
            <div>
                ID: {currentDoc.id} • Data: {currentDoc.date}
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: ANNOTATIONS LIST */}
      <div className="w-64 border-l bg-white flex flex-col shrink-0">
        <div className="p-4 border-b bg-muted/10">
            <h3 className="font-bold text-sm">Anotações & Evidências</h3>
        </div>
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
                
                {/* Evidence List */}
                <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Stamp className="h-3 w-3" /> Evidências Marcadas
                    </h4>
                    {evidences.length > 0 ? (
                        <div className="space-y-2">
                            {evidences.map(ev => (
                                <Card key={ev.id} className={cn("p-2 border", ev.status === 'admitted' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100")}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn("font-bold text-xs", ev.status === 'admitted' ? "text-green-700" : "text-red-700")}>
                                            {ev.label}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] bg-white">Pág {ev.pageIndex}</Badge>
                                    </div>
                                    
                                    {ev.status === 'pending' ? (
                                        <Button 
                                            size="sm" 
                                            className="w-full h-6 text-[10px] bg-red-600 hover:bg-red-700 text-white gap-1"
                                            onClick={() => handleAdmitEvidence(ev.id)}
                                        >
                                            <Gavel className="h-3 w-3" /> Admitir nos Autos
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold justify-center bg-green-100 p-1 rounded">
                                            <Check className="h-3 w-3" /> Admitida
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhuma evidência marcada.</p>
                    )}
                </div>

                <Separator />

                {/* Redactions List */}
                <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Redações (Sigilo)
                    </h4>
                    {redactions.length > 0 ? (
                        <div className="space-y-2">
                            {redactions.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-2 rounded bg-slate-100 border text-xs">
                                    <span>Tarja de Sigilo</span>
                                    <Badge variant="secondary" className="text-[9px]">Pág {r.pageIndex}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhuma área ocultada.</p>
                    )}
                </div>

            </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-yellow-50">
            <div className="flex gap-2 items-start text-xs text-yellow-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>As evidências admitidas são sincronizadas automaticamente com o Editor de Decisão.</p>
            </div>
        </div>
      </div>

    </div>
  );
}
