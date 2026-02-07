import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  pt: {
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Perfil do Apenado',
    'nav.compliance': 'Compliance & Alertas',
    'nav.precedents': 'Precedentes',
    'nav.hitl': 'Ação Humana (HITL)',
    'nav.mycases': 'Meus Casos',
    'sys.online': 'Online',
    'sys.latency': 'Latência Alta',
    'sys.offline': 'Offline',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Inmate Profile',
    'nav.compliance': 'Compliance & Alerts',
    'nav.precedents': 'Precedents',
    'nav.hitl': 'Human Action (HITL)',
    'nav.mycases': 'My Cases',
    'sys.online': 'Online',
    'sys.latency': 'High Latency',
    'sys.offline': 'Offline',
  },
  es: {
    'nav.dashboard': 'Panel de Control',
    'nav.profile': 'Perfil del Recluso',
    'nav.compliance': 'Cumplimiento y Alertas',
    'nav.precedents': 'Precedentes',
    'nav.hitl': 'Acción Humana (HITL)',
    'nav.mycases': 'Mis Casos',
    'sys.online': 'En Línea',
    'sys.latency': 'Alta Latencia',
    'sys.offline': 'Desconectado',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
