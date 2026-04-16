import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardAdmin from './pages/DashboardAdmin';
import AddPatient from './pages/doctors/AddPatient';
import SelectPrediction from './pages/doctors/SelectPrediction';
import PredictICU from './pages/doctors/PredictICU';
import PredictLOS from './pages/doctors/PredictLOS';
import PredictionResults from './pages/doctors/PredictionResults';
import PatientHistory from './pages/doctors/PatientHistory';
import PatientHistoryDetail from './pages/doctors/PatientHistoryDetail';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes Wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Doctor Routes - Wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard/doctor" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardDoctor />
                </ProtectedRoute>
              } />
              <Route path="/patients/new" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <AddPatient />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id/select-prediction" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <SelectPrediction />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id/predict/icu" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PredictICU />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id/predict/los" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PredictLOS />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id/results" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PredictionResults />
                </ProtectedRoute>
              } />
              <Route path="/patients/history" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PatientHistory />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id/history" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PatientHistoryDetail />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardAdmin />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
