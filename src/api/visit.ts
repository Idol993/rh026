import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomName, randomPhone } from './mock';
import type { PageParams, PageResult } from './request';
import type { VisitType, VisitStatus } from '@/utils/constants';

export interface Visit {
  id: string;
  elderId: string;
  elderName: string;
  type: VisitType;
  visitorName: string;
  visitorPhone: string;
  visitorIdCard?: string;
  visitorRelation: string;
  visitorCount: number;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: VisitStatus;
  purpose: string;
  itemsToBring: string[];
  rejectionReason?: string;
  checkedInBy?: string;
  checkedInByName?: string;
  checkedOutBy?: string;
  checkedOutByName?: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitQueryParams extends PageParams {
  elderId?: string;
  type?: VisitType;
  status?: VisitStatus;
  startDate?: string;
  endDate?: string;
  visitorName?: string;
}

export interface VisitCreateParams extends Omit<Visit, 'id' | 'createdAt' | 'updatedAt'> {}

export interface VisitUpdateParams extends Partial<VisitCreateParams> {}

const relations = ['儿子', '女儿', '孙子', '孙女', '女婿', '儿媳', '朋友', '同事', '其他'];
const purposes = ['日常探望', '生日庆祝', '节日探望', '照顾陪伴', '处理事务', '其他'];

const mockVisits: Visit[] = Array.from({ length: 100 }, (_, index) => {
  const status = randomItem<VisitStatus>(['pending', 'approved', 'approved', 'rejected', 'completed', 'cancelled']);
  const date = randomDate(30);
  return {
    id: `visit_${index + 1}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    type: randomItem<VisitType>(['family', 'family', 'family', 'friend', 'other']),
    visitorName: randomName(),
    visitorPhone: randomPhone(),
    visitorIdCard: `${randomInt(110000, 650000)}${randomInt(1950, 2000)}${String(randomInt(1, 12)).padStart(2, '0')}${String(randomInt(1, 28)).padStart(2, '0')}${String(randomInt(1, 9999)).padStart(4, '0')}`,
    visitorRelation: randomItem(relations),
    visitorCount: randomInt(1, 5),
    scheduledDate: new Date(date).toISOString().split('T')[0],
    scheduledStartTime: `${String(randomInt(9, 16)).padStart(2, '0')}:00`,
    scheduledEndTime: `${String(randomInt(11, 18)).padStart(2, '0')}:00`,
    actualStartTime: (status === 'completed' || status === 'approved') ? `${String(randomInt(9, 16)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}` : undefined,
    actualEndTime: status === 'completed' ? `${String(randomInt(11, 18)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}` : undefined,
    status,
    purpose: randomItem(purposes),
    itemsToBring: randomItem([[], ['生活用品'], ['营养品'], ['衣物'], ['生活用品', '营养品']]),
    rejectionReason: status === 'rejected' ? randomItem(['当日已有预约', '老人身体不适', '疫情期间限制']) : undefined,
    checkedInBy: status === 'completed' ? `staff_${randomInt(1, 20)}` : undefined,
    checkedInByName: status === 'completed' ? randomName() : undefined,
    checkedOutBy: status === 'completed' ? `staff_${randomInt(1, 20)}` : undefined,
    checkedOutByName: status === 'completed' ? randomName() : undefined,
    remark: '',
    createdAt: randomDate(30),
    updatedAt: randomDate(10),
  };
});

export const getVisitList = async (params: VisitQueryParams = {}): Promise<PageResult<Visit>> => {
  return mockDelay(() => {
    let filtered = [...mockVisits];
    const { elderId, type, status, startDate, endDate, visitorName, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(v => v.elderId === elderId);
    }
    if (type) {
      filtered = filtered.filter(v => v.type === type);
    }
    if (status) {
      filtered = filtered.filter(v => v.status === status);
    }
    if (startDate) {
      filtered = filtered.filter(v => v.scheduledDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(v => v.scheduledDate <= endDate);
    }
    if (visitorName) {
      filtered = filtered.filter(v => v.visitorName.includes(visitorName));
    }
    filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getVisitDetail = async (id: string): Promise<Visit> => {
  return mockDelay(() => {
    const visit = mockVisits.find(v => v.id === id);
    if (!visit) {
      throw new Error('探视不存在');
    }
    return mockSuccess(visit).data;
  }, 200);
};

export const createVisit = async (data: VisitCreateParams): Promise<Visit> => {
  return mockDelay(() => {
    const newVisit: Visit = {
      ...data,
      id: randomId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockVisits.unshift(newVisit);
    return mockSuccess(newVisit, '预约成功').data;
  }, 300);
};

export const updateVisit = async (id: string, data: VisitUpdateParams): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const updated = { ...mockVisits[index], ...data, updatedAt: new Date().toISOString() };
    mockVisits[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteVisit = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    mockVisits.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const approveVisit = async (id: string): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const updated = {
      ...mockVisits[index],
      status: 'approved' as VisitStatus,
      updatedAt: new Date().toISOString(),
    };
    mockVisits[index] = updated;
    return mockSuccess(updated, '已批准').data;
  }, 200);
};

export const rejectVisit = async (id: string, reason: string): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const updated = {
      ...mockVisits[index],
      status: 'rejected' as VisitStatus,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };
    mockVisits[index] = updated;
    return mockSuccess(updated, '已拒绝').data;
  }, 200);
};

export const cancelVisit = async (id: string, reason?: string): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const updated = {
      ...mockVisits[index],
      status: 'cancelled' as VisitStatus,
      remark: reason || mockVisits[index].remark,
      updatedAt: new Date().toISOString(),
    };
    mockVisits[index] = updated;
    return mockSuccess(updated, '已取消').data;
  }, 200);
};

export const checkInVisit = async (id: string): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const now = new Date();
    const updated = {
      ...mockVisits[index],
      actualStartTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      checkedInBy: 'current_user',
      checkedInByName: '当前用户',
      updatedAt: now.toISOString(),
    };
    mockVisits[index] = updated;
    return mockSuccess(updated, '已签到').data;
  }, 200);
};

export const checkOutVisit = async (id: string): Promise<Visit> => {
  return mockDelay(() => {
    const index = mockVisits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('探视不存在');
    }
    const now = new Date();
    const updated = {
      ...mockVisits[index],
      status: 'completed' as VisitStatus,
      actualEndTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      checkedOutBy: 'current_user',
      checkedOutByName: '当前用户',
      updatedAt: now.toISOString(),
    };
    mockVisits[index] = updated;
    return mockSuccess(updated, '已签退').data;
  }, 200);
};

export const getVisitStats = async (params?: { startDate?: string; endDate?: string; elderId?: string }): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
  todayCount: number;
  weekCount: number;
  typeStats: Record<VisitType, number>;
  dailyStats: { date: string; count: number }[];
}> => {
  return mockDelay(() => {
    let data = mockVisits;
    if (params?.elderId) {
      data = data.filter(v => v.elderId === params.elderId);
    }
    if (params?.startDate) {
      data = data.filter(v => v.scheduledDate >= params.startDate!);
    }
    if (params?.endDate) {
      data = data.filter(v => v.scheduledDate <= params.endDate!);
    }
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: randomInt(0, 10),
      };
    });
    return mockSuccess({
      total: data.length,
      pending: data.filter(v => v.status === 'pending').length,
      approved: data.filter(v => v.status === 'approved').length,
      rejected: data.filter(v => v.status === 'rejected').length,
      completed: data.filter(v => v.status === 'completed').length,
      cancelled: data.filter(v => v.status === 'cancelled').length,
      todayCount: data.filter(v => v.scheduledDate === today).length,
      weekCount: data.filter(v => v.scheduledDate >= weekAgo).length,
      typeStats: {
        family: data.filter(v => v.type === 'family').length,
        friend: data.filter(v => v.type === 'friend').length,
        other: data.filter(v => v.type === 'other').length,
      },
      dailyStats,
    }).data;
  }, 300);
};

export const getTodayVisits = async (): Promise<Visit[]> => {
  return mockDelay(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = mockVisits
      .filter(v => v.scheduledDate === today)
      .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));
    return mockSuccess(todayVisits).data;
  }, 200);
};

export const getAvailableTimes = async (date: string): Promise<string[]> => {
  return mockDelay(() => {
    const allTimes = [
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
    ];
    return mockSuccess(allTimes.filter(() => Math.random() > 0.3)).data;
  }, 200);
};

export default {
  getVisitList,
  getVisitDetail,
  createVisit,
  updateVisit,
  deleteVisit,
  approveVisit,
  rejectVisit,
  cancelVisit,
  checkInVisit,
  checkOutVisit,
  getVisitStats,
  getTodayVisits,
  getAvailableTimes,
};
