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

function isAuthenticated() {
  return !!localStorage.getItem('ecm_token');
}

function PrivateRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
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
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
