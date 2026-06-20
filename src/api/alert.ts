import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate } from './mock';
import type { PageParams, PageResult } from './request';
import type { AlertType, AlertStatus } from '@/utils/constants';

export interface Alert {
  id: string;
  elderId: string;
  elderName: string;
  type: AlertType;
  level: 'low' | 'medium' | 'high' | 'critical';
  status: AlertStatus;
  title: string;
  description: string;
  location?: string;
  deviceId?: string;
  value?: number;
  threshold?: string;
  handledBy?: string;
  handledByName?: string;
  handledAt?: string;
  handleNote?: string;
  notifyCount: number;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertQueryParams extends PageParams {
  elderId?: string;
  type?: AlertType;
  status?: AlertStatus;
  level?: Alert['level'];
  startDate?: string;
  endDate?: string;
  read?: boolean;
}

export interface AlertHandleParams {
  status: AlertStatus;
  handleNote: string;
}

const mockAlerts: Alert[] = Array.from({ length: 100 }, (_, index) => {
  const type = randomItem<AlertType>(['health', 'fall', 'sos', 'medication', 'device', 'abnormal']);
  const levelMap: Record<AlertType, Alert['level']> = {
    health: randomItem(['low', 'medium', 'high']),
    fall: 'critical',
    sos: 'critical',
    medication: 'low',
    device: randomItem(['low', 'medium']),
    abnormal: randomItem(['medium', 'high']),
  };
  const titleMap: Record<AlertType, string[]> = {
    health: ['心率异常', '血压偏高', '血糖异常', '血氧偏低', '体温异常'],
    fall: ['检测到跌倒事件', '疑似跌倒'],
    sos: ['紧急呼救', 'SOS求助信号'],
    medication: ['用药提醒', '漏药提醒'],
    device: ['设备离线', '设备电量低', '设备信号弱'],
    abnormal: ['异常行为检测', '长时间未活动', '夜间异常活动'],
  };
  return {
    id: `alert_${index + 1}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    type,
    level: levelMap[type],
    status: randomItem<AlertStatus>(['pending', 'pending', 'processing', 'resolved', 'ignored']),
    title: randomItem(titleMap[type]),
    description: `检测到${type}异常，请及时处理`,
    location: `${randomInt(1, 6)}楼${randomInt(1, 20)}号房间`,
    deviceId: `device_${randomInt(1, 100)}`,
    value: randomInt(60, 150),
    threshold: '60-100',
    handledBy: undefined,
    handledByName: undefined,
    handledAt: undefined,
    handleNote: '',
    notifyCount: randomInt(1, 5),
    read: Math.random() > 0.5,
    createdAt: randomDate(7),
    updatedAt: randomDate(7),
  };
});

export const getAlertList = async (params: AlertQueryParams = {}): Promise<PageResult<Alert>> => {
  return mockDelay(() => {
    let filtered = [...mockAlerts];
    const { elderId, type, status, level, startDate, endDate, read, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(a => a.elderId === elderId);
    }
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (level) {
      filtered = filtered.filter(a => a.level === level);
    }
    if (startDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(endDate));
    }
    if (read !== undefined) {
      filtered = filtered.filter(a => a.read === read);
    }
    filtered.sort((a, b) => {
      const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getAlertDetail = async (id: string): Promise<Alert> => {
  return mockDelay(() => {
    const alert = mockAlerts.find(a => a.id === id);
    if (!alert) {
      throw new Error('告警不存在');
    }
    return mockSuccess(alert).data;
  }, 200);
};

export const handleAlert = async (id: string, params: AlertHandleParams): Promise<Alert> => {
  return mockDelay(() => {
    const index = mockAlerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('告警不存在');
    }
    const updated = {
      ...mockAlerts[index],
      ...params,
      handledBy: 'current_user',
      handledByName: '当前用户',
      handledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAlerts[index] = updated;
    return mockSuccess(updated, '处理成功').data;
  }, 300);
};

export const ignoreAlert = async (id: string, note?: string): Promise<Alert> => {
  return mockDelay(() => {
    const index = mockAlerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('告警不存在');
    }
    const updated = {
      ...mockAlerts[index],
      status: 'ignored' as AlertStatus,
      handleNote: note || '误报，无需处理',
      handledBy: 'current_user',
      handledByName: '当前用户',
      handledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAlerts[index] = updated;
    return mockSuccess(updated, '已忽略').data;
  }, 200);
};

export const readAlert = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
    }
    return mockSuccess(undefined).data;
  }, 100);
};

export const readAllAlerts = async (): Promise<void> => {
  return mockDelay(() => {
    mockAlerts.forEach(a => {
      a.read = true;
    });
    return mockSuccess(undefined, '全部已读').data;
  }, 200);
};

export const deleteAlert = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockAlerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('告警不存在');
    }
    mockAlerts.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const getAlertStats = async (elderId?: string): Promise<{
  total: number;
  pending: number;
  processing: number;
  resolved: number;
  ignored: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  todayCount: number;
  weekCount: number;
  typeStats: Record<AlertType, number>;
}> => {
  return mockDelay(() => {
    let data = mockAlerts;
    if (elderId) {
      data = data.filter(a => a.elderId === elderId);
    }
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return mockSuccess({
      total: data.length,
      pending: data.filter(a => a.status === 'pending').length,
      processing: data.filter(a => a.status === 'processing').length,
      resolved: data.filter(a => a.status === 'resolved').length,
      ignored: data.filter(a => a.status === 'ignored').length,
      critical: data.filter(a => a.level === 'critical').length,
      high: data.filter(a => a.level === 'high').length,
      medium: data.filter(a => a.level === 'medium').length,
      low: data.filter(a => a.level === 'low').length,
      todayCount: data.filter(a => a.createdAt.startsWith(today)).length,
      weekCount: data.filter(a => a.createdAt >= weekAgo).length,
      typeStats: {
        health: data.filter(a => a.type === 'health').length,
        fall: data.filter(a => a.type === 'fall').length,
        sos: data.filter(a => a.type === 'sos').length,
        medication: data.filter(a => a.type === 'medication').length,
        device: data.filter(a => a.type === 'device').length,
        abnormal: data.filter(a => a.type === 'abnormal').length,
      },
    }).data;
  }, 300);
};

export const getPendingAlerts = async (limit: number = 10): Promise<Alert[]> => {
  return mockDelay(() => {
    const pending = mockAlerts
      .filter(a => a.status === 'pending')
      .sort((a, b) => {
        const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
    return mockSuccess(pending).data;
  }, 200);
};

export const createAlert = async (data: Omit<Alert, 'id' | 'status' | 'notifyCount' | 'read' | 'createdAt' | 'updatedAt'>): Promise<Alert> => {
  return mockDelay(() => {
    const newAlert: Alert = {
      ...data,
      id: randomId(),
      status: 'pending',
      notifyCount: 0,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAlerts.unshift(newAlert);
    return mockSuccess(newAlert, '创建成功').data;
  }, 300);
};

export default {
  getAlertList,
  getAlertDetail,
  handleAlert,
  ignoreAlert,
  readAlert,
  readAllAlerts,
  deleteAlert,
  getAlertStats,
  getPendingAlerts,
  createAlert,
};
