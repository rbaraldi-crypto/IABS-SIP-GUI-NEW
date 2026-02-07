import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Scale, FileText, Gavel, ShieldAlert, 
  Globe, Briefcase, Users, Building2, Eye, FileCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // Estrutura hierárquica por Tema/Órgão (Padrão Federal)
  const menuGroups = [
    {
      title: "Visão Geral",
      items: [
        { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { label: "Modo Cidadão (Público)", path: '/cidadao', icon: Users },
        { label: "Modo Controle (Auditoria)", path: '/controle', icon: Eye },
      ]
    },
    {
      title: "Órgão Judicial",
      items: [
        { label: t('nav.mycases'), path: '/meus-casos', icon: Briefcase },
        { label: t('nav.hitl'), path: '/acao-humana', icon: Gavel },
        { label: t('nav.precedents'), path: '/precedentes', icon: Scale },
      ]
    },
    {
      title: "Administração Penitenciária",
      items: [
        { label: t('nav.profile'), path: '/perfil/SIP-2024-8921', icon: User },
        { label: "Gestão de Vagas", path: '/distribuicao', icon: Building2 },
      ]
    },
    {
      title: "Compliance & Controle",
      items: [
        { label: t('nav.compliance'), path: '/compliance', icon: ShieldAlert },
        { label: "Relatórios Gerenciais", path: '/estatisticas', icon: FileCheck },
      ]
    }
  ];

  return (
    <div className="w-64 bg-[#071D41] text-white h-screen flex flex-col fixed left-0 top-0 border-r border-white/10 shadow-2xl z-50">
      <div className="p-6 border-b border-white/10 bg-[#051530]">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center text-[#071D41]">
                <Scale className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">IABS-SIP</h1>
                <p className="text-[10px] text-white/70 uppercase tracking-widest">Sistema Integrado</p>
            </div>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-blue-600 text-white shadow-md translate-x-1" 
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#051530] space-y-4">
        {/* Language Selector */}
        <div className="px-1">
            <div className="flex items-center gap-2 mb-2 text-[10px] text-white/60 uppercase font-semibold">
                <Globe className="h-3 w-3" /> Idioma / Language
            </div>
            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="h-8 bg-white/10 border-white/10 text-white text-xs">
                    <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pt">Português (BR)</SelectItem>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}
