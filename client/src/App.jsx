import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login                 from './pages/Login';
import StudentDashboard      from './pages/StudentDashboard';
import SubmitComplaint       from './pages/SubmitComplaint';
import MyComplaints          from './pages/MyComplaints';
import ComplaintDetails      from './pages/ComplaintDetails';
import AdminDashboard        from './pages/AdminDashboard';
import AdminComplaints       from './pages/AdminComplaints';
import AdminComplaintDetails from './pages/AdminComplaintDetails';
import HodDashboard          from './pages/HodDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
  if (user.role === 'hod')     return <Navigate to="/hod/dashboard"     replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<RoleRedirect />} />

          {/* ── Student ─────────────────────────────────────────────────── */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/submit" element={
            <ProtectedRoute allowedRoles={['student']}><SubmitComplaint /></ProtectedRoute>
          } />
          <Route path="/student/complaints" element={
            <ProtectedRoute allowedRoles={['student']}><MyComplaints /></ProtectedRoute>
          } />
          <Route path="/student/complaints/:id" element={
            <ProtectedRoute allowedRoles={['student']}><ComplaintDetails /></ProtectedRoute>
          } />

          {/* ── Admin ───────────────────────────────────────────────────── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminComplaints /></ProtectedRoute>
          } />
          <Route path="/admin/complaints/:id" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminComplaintDetails /></ProtectedRoute>
          } />

          {/* ── HOD ─────────────────────────────────────────────────────── */}
          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRoles={['hod']}><HodDashboard /></ProtectedRoute>
          } />
          {/* HOD uses AdminComplaintDetails (same UI, same controls) */}
          <Route path="/hod/complaints/:id" element={
            <ProtectedRoute allowedRoles={['hod']}><AdminComplaintDetails /></ProtectedRoute>
          } />
          <Route path="/hod/escalated" element={
            <ProtectedRoute allowedRoles={['hod']}><HodDashboard /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
