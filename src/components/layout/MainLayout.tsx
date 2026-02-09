import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AccessibilityBar } from './AccessibilityBar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barra de Acessibilidade Fixa no Topo */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <AccessibilityBar />
      </div>
      
      <div className="flex flex-1 pt-[33px]"> {/* Padding top para compensar a barra */}
        <Sidebar />
        <main className="pl-64 min-h-screen w-full">
          <div className="container mx-auto p-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
