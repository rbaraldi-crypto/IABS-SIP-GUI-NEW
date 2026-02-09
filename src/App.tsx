import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { Compliance } from '@/pages/Compliance';
import { Precedents } from '@/pages/Precedents';
import { HITL } from '@/pages/HITL';
import { MyCases } from '@/pages/MyCases';
import { CaseReview } from '@/pages/CaseReview';
import { CaseDistribution } from '@/pages/CaseDistribution';
import { CoordinatorDistribution } from '@/pages/CoordinatorDistribution';
import { StatsDashboard } from '@/pages/StatsDashboard';
import { CitizenPortal } from '@/pages/CitizenPortal';
import { InmatePortal } from '@/pages/InmatePortal';
import { ControlRoom } from '@/pages/ControlRoom';
import { ContingencyPlan } from '@/pages/ContingencyPlan';
import { ShiftLog } from '@/pages/ShiftLog';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Rotas Públicas / Standalone */}
            <Route path="/cidadao" element={<CitizenPortal />} />
            <Route path="/apenado" element={<InmatePortal />} />

            {/* Main Layout Routes (Internal System) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="meus-casos" element={<MyCases />} />
              <Route path="meus-casos/:id" element={<CaseReview />} />
              <Route path="perfil/:id" element={<Profile />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="precedentes" element={<Precedents />} />
              <Route path="acao-humana" element={<HITL />} />
              <Route path="acao-humana/:taskId" element={<HITL />} />
              
              {/* Control & Management Routes */}
              <Route path="distribuicao" element={<CaseDistribution />} />
              <Route path="coordenador" element={<CoordinatorDistribution />} />
              <Route path="estatisticas" element={<StatsDashboard />} />
              <Route path="plano-contingencia" element={<ContingencyPlan />} />
              <Route path="controle" element={<ControlRoom />} />
              <Route path="ocorrencias" element={<ShiftLog />} />
              <Route path="calculadora" element={<CalculatorPage />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}

export default App;
