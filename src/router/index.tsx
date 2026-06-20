import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';
import { usePermission } from '@/hooks/usePermission';
import Login from '@/pages/login/Login';
import ForbiddenPage from '@/pages/403';
import NotFoundPage from '@/pages/404';
import DirectorLayout from '@/components/layout/DirectorLayout';
import FamilyLayout from '@/components/layout/FamilyLayout';
import CaregiverLayout from '@/components/layout/CaregiverLayout';
import DirectorDashboard from '@/pages/director/Dashboard';
import ElderList from '@/pages/director/ElderList';
import ElderDetail from '@/pages/director/ElderDetail';
import HealthMonitor from '@/pages/director/HealthMonitor';
import AlertCenter from '@/pages/director/AlertCenter';
import CareServices from '@/pages/director/CareServices';
import MedicationManage from '@/pages/director/MedicationManage';
import VisitManage from '@/pages/director/VisitManage';
import FinanceManage from '@/pages/director/FinanceManage';
import StaffManage from '@/pages/director/StaffManage';
import SystemSettings from '@/pages/director/SystemSettings';
import FamilyHome from '@/pages/family/FamilyHome';
import FamilyHealth from '@/pages/family/FamilyHealth';
import FamilyServices from '@/pages/family/FamilyServices';
import FamilyVisits from '@/pages/family/FamilyVisits';
import FamilyBills from '@/pages/family/FamilyBills';
import CaregiverTasks from '@/pages/caregiver/CaregiverTasks';
import CaregiverAlerts from '@/pages/caregiver/CaregiverAlerts';
import CaregiverMedication from '@/pages/caregiver/CaregiverMedication';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null;
  if (user && !allowedRoles.includes(user.role)) return <ForbiddenPage />;

  return <>{children}</>;
};

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleConfig[user.role]?.homePath || '/login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      <Route path="/director" element={<ProtectedRoute allowedRoles={['director', 'nurse', 'caregiver']}><DirectorLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={['director']}><DirectorDashboard /></ProtectedRoute>} />
        <Route path="elders" element={<ProtectedRoute allowedRoles={['director']}><ElderList /></ProtectedRoute>} />
        <Route path="elders/:id" element={<ProtectedRoute allowedRoles={['director']}><ElderDetail /></ProtectedRoute>} />
        <Route path="health" element={<ProtectedRoute allowedRoles={['director', 'nurse']}><HealthMonitor /></ProtectedRoute>} />
        <Route path="alerts" element={<ProtectedRoute allowedRoles={['director', 'nurse', 'caregiver']}><AlertCenter /></ProtectedRoute>} />
        <Route path="services" element={<ProtectedRoute allowedRoles={['director', 'nurse', 'caregiver']}><CareServices /></ProtectedRoute>} />
        <Route path="medication" element={<ProtectedRoute allowedRoles={['director', 'nurse']}><MedicationManage /></ProtectedRoute>} />
        <Route path="visits" element={<ProtectedRoute allowedRoles={['director', 'nurse']}><VisitManage /></ProtectedRoute>} />
        <Route path="finance" element={<ProtectedRoute allowedRoles={['director']}><FinanceManage /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute allowedRoles={['director']}><StaffManage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['director']}><SystemSettings /></ProtectedRoute>} />
      </Route>

      <Route path="/family" element={<ProtectedRoute allowedRoles={['family']}><FamilyLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<FamilyHome />} />
        <Route path="health" element={<FamilyHealth />} />
        <Route path="services" element={<FamilyServices />} />
        <Route path="visits" element={<FamilyVisits />} />
        <Route path="bills" element={<FamilyBills />} />
      </Route>

      <Route path="/caregiver" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<CaregiverTasks />} />
        <Route path="alerts" element={<CaregiverAlerts />} />
        <Route path="medication" element={<CaregiverMedication />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
