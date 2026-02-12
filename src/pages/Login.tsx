import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Gavel, Users, Lock, Eye, Siren, Briefcase, Network } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('JUIZ');
  const [isLoading, setIsLoading] = useState(false);

  // Recupera a página que o usuário tentou acessar antes de ser redirecionado
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simula delay de rede
    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 800);
  };

  const roleIcons: Record<string, any> = {
    JUIZ: Gavel,
    PROMOTOR: Briefcase,
    DEFENSOR: Users,
    DIRETOR: Lock,
    AGENTE: Siren,
    INTELIGENCIA: Network,
    CORREGEDORIA: Eye,
    ADMIN: ShieldCheck
  };

  const SelectedIcon = roleIcons[selectedRole] || Users;

  return (
    <div className="min-h-screen bg-[#051530] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/10 text-white mb-4 border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">IABS-SIP</h1>
          <p className="text-blue-200 mt-2">Sistema Integrado Penitenciário</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-[#071D41]">Acesso Restrito</CardTitle>
            <CardDescription>Selecione seu perfil para entrar no ambiente de demonstração.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label>Perfil de Acesso</Label>
                <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUIZ">Juiz da Execução</SelectItem>
                    <SelectItem value="PROMOTOR">Promotor de Justiça (MP)</SelectItem>
                    <SelectItem value="DEFENSOR">Defensor Público</SelectItem>
                    <SelectItem value="ANALISTA">Analista Judiciário</SelectItem>
                    <SelectItem value="DIRETOR">Diretor de Unidade</SelectItem>
                    <SelectItem value="AGENTE">Polícia Penal (Agente)</SelectItem>
                    <SelectItem value="INTELIGENCIA">Inteligência (P2)</SelectItem>
                    <SelectItem value="CORREGEDORIA">Corregedoria / Auditoria</SelectItem>
                    <SelectItem value="ADMIN">Administrador do Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                  <SelectedIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Modo Simulação</p>
                  <p className="text-xs text-slate-500">Você entrará com permissões de {selectedRole}.</p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-[#071D41] hover:bg-[#1351B4] transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-4 bg-slate-50/50">
            <p className="text-xs text-muted-foreground text-center">
              Acesso monitorado. Todas as ações são registradas em log de auditoria (DynamoDB).
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
