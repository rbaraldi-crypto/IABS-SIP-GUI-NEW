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
import { EntityMasterIndex } from '@/pages/EntityMasterIndex';
import { HearingCalendar } from '@/pages/HearingCalendar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Unauthorized } from '@/pages/Unauthorized';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/cidadao" element={<CitizenPortal />} />
              <Route path="/apenado" element={<InmatePortal />} />

              {/* Rotas Protegidas (Sistema Interno) */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard: Acesso Geral */}
                <Route path="dashboard" element={<Dashboard />} />

                {/* Módulo Judicial - RESTRITO (Agentes NÃO acessam) */}
                <Route path="meus-casos" element={
                  <ProtectedRoute allowedRoles={['JUIZ', 'PROMOTOR', 'DEFENSOR', 'ANALISTA', 'ADMIN']}>
                    <MyCases />
                  </ProtectedRoute>
                } />
                <Route path="meus-casos/:id" element={
                  <ProtectedRoute allowedRoles={['JUIZ', 'PROMOTOR', 'DEFENSOR', 'ANALISTA', 'ADMIN']}>
                    <CaseReview />
                  </ProtectedRoute>
                } />
                <Route path="pauta-audiencias" element={
                  <ProtectedRoute allowedRoles={['JUIZ', 'ANALISTA', 'DIRETOR', 'ADMIN']}>
                    <HearingCalendar />
                  </ProtectedRoute>
                } />
                <Route path="acao-humana" element={
                  <ProtectedRoute allowedRoles={['JUIZ', 'PROMOTOR', 'DEFENSOR', 'ANALISTA', 'ADMIN']}>
                    <HITL />
                  </ProtectedRoute>
                } />
                <Route path="acao-humana/:taskId" element={
                  <ProtectedRoute allowedRoles={['JUIZ', 'PROMOTOR', 'DEFENSOR', 'ANALISTA', 'ADMIN']}>
                    <HITL />
                  </ProtectedRoute>
                } />

                {/* Ferramentas de Apoio (Acesso Geral) */}
                <Route path="precedentes" element={<Precedents />} />
                <Route path="calculadora" element={<CalculatorPage />} />

                {/* Módulo Operacional / Prisional */}
                <Route path="perfil/:id" element={<Profile />} />
                <Route path="ocorrencias" element={
                  <ProtectedRoute allowedRoles={['AGENTE', 'DIRETOR', 'CORREGEDORIA', 'ADMIN']}>
                    <ShiftLog />
                  </ProtectedRoute>
                } />
                <Route path="distribuicao" element={
                  <ProtectedRoute allowedRoles={['DIRETOR', 'ANALISTA', 'ADMIN']}>
                    <CaseDistribution />
                  </ProtectedRoute>
                } />
                <Route path="coordenador" element={
                  <ProtectedRoute allowedRoles={['DIRETOR', 'ADMIN']}>
                    <CoordinatorDistribution />
                  </ProtectedRoute>
                } />
                <Route path="plano-contingencia" element={
                  <ProtectedRoute allowedRoles={['DIRETOR', 'JUIZ', 'ADMIN']}>
                    <ContingencyPlan />
                  </ProtectedRoute>
                } />

                {/* Módulo Inteligência & Controle */}
                <Route path="estatisticas" element={
                  <ProtectedRoute allowedRoles={['DIRETOR', 'JUIZ', 'INTELIGENCIA', 'CORREGEDORIA', 'ADMIN']}>
                    <StatsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="cadastro-mestre" element={
                  <ProtectedRoute allowedRoles={['INTELIGENCIA', 'DIRETOR', 'JUIZ', 'POLICIA', 'ADMIN']}>
                    <EntityMasterIndex />
                  </ProtectedRoute>
                } />
                <Route path="compliance" element={
                  <ProtectedRoute allowedRoles={['CORREGEDORIA', 'JUIZ', 'PROMOTOR', 'DIRETOR', 'ADMIN']}>
                    <Compliance />
                  </ProtectedRoute>
                } />
                <Route path="controle" element={
                  <ProtectedRoute allowedRoles={['CORREGEDORIA', 'ADMIN']}>
                    <ControlRoom />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
            <Toaster />
          </Router>
        </LanguageProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
