import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 
  | 'JUIZ' 
  | 'PROMOTOR' 
  | 'DEFENSOR' 
  | 'ANALISTA' 
  | 'DIRETOR' 
  | 'AGENTE' 
  | 'INTELIGENCIA' 
  | 'CORREGEDORIA' 
  | 'ADMIN'
  | 'POLICIA';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users Database
const MOCK_USERS: Record<UserRole, User> = {
  JUIZ: { id: 'u1', name: 'Dr. Silva', role: 'JUIZ', email: 'juiz.silva@tj.jus.br', avatar: 'JS' },
  PROMOTOR: { id: 'u2', name: 'Dra. Helena', role: 'PROMOTOR', email: 'helena.mp@mp.jus.br', avatar: 'HM' },
  DEFENSOR: { id: 'u3', name: 'Dr. André', role: 'DEFENSOR', email: 'andre.def@dp.jus.br', avatar: 'AD' },
  ANALISTA: { id: 'u4', name: 'Ana Paula', role: 'ANALISTA', email: 'ana.paula@tj.jus.br', avatar: 'AP' },
  DIRETOR: { id: 'u5', name: 'Diretor Rocha', role: 'DIRETOR', email: 'rocha.dir@sap.gov.br', avatar: 'DR' },
  AGENTE: { id: 'u6', name: 'Agente Souza', role: 'AGENTE', email: 'souza.pp@sap.gov.br', avatar: 'AS' },
  INTELIGENCIA: { id: 'u7', name: 'Agente P2', role: 'INTELIGENCIA', email: 'intel@sap.gov.br', avatar: 'P2' },
  CORREGEDORIA: { id: 'u8', name: 'Corregedor Lima', role: 'CORREGEDORIA', email: 'corregedoria@sap.gov.br', avatar: 'CL' },
  ADMIN: { id: 'u0', name: 'Administrador', role: 'ADMIN', email: 'admin@sistema.gov.br', avatar: 'AD' },
  POLICIA: { id: 'u9', name: 'Policial Civil', role: 'POLICIA', email: 'pc@policia.gov.br', avatar: 'PC' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Persistência simples via localStorage para não perder login no refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('sip_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: UserRole) => {
    const mockUser = MOCK_USERS[role];
    setUser(mockUser);
    localStorage.setItem('sip_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sip_user');
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // Admin acessa tudo
    if (allowedRoles.includes('ALL' as any)) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
