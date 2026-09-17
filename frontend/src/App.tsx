import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from '@radix-ui/react-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import RiskPredictions from './pages/RiskPredictions'
import TreatmentEffectiveness from './pages/TreatmentEffectiveness'
import ClinicalDecisions from './pages/ClinicalDecisions'
import Analytics from './pages/Analytics'
import ModelManagement from './pages/ModelManagement'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster />
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/risk-predictions" element={<RiskPredictions />} />
              <Route path="/treatment-effectiveness" element={<TreatmentEffectiveness />} />
              <Route path="/clinical-decisions" element={<ClinicalDecisions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/models" element={<ModelManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </Router>
    </QueryClientProvider>
  )
}

export default App
