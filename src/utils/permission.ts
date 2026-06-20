import React from 'react';
import type { Role } from './constants';
import { storage } from './storage';

export interface PermissionConfig {
  role: Role[];
  permission: string[];
}

export const ADMIN_PERMISSIONS = [
  'user:manage',
  'user:view',
  'user:add',
  'user:edit',
  'user:delete',
  'elder:manage',
  'elder:view',
  'elder:add',
  'elder:edit',
  'elder:delete',
  'health:view',
  'health:manage',
  'alert:view',
  'alert:manage',
  'alert:handle',
  'service:view',
  'service:manage',
  'service:add',
  'service:edit',
  'service:delete',
  'medication:view',
  'medication:manage',
  'visit:view',
  'visit:manage',
  'visit:approve',
  'finance:view',
  'finance:manage',
  'report:view',
  'report:export',
  'system:manage',
  'system:settings',
  'dashboard:view',
];

export const NURSE_PERMISSIONS = [
  'elder:view',
  'elder:edit',
  'health:view',
  'health:manage',
  'alert:view',
  'alert:handle',
  'service:view',
  'service:manage',
  'service:add',
  'service:edit',
  'medication:view',
  'medication:manage',
  'visit:view',
  'visit:approve',
  'dashboard:view',
];

export const DOCTOR_PERMISSIONS = [
  'elder:view',
  'health:view',
  'health:manage',
  'alert:view',
  'alert:handle',
  'medication:view',
  'medication:manage',
  'medication:add',
  'medication:edit',
  'visit:view',
  'dashboard:view',
];

export const WORKER_PERMISSIONS = [
  'elder:view',
  'health:view',
  'alert:view',
  'service:view',
  'service:manage',
  'service:add',
  'medication:view',
  'dashboard:view',
];

export const FAMILY_PERMISSIONS = [
  'elder:view',
  'health:view',
  'alert:view',
  'service:view',
  'medication:view',
  'visit:view',
  'visit:manage',
  'visit:add',
  'finance:view',
  'dashboard:view',
];

export const ELDER_PERMISSIONS = [
  'elder:view',
  'health:view',
  'alert:view',
  'service:view',
  'medication:view',
  'visit:view',
  'dashboard:view',
];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ADMIN_PERMISSIONS,
  nurse: NURSE_PERMISSIONS,
  doctor: DOCTOR_PERMISSIONS,
  worker: WORKER_PERMISSIONS,
  family: FAMILY_PERMISSIONS,
  elder: ELDER_PERMISSIONS,
};

export const getPermissionsByRole = (role: Role): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (permission: string, permissions?: string[]): boolean => {
  const userPermissions = permissions || storage.getPermissions();
  if (!userPermissions || userPermissions.length === 0) return false;
  return userPermissions.includes(permission) || userPermissions.includes('*');
};

export const hasAnyPermission = (permissionList: string[], permissions?: string[]): boolean => {
  return permissionList.some(permission => hasPermission(permission, permissions));
};

export const hasAllPermissions = (permissionList: string[], permissions?: string[]): boolean => {
  return permissionList.every(permission => hasPermission(permission, permissions));
};

export const hasRole = (role: Role, userRole?: Role): boolean => {
  const currentRole = userRole || storage.getUserInfo<{ role: Role }>()?.role;
  if (!currentRole) return false;
  return currentRole === role;
};

export const hasAnyRole = (roles: Role[], userRole?: Role): boolean => {
  const currentRole = userRole || storage.getUserInfo<{ role: Role }>()?.role;
  if (!currentRole) return false;
  return roles.includes(currentRole);
};

export const isAdmin = (userRole?: Role): boolean => hasRole('admin', userRole);

export const isNurse = (userRole?: Role): boolean => hasRole('nurse', userRole);

export const isDoctor = (userRole?: Role): boolean => hasRole('doctor', userRole);

export const isWorker = (userRole?: Role): boolean => hasRole('worker', userRole);

export const isFamily = (userRole?: Role): boolean => hasRole('family', userRole);

export const isElder = (userRole?: Role): boolean => hasRole('elder', userRole);

export const canViewDashboard = (permissions?: string[]): boolean => hasPermission('dashboard:view', permissions);

export const canManageElder = (permissions?: string[]): boolean => hasPermission('elder:manage', permissions);

export const canViewElder = (permissions?: string[]): boolean => hasPermission('elder:view', permissions);

export const canAddElder = (permissions?: string[]): boolean => hasPermission('elder:add', permissions);

export const canEditElder = (permissions?: string[]): boolean => hasPermission('elder:edit', permissions);

export const canDeleteElder = (permissions?: string[]): boolean => hasPermission('elder:delete', permissions);

export const canViewHealth = (permissions?: string[]): boolean => hasPermission('health:view', permissions);

export const canManageHealth = (permissions?: string[]): boolean => hasPermission('health:manage', permissions);

export const canViewAlert = (permissions?: string[]): boolean => hasPermission('alert:view', permissions);

export const canHandleAlert = (permissions?: string[]): boolean => hasPermission('alert:handle', permissions);

export const canViewService = (permissions?: string[]): boolean => hasPermission('service:view', permissions);

export const canManageService = (permissions?: string[]): boolean => hasPermission('service:manage', permissions);

export const canViewMedication = (permissions?: string[]): boolean => hasPermission('medication:view', permissions);

export const canManageMedication = (permissions?: string[]): boolean => hasPermission('medication:manage', permissions);

export const canViewVisit = (permissions?: string[]): boolean => hasPermission('visit:view', permissions);

export const canApproveVisit = (permissions?: string[]): boolean => hasPermission('visit:approve', permissions);

export const canViewFinance = (permissions?: string[]): boolean => hasPermission('finance:view', permissions);

export const canManageFinance = (permissions?: string[]): boolean => hasPermission('finance:manage', permissions);

export const canViewReport = (permissions?: string[]): boolean => hasPermission('report:view', permissions);

export const canExportReport = (permissions?: string[]): boolean => hasPermission('report:export', permissions);

export const canManageSystem = (permissions?: string[]): boolean => hasPermission('system:manage', permissions);

export const filterMenuByPermission = <T extends { key: string; permission?: string }>(
  menus: T[],
  permissions?: string[]
): T[] => {
  return menus.filter(menu => {
    if (!menu.permission) return true;
    return hasPermission(menu.permission, permissions);
  });
};

export const withPermissionGuard = <T>(
  permission: string,
  Component: React.ComponentType<T>,
  Fallback?: React.ReactNode
): React.ComponentType<T> => {
  return (props: T) => {
    if (hasPermission(permission)) {
      return React.createElement(Component, props as any);
    }
    return Fallback || null;
  };
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  isAdmin,
  isNurse,
  isDoctor,
  isWorker,
  isFamily,
  isElder,
  getPermissionsByRole,
  filterMenuByPermission,
};
