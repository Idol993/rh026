import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomFloat } from './mock';
import type { PageParams, PageResult } from './request';

export interface HealthData {
  id: string;
  elderId: string;
  elderName: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodSugar: number;
  bloodOxygen: number;
  temperature: number;
  weight: number;
  bmi: number;
  sleepHours: number;
  steps: number;
  calorie: number;
  heartRateStatus: 'normal' | 'warning' | 'danger';
  bloodPressureStatus: 'normal' | 'warning' | 'danger';
  bloodSugarStatus: 'normal' | 'warning' | 'danger';
  bloodOxygenStatus: 'normal' | 'warning' | 'danger';
  temperatureStatus: 'normal' | 'warning' | 'danger';
  overallStatus: 'normal' | 'warning' | 'danger';
  measuredAt: string;
  source: 'device' | 'manual';
  deviceId?: string;
  remark?: string;
  createdAt: string;
}

export interface HealthTrendData {
  date: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodSugar: number;
  bloodOxygen: number;
  temperature: number;
}

export interface HealthQueryParams extends PageParams {
  elderId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'normal' | 'warning' | 'danger';
  source?: 'device' | 'manual';
}

export interface HealthCreateParams extends Omit<HealthData, 'id' | 'bmi' | 'createdAt' | 'heartRateStatus' | 'bloodPressureStatus' | 'bloodSugarStatus' | 'bloodOxygenStatus' | 'temperatureStatus' | 'overallStatus'> {}

const getStatus = (value: number, min: number, max: number): 'normal' | 'warning' | 'danger' => {
  if (value < min * 0.9 || value > max * 1.1) return 'danger';
  if (value < min || value > max) return 'warning';
  return 'normal';
};

const mockHealthData: HealthData[] = Array.from({ length: 200 }, (_, index) => {
  const heartRate = randomInt(55, 110);
  const systolic = randomInt(85, 150);
  const diastolic = randomInt(55, 95);
  const bloodSugar = randomFloat(3.5, 8.0);
  const bloodOxygen = randomInt(90, 100);
  const temperature = randomFloat(35.8, 38.0);
  const weight = randomFloat(45, 90);
  const height = randomInt(150, 180);
  const bmi = Number((weight / ((height / 100) ** 2)).toFixed(1));

  return {
    id: `health_${index + 1}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    heartRate,
    bloodPressureSystolic: systolic,
    bloodPressureDiastolic: diastolic,
    bloodSugar,
    bloodOxygen,
    temperature,
    weight,
    bmi,
    sleepHours: randomFloat(4, 10),
    steps: randomInt(0, 10000),
    calorie: randomInt(0, 3000),
    heartRateStatus: getStatus(heartRate, 60, 100),
    bloodPressureStatus: getStatus(systolic, 90, 140),
    bloodSugarStatus: getStatus(bloodSugar, 3.9, 6.1),
    bloodOxygenStatus: getStatus(bloodOxygen, 95, 100),
    temperatureStatus: getStatus(temperature, 36.0, 37.3),
    overallStatus: 'normal',
    measuredAt: randomDate(30),
    source: randomItem<'device' | 'manual'>(['device', 'device', 'device', 'manual']),
    deviceId: `device_${randomInt(1, 100)}`,
    remark: '',
    createdAt: randomDate(30),
  };
});

mockHealthData.forEach(data => {
  const statuses = [data.heartRateStatus, data.bloodPressureStatus, data.bloodSugarStatus, data.bloodOxygenStatus, data.temperatureStatus];
  if (statuses.includes('danger')) {
    data.overallStatus = 'danger';
  } else if (statuses.includes('warning')) {
    data.overallStatus = 'warning';
  }
});

export const getHealthList = async (params: HealthQueryParams = {}): Promise<PageResult<HealthData>> => {
  return mockDelay(() => {
    let filtered = [...mockHealthData];
    const { elderId, startDate, endDate, status, source, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(d => d.elderId === elderId);
    }
    if (startDate) {
      filtered = filtered.filter(d => new Date(d.measuredAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(d => new Date(d.measuredAt) <= new Date(endDate));
    }
    if (status) {
      filtered = filtered.filter(d => d.overallStatus === status);
    }
    if (source) {
      filtered = filtered.filter(d => d.source === source);
    }
    filtered.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getHealthLatest = async (elderId: string): Promise<HealthData | null> => {
  return mockDelay(() => {
    const elderData = mockHealthData.filter(d => d.elderId === elderId);
    if (elderData.length === 0) {
      return mockSuccess(null).data;
    }
    elderData.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    return mockSuccess(elderData[0]).data;
  }, 200);
};

export const getHealthTrend = async (elderId: string, days: number = 7): Promise<HealthTrendData[]> => {
  return mockDelay(() => {
    const data: HealthTrendData[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        heartRate: randomInt(65, 90),
        bloodPressureSystolic: randomInt(100, 130),
        bloodPressureDiastolic: randomInt(65, 85),
        bloodSugar: randomFloat(4.0, 6.5),
        bloodOxygen: randomInt(96, 99),
        temperature: randomFloat(36.2, 37.0),
      });
    }
    return mockSuccess(data).data;
  }, 300);
};

export const createHealthData = async (data: HealthCreateParams): Promise<HealthData> => {
  return mockDelay(() => {
    const bmi = Number((data.weight / ((170 / 100) ** 2)).toFixed(1));
    const newData: HealthData = {
      ...data,
      id: randomId(),
      bmi,
      heartRateStatus: getStatus(data.heartRate, 60, 100),
      bloodPressureStatus: getStatus(data.bloodPressureSystolic, 90, 140),
      bloodSugarStatus: getStatus(data.bloodSugar, 3.9, 6.1),
      bloodOxygenStatus: getStatus(data.bloodOxygen, 95, 100),
      temperatureStatus: getStatus(data.temperature, 36.0, 37.3),
      overallStatus: 'normal',
      createdAt: new Date().toISOString(),
    };
    const statuses = [newData.heartRateStatus, newData.bloodPressureStatus, newData.bloodSugarStatus, newData.bloodOxygenStatus, newData.temperatureStatus];
    if (statuses.includes('danger')) {
      newData.overallStatus = 'danger';
    } else if (statuses.includes('warning')) {
      newData.overallStatus = 'warning';
    }
    mockHealthData.unshift(newData);
    return mockSuccess(newData, '创建成功').data;
  }, 300);
};

export const updateHealthData = async (id: string, data: Partial<HealthCreateParams>): Promise<HealthData> => {
  return mockDelay(() => {
    const index = mockHealthData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('健康数据不存在');
    }
    const updated = { ...mockHealthData[index], ...data };
    if (data.heartRate) updated.heartRateStatus = getStatus(data.heartRate, 60, 100);
    if (data.bloodPressureSystolic) updated.bloodPressureStatus = getStatus(data.bloodPressureSystolic, 90, 140);
    if (data.bloodSugar) updated.bloodSugarStatus = getStatus(data.bloodSugar, 3.9, 6.1);
    if (data.bloodOxygen) updated.bloodOxygenStatus = getStatus(data.bloodOxygen, 95, 100);
    if (data.temperature) updated.temperatureStatus = getStatus(data.temperature, 36.0, 37.3);
    mockHealthData[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteHealthData = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockHealthData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('健康数据不存在');
    }
    mockHealthData.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const getHealthReport = async (elderId: string, period: 'week' | 'month' | 'quarter'): Promise<{
  period: string;
  startDate: string;
  endDate: string;
  avgHeartRate: number;
  avgBloodPressureSystolic: number;
  avgBloodPressureDiastolic: number;
  avgBloodSugar: number;
  avgBloodOxygen: number;
  avgTemperature: number;
  avgBMI: number;
  warningCount: number;
  dangerCount: number;
  suggestions: string[];
}> => {
  return mockDelay(() => {
    return mockSuccess({
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      avgHeartRate: 75,
      avgBloodPressureSystolic: 120,
      avgBloodPressureDiastolic: 80,
      avgBloodSugar: 5.2,
      avgBloodOxygen: 98,
      avgTemperature: 36.5,
      avgBMI: 23.5,
      warningCount: randomInt(0, 5),
      dangerCount: randomInt(0, 2),
      suggestions: [
        '建议保持规律作息，每天保证7-8小时睡眠',
        '饮食宜清淡，减少盐分和油脂摄入',
        '建议每天进行适量运动，如散步30分钟',
        '定期监测血压血糖，如有异常及时就医',
      ],
    }).data;
  }, 300);
};

export const getHealthStats = async (elderId?: string): Promise<{
  todayRecords: number;
  weekRecords: number;
  warningCount: number;
  dangerCount: number;
  abnormalTypes: Record<string, number>;
}> => {
  return mockDelay(() => {
    let data = mockHealthData;
    if (elderId) {
      data = data.filter(d => d.elderId === elderId);
    }
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return mockSuccess({
      todayRecords: data.filter(d => d.measuredAt.startsWith(today)).length,
      weekRecords: data.filter(d => d.measuredAt >= weekAgo).length,
      warningCount: data.filter(d => d.overallStatus === 'warning').length,
      dangerCount: data.filter(d => d.overallStatus === 'danger').length,
      abnormalTypes: {
        heartRate: data.filter(d => d.heartRateStatus !== 'normal').length,
        bloodPressure: data.filter(d => d.bloodPressureStatus !== 'normal').length,
        bloodSugar: data.filter(d => d.bloodSugarStatus !== 'normal').length,
        bloodOxygen: data.filter(d => d.bloodOxygenStatus !== 'normal').length,
        temperature: data.filter(d => d.temperatureStatus !== 'normal').length,
      },
    }).data;
  }, 300);
};

export default {
  getHealthList,
  getHealthLatest,
  getHealthTrend,
  createHealthData,
  updateHealthData,
  deleteHealthData,
  getHealthReport,
  getHealthStats,
};
