import { mockDelay, mockSuccess, randomId } from './mock';
import { storage } from '@/utils/storage';
import type { Role } from '@/utils/constants';

export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar: string;
  role: Role;
  phone: string;
  email: string;
  department: string;
  position: string;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

const mockUsers: Record<string, { password: string; userInfo: Omit<UserInfo, 'id'> }> = {
  admin: {
    password: '123456',
    userInfo: {
      username: 'admin',
      name: '系统管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
      phone: '13800138000',
      email: 'admin@eldercare.com',
      department: '信息部',
      position: '系统管理员',
      permissions: [],
    },
  },
  nurse: {
    password: '123456',
    userInfo: {
      username: 'nurse',
      name: '张护士',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nurse',
      role: 'nurse',
      phone: '13800138001',
      email: 'nurse@eldercare.com',
      department: '护理部',
      position: '护士长',
      permissions: [],
    },
  },
  doctor: {
    password: '123456',
    userInfo: {
      username: 'doctor',
      name: '李医生',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
      role: 'doctor',
      phone: '13800138002',
      email: 'doctor@eldercare.com',
      department: '医疗部',
      position: '主任医师',
      permissions: [],
    },
  },
  worker: {
    password: '123456',
    userInfo: {
      username: 'worker',
      name: '王护工',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=worker',
      role: 'worker',
      phone: '13800138003',
      email: 'worker@eldercare.com',
      department: '护理部',
      position: '护工',
      permissions: [],
    },
  },
  family: {
    password: '123456',
    userInfo: {
      username: 'family',
      name: '刘家属',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=family',
      role: 'family',
      phone: '13800138004',
      email: 'family@eldercare.com',
      department: '-',
      position: '家属',
      permissions: [],
    },
  },
};

export const login = async (params: LoginParams): Promise<LoginResponse> => {
  return mockDelay(() => {
    const user = mockUsers[params.username];
    if (!user || user.password !== params.password) {
      throw new Error('用户名或密码错误');
    }
    const token = `mock_token_${randomId()}`;
    const userInfo: UserInfo = {
      id: randomId(),
      ...user.userInfo,
    };
    storage.setToken(token);
    storage.setUserInfo(userInfo);
    if (params.remember) {
      storage.set('rememberLogin', true);
      storage.set('loginUsername', params.username);
    }
    return mockSuccess({ token, userInfo }).data;
  }, 500);
};

export const logout = async (): Promise<void> => {
  return mockDelay(() => {
    storage.removeToken();
    storage.removeUserInfo();
    storage.removePermissions();
    return mockSuccess(undefined, '退出成功').data;
  }, 200);
};

export const getUserInfo = async (): Promise<UserInfo> => {
  return mockDelay(() => {
    const userInfo = storage.getUserInfo<UserInfo>();
    if (!userInfo) {
      throw new Error('未登录');
    }
    return mockSuccess(userInfo).data;
  }, 200);
};

export const updateUserInfo = async (data: Partial<UserInfo>): Promise<UserInfo> => {
  return mockDelay(() => {
    const currentUser = storage.getUserInfo<UserInfo>();
    if (!currentUser) {
      throw new Error('未登录');
    }
    const updatedUser = { ...currentUser, ...data };
    storage.setUserInfo(updatedUser);
    return mockSuccess(updatedUser).data;
  }, 300);
};

export const changePassword = async (params: { oldPassword: string; newPassword: string }): Promise<void> => {
  return mockDelay(() => {
    if (params.newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }
    return mockSuccess(undefined, '密码修改成功').data;
  }, 300);
};

export const sendSmsCode = async (phone: string): Promise<void> => {
  return mockDelay(() => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('手机号格式不正确');
    }
    return mockSuccess(undefined, '验证码发送成功').data;
  }, 200);
};

export const resetPassword = async (params: { phone: string; code: string; newPassword: string }): Promise<void> => {
  return mockDelay(() => {
    if (params.code !== '123456') {
      throw new Error('验证码错误');
    }
    if (params.newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }
    return mockSuccess(undefined, '密码重置成功').data;
  }, 300);
};

export const refreshToken = async (): Promise<{ token: string }> => {
  return mockDelay(() => {
    const newToken = `mock_token_${randomId()}`;
    storage.setToken(newToken);
    return mockSuccess({ token: newToken }).data;
  }, 200);
};

export default {
  login,
  logout,
  getUserInfo,
  updateUserInfo,
  changePassword,
  sendSmsCode,
  resetPassword,
  refreshToken,
};
