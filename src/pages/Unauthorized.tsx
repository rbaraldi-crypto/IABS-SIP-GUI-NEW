import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Unauthorized() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
            <div className="h-32 w-32 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="h-16 w-16 text-red-600" />
            </div>
            <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-2xl">🚫</div>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Acesso Negado</h1>
            <p className="text-slate-600">
                O perfil <strong>{user?.role}</strong> não possui permissão para acessar este módulo.
            </p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm text-sm text-left space-y-2">
            <p><strong>Motivo:</strong> Política de Segurança (RBAC).</p>
            <p><strong>Ação:</strong> Esta tentativa de acesso foi registrada nos logs de auditoria.</p>
        </div>

        <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" /> Trocar Usuário
            </Button>
        </div>
      </div>
    </div>
  );
}
