import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardLayout from './components/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import CircularsPage from './pages/CircularsPage'
import QueryEnginePage from './pages/QueryEnginePage'
import AuditTrailPage from './pages/AuditTrailPage'
import RuleVerifierPage from './pages/RuleVerifierPage'
import RuleTimelinePage from './pages/RuleTimelinePage'
import ImpactAnalyzerPage from './pages/ImpactAnalyzerPage'
import DocumentsPage from './pages/DocumentsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Persistent Dashboard Shell with Stable Sidebar Layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="circulars" element={<CircularsPage />} />
            <Route path="rule-verifier" element={<RuleVerifierPage />} />
            <Route path="rule-timeline" element={<RuleTimelinePage />} />
            <Route path="impact-analyzer" element={<ImpactAnalyzerPage />} />
            <Route path="query-engine" element={<QueryEnginePage />} />
            <Route path="audit-trail" element={<AuditTrailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
