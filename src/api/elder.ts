import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomName, randomPhone, randomAddress } from './mock';
import type { PageParams, PageResult } from './request';
import type { NursingLevel, Gender, MaritalStatus, BloodType } from '@/utils/constants';

export interface Elder {
  id: string;
  name: string;
  gender: Gender;
  birthday: string;
  age: number;
  avatar: string;
  idCard: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: string;
  nursingLevel: NursingLevel;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  maritalStatus: MaritalStatus;
  bloodType: BloodType;
  height: number;
  weight: number;
  allergies: string[];
  chronicDiseases: string[];
  medicalHistory: string;
  dietaryRequirements: string;
  activityLevel: string;
  cognitiveStatus: string;
  mobility: string;
  status: 'active' | 'discharged' | 'deceased';
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElderQueryParams extends PageParams {
  keyword?: string;
  nursingLevel?: NursingLevel;
  status?: string;
  gender?: Gender;
  ageRange?: [number, number];
}

export interface ElderCreateParams extends Omit<Elder, 'id' | 'age' | 'createdAt' | 'updatedAt'> {}

export interface ElderUpdateParams extends Partial<ElderCreateParams> {}

const mockElders: Elder[] = Array.from({ length: 50 }, (_, index) => {
  const gender = randomItem<Gender>(['male', 'female']);
  const birthday = randomDate(365 * 90);
  const birthYear = new Date(birthday).getFullYear();
  const age = new Date().getFullYear() - birthYear;
  return {
    id: `elder_${index + 1}`,
    name: randomName(),
    gender,
    birthday: new Date(birthday).toISOString().split('T')[0],
    age: age > 100 ? randomInt(65, 95) : age,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=elder${index + 1}`,
    idCard: `${randomInt(110000, 650000)}${birthYear}${String(randomInt(1, 12)).padStart(2, '0')}${String(randomInt(1, 28)).padStart(2, '0')}${String(randomInt(1, 9999)).padStart(4, '0')}`,
    phone: randomPhone(),
    emergencyContact: randomName(),
    emergencyPhone: randomPhone(),
    address: randomAddress(),
    nursingLevel: randomItem<NursingLevel>(['level1', 'level2', 'level3', 'level4', 'special']),
    roomNumber: `${randomInt(1, 6)}${String(randomInt(1, 20)).padStart(2, '0')}`,
    bedNumber: String(randomInt(1, 4)),
    checkInDate: new Date(Date.now() - randomInt(0, 365 * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maritalStatus: randomItem<MaritalStatus>(['single', 'married', 'divorced', 'widowed']),
    bloodType: randomItem<BloodType>(['A', 'B', 'AB', 'O', 'unknown']),
    height: randomInt(150, 180),
    weight: randomFloat(45, 90),
    allergies: randomItem([[], ['青霉素'], ['海鲜'], ['花粉'], ['青霉素', '海鲜']]),
    chronicDiseases: randomItem([[], ['高血压'], ['糖尿病'], ['心脏病'], ['高血压', '糖尿病']]),
    medicalHistory: randomItem(['无特殊病史', '曾患有胃溃疡', '2020年曾做过阑尾炎手术', '无']),
    dietaryRequirements: randomItem(['正常饮食', '低盐低脂', '糖尿病饮食', '流质饮食']),
    activityLevel: randomItem(['完全自理', '部分自理', '完全依赖']),
    cognitiveStatus: randomItem(['正常', '轻度认知障碍', '中度认知障碍', '重度认知障碍']),
    mobility: randomItem(['正常行走', '需要助行器', '轮椅代步', '卧床']),
    status: randomItem<Elder['status']>(['active', 'active', 'active', 'active', 'discharged']),
    remark: '',
    createdAt: randomDate(365),
    updatedAt: randomDate(30),
  };
});

export const getElderList = async (params: ElderQueryParams = {}): Promise<PageResult<Elder>> => {
  return mockDelay(() => {
    let filtered = [...mockElders];
    const { keyword, nursingLevel, status, gender, ageRange, page = 1, pageSize = 10 } = params;
    if (keyword) {
      filtered = filtered.filter(
        elder =>
          elder.name.includes(keyword) ||
          elder.idCard.includes(keyword) ||
          elder.phone.includes(keyword) ||
          elder.roomNumber.includes(keyword)
      );
    }
    if (nursingLevel) {
      filtered = filtered.filter(elder => elder.nursingLevel === nursingLevel);
    }
    if (status) {
      filtered = filtered.filter(elder => elder.status === status);
    }
    if (gender) {
      filtered = filtered.filter(elder => elder.gender === gender);
    }
    if (ageRange && ageRange.length === 2) {
      filtered = filtered.filter(elder => elder.age >= ageRange[0] && elder.age <= ageRange[1]);
    }
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getElderDetail = async (id: string): Promise<Elder> => {
  return mockDelay(() => {
    const elder = mockElders.find(e => e.id === id);
    if (!elder) {
      throw new Error('老人不存在');
    }
    return mockSuccess(elder).data;
  }, 200);
};

export const createElder = async (data: ElderCreateParams): Promise<Elder> => {
  return mockDelay(() => {
    const newElder: Elder = {
      ...data,
      id: randomId(),
      age: new Date().getFullYear() - new Date(data.birthday).getFullYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockElders.unshift(newElder);
    return mockSuccess(newElder, '创建成功').data;
  }, 300);
};

export const updateElder = async (id: string, data: ElderUpdateParams): Promise<Elder> => {
  return mockDelay(() => {
    const index = mockElders.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('老人不存在');
    }
    const updated = { ...mockElders[index], ...data, updatedAt: new Date().toISOString() };
    if (data.birthday) {
      updated.age = new Date().getFullYear() - new Date(data.birthday).getFullYear();
    }
    mockElders[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteElder = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockElders.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('老人不存在');
    }
    mockElders.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const getElderStats = async (): Promise<{
  total: number;
  active: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  special: number;
  averageAge: number;
  maleCount: number;
  femaleCount: number;
}> => {
  return mockDelay(() => {
    const active = mockElders.filter(e => e.status === 'active');
    return mockSuccess({
      total: mockElders.length,
      active: active.length,
      level1: active.filter(e => e.nursingLevel === 'level1').length,
      level2: active.filter(e => e.nursingLevel === 'level2').length,
      level3: active.filter(e => e.nursingLevel === 'level3').length,
      level4: active.filter(e => e.nursingLevel === 'level4').length,
      special: active.filter(e => e.nursingLevel === 'special').length,
      averageAge: Math.round(active.reduce((sum, e) => sum + e.age, 0) / active.length),
      maleCount: active.filter(e => e.gender === 'male').length,
      femaleCount: active.filter(e => e.gender === 'female').length,
    }).data;
  }, 200);
};

export const exportElders = async (params?: ElderQueryParams): Promise<void> => {
  return mockDelay(() => {
    console.log('Export elders with params:', params);
    return mockSuccess(undefined, '导出成功').data;
  }, 500);
};

export const batchUpdateNursingLevel = async (ids: string[], nursingLevel: NursingLevel): Promise<void> => {
  return mockDelay(() => {
    ids.forEach(id => {
      const elder = mockElders.find(e => e.id === id);
      if (elder) {
        elder.nursingLevel = nursingLevel;
        elder.updatedAt = new Date().toISOString();
      }
    });
    return mockSuccess(undefined, '批量更新成功').data;
  }, 300);
};

function randomFloat(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

export default {
  getElderList,
  getElderDetail,
  createElder,
  updateElder,
  deleteElder,
  getElderStats,
  exportElders,
  batchUpdateNursingLevel,
};
