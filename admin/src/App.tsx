import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Blog from './pages/Blog';
import BlogEdit from './pages/BlogEdit';
import Regions from './pages/Regions';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Certificates from './pages/Certificates';
import Users from './pages/Users';
import { isAuthenticated, hasRole } from './lib/auth';
import { LangProvider } from './lib/LangContext';
import { ThemeProvider } from './lib/ThemeContext';

function PrivateRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/new" element={<BlogEdit />} />
              <Route path="blog/:id/edit" element={<BlogEdit />} />
              <Route path="regions" element={<Regions />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
              <Route
                path="users"
                element={
                  <RoleRoute roles={['admin']}>
                    <Users />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  );
}
