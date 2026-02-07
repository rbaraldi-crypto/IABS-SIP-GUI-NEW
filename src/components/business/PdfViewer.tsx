import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Upload, Cloud, FileText, HardDrive, AlertCircle, 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Highlighter, 
  MessageSquarePlus, Trash2, Save, X
} from 'lucide-react';
import { s3Service, S3Object } from '@/services/awsMock';

// Configuração do Worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfViewerProps {
  caseId: string;
  onLogAction: (action: string, details: string) => void;
}

interface Annotation {
  id: string;
  pageNumber: number;
  text: string;
  comment: string;
  createdAt: string;
}

export function PdfViewer({ caseId, onLogAction }: PdfViewerProps) {
  // Removed unused sourceType state
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [isLoadingS3, setIsLoadingS3] = useState(false);
  const [s3Files, setS3Files] = useState<S3Object[]>([]);
  const [localFileName, setLocalFileName] = useState<string>("");

  // PDF State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfError, setPdfError] = useState<boolean>(false);

  // Annotation State
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selection, setSelection] = useState<{text: string, page: number} | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar lista do S3
  const handleTabChange = async (val: string) => {
    if (val === 's3' && s3Files.length === 0) {
      setIsLoadingS3(true);
      try {
        const files = await s3Service.listObjects(caseId);
        setS3Files(files);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingS3(false);
      }
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setCurrentPdfUrl(url);
      setLocalFileName(file.name);
      setPdfError(false);
      setPageNumber(1);
      onLogAction("VIEW_LOCAL_FILE", `Visualização de arquivo local: ${file.name}`);
    } else {
      alert("Por favor selecione um arquivo PDF válido.");
    }
  };

  const handleSelectS3File = (file: S3Object) => {
    setCurrentPdfUrl(file.Url);
    setPdfError(false);
    setPageNumber(1);
    onLogAction("VIEW_S3_FILE", `Download e visualização do S3: ${file.Key}`);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfError(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Erro ao carregar PDF:", error);
    setPdfError(true);
  }

  // Lógica de Seleção de Texto
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        // Verifica se a seleção está dentro do container do PDF
        if (containerRef.current && containerRef.current.contains(sel.anchorNode)) {
          setSelection({
            text: sel.toString().trim(),
            page: pageNumber
          });
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [pageNumber]);

  const handleAddAnnotation = () => {
    if (!selection) return;
    setIsAnnotating(true);
  };

  const handleSaveAnnotation = () => {
    if (!selection) return;
    
    const newAnnotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      pageNumber: selection.page,
      text: selection.text,
      comment: newComment,
      createdAt: new Date().toISOString()
    };

    setAnnotations([...annotations, newAnnotation]);
    setIsAnnotating(false);
    setNewComment("");
    setSelection(null);
    window.getSelection()?.removeAllRanges(); // Limpa seleção visual
    
    onLogAction("ADD_ANNOTATION", `Anotação criada na pág. ${selection.page}`);
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Bar: Source Selection */}
      <div className="flex-none">
        <Tabs defaultValue="s3" onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="s3" className="gap-2">
              <Cloud className="h-4 w-4" /> Repositório S3 (AWS)
            </TabsTrigger>
            <TabsTrigger value="local" className="gap-2">
              <HardDrive className="h-4 w-4" /> Arquivo Local
            </TabsTrigger>
          </TabsList>

          <TabsContent value="s3" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {isLoadingS3 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {s3Files.map((file, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-accent ${currentPdfUrl === file.Url ? 'bg-accent border-primary' : ''}`}
                          onClick={() => handleSelectS3File(file)}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-4 w-4 text-red-500 shrink-0" />
                            <span className="text-sm truncate">{file.Key.split('/').pop()}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(file.Size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                      {s3Files.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-4">
                          Nenhum arquivo encontrado no bucket para este caso.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="local" className="mt-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10">
                <Input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleLocalFileChange}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Selecionar PDF do Computador
                </Button>
                {localFileName && (
                  <p className="mt-2 text-sm font-medium text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" /> {localFileName}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content Area: PDF + Annotations */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        {/* PDF Viewer Column */}
        <div className="flex-1 flex flex-col bg-slate-100 rounded-lg border overflow-hidden relative">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 bg-white border-b shadow-sm z-10">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" size="icon" 
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                Pág {pageNumber} de {numPages || '--'}
              </span>
              <Button 
                variant="ghost" size="icon" 
                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {selection && !isAnnotating && (
               <Button 
                size="sm" 
                className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white animate-in fade-in zoom-in"
                onClick={handleAddAnnotation}
               >
                 <Highlighter className="h-4 w-4" />
                 Grifar Seleção
               </Button>
            )}
          </div>

          {/* PDF Render Area */}
          <div className="flex-1 overflow-auto flex justify-center p-4 bg-slate-200/50" ref={containerRef}>
            {currentPdfUrl ? (
              !pdfError ? (
                <Document
                  file={currentPdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex flex-col items-center gap-2 mt-20">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Carregando documento...</p>
                    </div>
                  }
                  className="shadow-lg"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderTextLayer={true} 
                    renderAnnotationLayer={true}
                    className="bg-white"
                  />
                </Document>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                   <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                   <p>Não foi possível renderizar o PDF nativamente (Erro de CORS ou Arquivo Inválido).</p>
                   <Button variant="outline" onClick={() => window.open(currentPdfUrl, '_blank')}>
                     Abrir em Nova Aba (Fallback)
                   </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="h-16 w-16 opacity-20 mb-4" />
                <p>Selecione um arquivo acima para visualizar</p>
              </div>
            )}
          </div>
        </div>

        {/* Annotations Sidebar */}
        <div className="w-80 flex flex-col border rounded-lg bg-background shadow-sm">
          <div className="p-3 border-b bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Anotações & Grifos
            </h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            {/* New Annotation Form */}
            {isAnnotating && (
              <Card className="mb-4 border-yellow-400 bg-yellow-50/50 animate-in slide-in-from-top-2">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-xs font-bold text-yellow-700 uppercase">Novo Grifo (Pág. {selection?.page})</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="text-xs italic text-muted-foreground border-l-2 border-yellow-300 pl-2 line-clamp-3">
                    "{selection?.text}"
                  </div>
                  <Textarea 
                    placeholder="Adicione um comentário..." 
                    className="h-20 text-xs bg-white"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsAnnotating(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={handleSaveAnnotation} className="gap-1">
                      <Save className="h-3 w-3" /> Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* List */}
            <div className="space-y-3">
              {annotations.length > 0 ? (
                annotations.map((ann) => (
                  <div key={ann.id} className="group relative bg-card border rounded-lg p-3 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px]">Pág. {ann.pageNumber}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ann.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-xs italic text-foreground/80 border-l-2 border-primary/30 pl-2 mb-2 bg-muted/10 p-1 rounded-r">
                      "{ann.text}"
                    </div>
                    
                    {ann.comment && (
                      <p className="text-sm text-foreground font-medium">
                        {ann.comment}
                      </p>
                    )}

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteAnnotation(ann.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                !isAnnotating && (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>Selecione um texto no PDF para criar um grifo ou anotação.</p>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <div className="flex-none text-xs text-muted-foreground flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        <span>As anotações são salvas localmente nesta sessão. Para persistência, integre com o backend.</span>
      </div>
    </div>
  );
}
