import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomName, randomFloat } from './mock';
import type { PageParams, PageResult } from './request';
import type { ServiceType, ServiceStatus } from '@/utils/constants';

export interface Service {
  id: string;
  elderId: string;
  elderName: string;
  type: ServiceType;
  name: string;
  status: ServiceStatus;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration: number;
  assignedTo: string;
  assignedName: string;
  completedByName?: string;
  completionNote?: string;
  satisfaction?: number;
  feedback?: string;
  location: string;
  items: string[];
  fee: number;
  cost: number;
  attachmentUrls: string[];
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceQueryParams extends PageParams {
  elderId?: string;
  type?: ServiceType;
  status?: ServiceStatus;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface ServiceCreateParams extends Omit<Service, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ServiceUpdateParams extends Partial<ServiceCreateParams> {}

const serviceNames: Record<ServiceType, string[]> = {
  daily: ['晨间护理', '晚间护理', '协助进餐', '协助洗漱', '协助更衣', '房间清洁'],
  nursing: ['生命体征监测', '压疮护理', '口腔护理', '皮肤护理', '导管护理', '伤口护理'],
  medical: ['体格检查', '疾病诊治', '康复评估', '用药指导', '健康咨询'],
  rehabilitation: ['肢体康复训练', '言语训练', '认知训练', '物理治疗', '作业治疗'],
  psychological: ['心理疏导', '情绪干预', '认知干预', '社交活动'],
  meal: ['营养配餐', '协助进食', '特殊饮食服务'],
};

const mockServices: Service[] = Array.from({ length: 150 }, (_, index) => {
  const type = randomItem<ServiceType>(['daily', 'nursing', 'medical', 'rehabilitation', 'psychological', 'meal']);
  const status = randomItem<ServiceStatus>(['pending', 'in_progress', 'completed', 'cancelled']);
  const date = randomDate(30);
  return {
    id: `service_${index + 1}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    type,
    name: randomItem(serviceNames[type]),
    status,
    description: `为老人提供${type}服务`,
    scheduledDate: new Date(date).toISOString().split('T')[0],
    scheduledTime: `${String(randomInt(8, 18)).padStart(2, '0')}:${String(randomItem([0, 30])).padStart(2, '0')}`,
    actualStartTime: status !== 'pending' ? `${randomInt(8, 18)}:${String(randomInt(0, 59)).padStart(2, '0')}` : undefined,
    actualEndTime: status === 'completed' ? `${randomInt(9, 19)}:${String(randomInt(0, 59)).padStart(2, '0')}` : undefined,
    duration: randomInt(30, 120),
    assignedTo: `staff_${randomInt(1, 20)}`,
    assignedName: randomName(),
    completedByName: status === 'completed' ? randomName() : undefined,
    completionNote: status === 'completed' ? '服务已按计划完成，老人状态良好' : undefined,
    satisfaction: status === 'completed' ? randomInt(3, 5) : undefined,
    feedback: status === 'completed' && Math.random() > 0.5 ? '服务很好，很满意' : undefined,
    location: `${randomInt(1, 6)}楼${randomInt(1, 20)}号房间`,
    items: randomItem([[], ['项目A'], ['项目A', '项目B']]),
    fee: randomFloat(50, 500),
    cost: randomFloat(20, 300),
    attachmentUrls: [],
    remark: '',
    createdAt: randomDate(30),
    updatedAt: randomDate(10),
  };
});

export const getServiceList = async (params: ServiceQueryParams = {}): Promise<PageResult<Service>> => {
  return mockDelay(() => {
    let filtered = [...mockServices];
    const { elderId, type, status, assignedTo, startDate, endDate, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(s => s.elderId === elderId);
    }
    if (type) {
      filtered = filtered.filter(s => s.type === type);
    }
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    if (assignedTo) {
      filtered = filtered.filter(s => s.assignedTo === assignedTo);
    }
    if (startDate) {
      filtered = filtered.filter(s => s.scheduledDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(s => s.scheduledDate <= endDate);
    }
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.scheduledTime.localeCompare(a.scheduledTime);
    });
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getServiceDetail = async (id: string): Promise<Service> => {
  return mockDelay(() => {
    const service = mockServices.find(s => s.id === id);
    if (!service) {
      throw new Error('服务不存在');
    }
    return mockSuccess(service).data;
  }, 200);
};

export const createService = async (data: ServiceCreateParams): Promise<Service> => {
  return mockDelay(() => {
    const newService: Service = {
      ...data,
      id: randomId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockServices.unshift(newService);
    return mockSuccess(newService, '创建成功').data;
  }, 300);
};

export const updateService = async (id: string, data: ServiceUpdateParams): Promise<Service> => {
  return mockDelay(() => {
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('服务不存在');
    }
    const updated = { ...mockServices[index], ...data, updatedAt: new Date().toISOString() };
    mockServices[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteService = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('服务不存在');
    }
    mockServices.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const startService = async (id: string): Promise<Service> => {
  return mockDelay(() => {
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('服务不存在');
    }
    const now = new Date();
    const updated = {
      ...mockServices[index],
      status: 'in_progress' as ServiceStatus,
      actualStartTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      updatedAt: now.toISOString(),
    };
    mockServices[index] = updated;
    return mockSuccess(updated, '服务已开始').data;
  }, 200);
};

export const completeService = async (id: string, params: { completionNote?: string; satisfaction?: number; feedback?: string }): Promise<Service> => {
  return mockDelay(() => {
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('服务不存在');
    }
    const now = new Date();
    const updated = {
      ...mockServices[index],
      status: 'completed' as ServiceStatus,
      actualEndTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      completedByName: '当前用户',
      completionNote: params.completionNote || '服务完成',
      satisfaction: params.satisfaction,
      feedback: params.feedback,
      updatedAt: now.toISOString(),
    };
    mockServices[index] = updated;
    return mockSuccess(updated, '服务已完成').data;
  }, 200);
};

export const cancelService = async (id: string, reason?: string): Promise<Service> => {
  return mockDelay(() => {
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('服务不存在');
    }
    const updated = {
      ...mockServices[index],
      status: 'cancelled' as ServiceStatus,
      remark: reason || mockServices[index].remark,
      updatedAt: new Date().toISOString(),
    };
    mockServices[index] = updated;
    return mockSuccess(updated, '服务已取消').data;
  }, 200);
};

export const getServiceStats = async (params?: { startDate?: string; endDate?: string; elderId?: string }): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalFee: number;
  totalCost: number;
  avgSatisfaction: number;
  typeStats: Record<ServiceType, number>;
  dailyStats: { date: string; count: number }[];
}> => {
  return mockDelay(() => {
    let data = mockServices;
    if (params?.elderId) {
      data = data.filter(s => s.elderId === params.elderId);
    }
    if (params?.startDate) {
      data = data.filter(s => s.scheduledDate >= params.startDate!);
    }
    if (params?.endDate) {
      data = data.filter(s => s.scheduledDate <= params.endDate!);
    }
    const completed = data.filter(s => s.status === 'completed');
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: randomInt(5, 20),
      };
    });
    return mockSuccess({
      total: data.length,
      pending: data.filter(s => s.status === 'pending').length,
      inProgress: data.filter(s => s.status === 'in_progress').length,
      completed: completed.length,
      cancelled: data.filter(s => s.status === 'cancelled').length,
      totalFee: Number(data.reduce((sum, s) => sum + s.fee, 0).toFixed(2)),
      totalCost: Number(data.reduce((sum, s) => sum + s.cost, 0).toFixed(2)),
      avgSatisfaction: completed.length > 0 
        ? Number((completed.reduce((sum, s) => sum + (s.satisfaction || 0), 0) / completed.length).toFixed(1))
        : 0,
      typeStats: {
        daily: data.filter(s => s.type === 'daily').length,
        nursing: data.filter(s => s.type === 'nursing').length,
        medical: data.filter(s => s.type === 'medical').length,
        rehabilitation: data.filter(s => s.type === 'rehabilitation').length,
        psychological: data.filter(s => s.type === 'psychological').length,
        meal: data.filter(s => s.type === 'meal').length,
      },
      dailyStats,
    }).data;
  }, 300);
};

export const getTodayServices = async (staffId?: string): Promise<Service[]> => {
  return mockDelay(() => {
    const today = new Date().toISOString().split('T')[0];
    let todayServices = mockServices.filter(s => s.scheduledDate === today);
    if (staffId) {
      todayServices = todayServices.filter(s => s.assignedTo === staffId);
    }
    todayServices.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return mockSuccess(todayServices).data;
  }, 200);
};

export const getElderServices = async (elderId: string, limit?: number): Promise<Service[]> => {
  return mockDelay(() => {
    let services = mockServices
      .filter(s => s.elderId === elderId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    if (limit) {
      services = services.slice(0, limit);
    }
    return mockSuccess(services).data;
  }, 200);
};

export default {
  getServiceList,
  getServiceDetail,
  createService,
  updateService,
  deleteService,
  startService,
  completeService,
  cancelService,
  getServiceStats,
  getTodayServices,
  getElderServices,
};
