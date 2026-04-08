import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'sonner';
import { UserRole } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Grades from './pages/Grades';
import Periods from './pages/Periods';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.preferences?.theme) {
      document.documentElement.classList.toggle('dark', userProfile.preferences.theme === 'dark');
    }
  }, [userProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Shared routes with role-based content */}
          <Route path="subjects" element={<Subjects />} />
          <Route path="grades" element={<Grades />} />
          <Route path="periods" element={<Periods />} />
          <Route path="settings" element={<Settings />} />

          {/* Admin only routes */}
          <Route 
            path="admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* School only routes */}
          <Route 
            path="school" 
            element={
              <ProtectedRoute allowedRoles={['school']}>
                <div>School Management</div>
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
}
