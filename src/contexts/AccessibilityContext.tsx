import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: number; // Porcentagem (ex: 100, 110, 120)
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  // Aplica o Alto Contraste
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Aplica o Tamanho da Fonte
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 150)); // Max 150%
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 80)); // Min 80%
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setFontSize(100);
  };

  return (
    <AccessibilityContext.Provider value={{ 
      highContrast, 
      toggleHighContrast, 
      fontSize, 
      increaseFontSize, 
      decreaseFontSize,
      resetAccessibility
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
