import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import ViewReports from './pages/ViewReports';
import WeeklyReport from './pages/WeeklyReport';
import MonthlyReport from './pages/MonthlyReport';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Members from './pages/Members';
import ResetPasswordAdmin from './pages/ResetPasswordAdmin';
import MaintenanceMode from './pages/MaintenanceMode';
import SystemBackup from './pages/SystemBackup';
import MaintenancePage from './pages/MaintenancePage';
import ReportManager from './pages/ReportManager';
import Layout from './components/layout/Layout';
import axios from 'axios';

// Setup axios interceptor for maintenance mode
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503 && error.response?.data?.maintenanceMode) {
      // Check if user is admin
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        window.location.href = '/maintenance';
      }
    }
    return Promise.reject(error);
  }
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/report-form" element={
            <PrivateRoute>
              <ReportForm />
            </PrivateRoute>
          } />
          <Route path="/view-reports" element={
            <PrivateRoute>
              <ViewReports />
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <ViewReports />
            </PrivateRoute>
          } />
          <Route path="/weekly-report" element={
            <PrivateRoute>
              <WeeklyReport />
            </PrivateRoute>
          } />
          <Route path="/monthly-report" element={
            <PrivateRoute>
              <MonthlyReport />
            </PrivateRoute>
          } />
          <Route path="/members" element={
            <PrivateRoute>
              <Members />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          <Route path="/reset-password-admin" element={
            <PrivateRoute>
              <ResetPasswordAdmin />
            </PrivateRoute>
          } />
          <Route path="/maintenance-mode" element={
            <PrivateRoute>
              <MaintenanceMode />
            </PrivateRoute>
          } />
          <Route path="/system-backup" element={
            <PrivateRoute>
              <SystemBackup />
            </PrivateRoute>
          } />
          <Route path="/report-manager" element={
            <PrivateRoute>
              <ReportManager />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
