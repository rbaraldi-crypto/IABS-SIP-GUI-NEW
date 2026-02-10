import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, Sun, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AccessibilityBar() {
  const { 
    highContrast, 
    toggleHighContrast, 
    increaseFontSize, 
    decreaseFontSize, 
    resetAccessibility,
    fontSize
  } = useAccessibility();

  return (
    <div className="bg-[#051530] border-b border-white/10 px-4 py-1 flex justify-between items-center text-white text-xs z-50 relative">
      <div className="flex items-center gap-4">
        <span className="font-bold uppercase tracking-wider opacity-70 hidden sm:inline-block">Acessibilidade</span>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 px-2 text-white hover:bg-white/20 ${highContrast ? 'bg-yellow-400 text-black font-bold hover:bg-yellow-500' : ''}`}
                  onClick={toggleHighContrast}
                >
                  {highContrast ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                  Alto Contraste
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Alternar modo de alto contraste (Cores invertidas)</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-white/20 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={decreaseFontSize}>
                  <Minus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Diminuir fonte</p></TooltipContent>
            </Tooltip>

            <span className="w-8 text-center font-mono">{fontSize}%</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={increaseFontSize}>
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Aumentar fonte</p></TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-white/20 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={resetAccessibility}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Restaurar padrão</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-2 opacity-60">
        <span className="text-[10px]">Atalhos: Ctrl + / Ctrl -</span>
      </div>
    </div>
  );
}
