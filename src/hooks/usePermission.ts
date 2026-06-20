import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

const routePermissions: { path: string; allowedRoles: UserRole[] }[] = [
  { path: '/director/dashboard', allowedRoles: ['director'] },
  { path: '/director/elders', allowedRoles: ['director'] },
  { path: '/director/health', allowedRoles: ['director', 'nurse'] },
  { path: '/director/alerts', allowedRoles: ['director', 'nurse', 'caregiver'] },
  { path: '/director/services', allowedRoles: ['director', 'nurse', 'caregiver'] },
  { path: '/director/medication', allowedRoles: ['director', 'nurse'] },
  { path: '/director/visits', allowedRoles: ['director', 'nurse'] },
  { path: '/director/finance', allowedRoles: ['director'] },
  { path: '/director/staff', allowedRoles: ['director'] },
  { path: '/director/settings', allowedRoles: ['director'] },
  { path: '/family/home', allowedRoles: ['family'] },
  { path: '/family/health', allowedRoles: ['family'] },
  { path: '/family/services', allowedRoles: ['family'] },
  { path: '/family/visits', allowedRoles: ['family'] },
  { path: '/family/bills', allowedRoles: ['family'] },
  { path: '/caregiver/tasks', allowedRoles: ['caregiver'] },
  { path: '/caregiver/alerts', allowedRoles: ['caregiver'] },
  { path: '/caregiver/medication', allowedRoles: ['caregiver'] },
];

export function usePermission() {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  const canAccessRoute = (path: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const matchedPermission = routePermissions.find(perm => {
      const permPath = perm.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${permPath}(/.*)?$`);
      return regex.test(path);
    });
    if (!matchedPermission) return true;
    return matchedPermission.allowedRoles.includes(user.role);
  };

  const isDirector = useMemo(() => user?.role === 'director', [user]);
  const isNurse = useMemo(() => user?.role === 'nurse', [user]);
  const isCaregiver = useMemo(() => user?.role === 'caregiver', [user]);
  const isFamily = useMemo(() => user?.role === 'family', [user]);

  return { hasRole, canAccessRoute, isDirector, isNurse, isCaregiver, isFamily, user, isAuthenticated };
}
