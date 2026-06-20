import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomName, randomFloat } from './mock';
import type { PageParams, PageResult } from './request';
import type { MedicationStatus } from '@/utils/constants';

export interface Medication {
  id: string;
  elderId: string;
  elderName: string;
  prescriptionId: string;
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate: string;
  timesPerDay: number;
  reminderTimes: string[];
  quantity: number;
  remainingQuantity: number;
  doctorId: string;
  doctorName: string;
  pharmacistId?: string;
  pharmacistName?: string;
  indication: string;
  sideEffects: string[];
  contraindications: string;
  precautions: string;
  status: 'active' | 'completed' | 'discontinued' | 'paused';
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRecord {
  id: string;
  medicationId: string;
  elderId: string;
  elderName: string;
  drugName: string;
  scheduledTime: string;
  actualTime?: string;
  dosage: string;
  status: MedicationStatus;
  administeredBy?: string;
  administeredByName?: string;
  note?: string;
  createdAt: string;
}

export interface MedicationQueryParams extends PageParams {
  elderId?: string;
  status?: Medication['status'];
  startDate?: string;
  endDate?: string;
  drugName?: string;
}

export interface MedicationRecordQueryParams extends PageParams {
  elderId?: string;
  medicationId?: string;
  status?: MedicationStatus;
  startDate?: string;
  endDate?: string;
}

export interface MedicationCreateParams extends Omit<Medication, 'id' | 'remainingQuantity' | 'createdAt' | 'updatedAt'> {}

const drugList = [
  { name: '阿司匹林肠溶片', generic: '阿司匹林', dosage: '100mg' },
  { name: '硝苯地平控释片', generic: '硝苯地平', dosage: '30mg' },
  { name: '二甲双胍片', generic: '盐酸二甲双胍', dosage: '500mg' },
  { name: '阿托伐他汀钙片', generic: '阿托伐他汀钙', dosage: '20mg' },
  { name: '奥美拉唑肠溶胶囊', generic: '奥美拉唑', dosage: '20mg' },
  { name: '布洛芬缓释胶囊', generic: '布洛芬', dosage: '300mg' },
  { name: '氨氯地平片', generic: '苯磺酸氨氯地平', dosage: '5mg' },
  { name: '缬沙坦胶囊', generic: '缬沙坦', dosage: '80mg' },
  { name: '美托洛尔缓释片', generic: '酒石酸美托洛尔', dosage: '47.5mg' },
  { name: '格列美脲片', generic: '格列美脲', dosage: '2mg' },
];

const frequencies = ['每日1次', '每日2次', '每日3次', '每日4次', '隔日1次', '每周1次'];
const routes = ['口服', '外用', '肌肉注射', '静脉滴注', '舌下含服'];
const reminderTimeOptions = ['07:00', '08:00', '12:00', '18:00', '20:00', '22:00'];

const mockMedications: Medication[] = Array.from({ length: 80 }, (_, index) => {
  const drug = randomItem(drugList);
  const timesPerDay = randomInt(1, 4);
  const reminderTimes = Array.from({ length: timesPerDay }, () => randomItem(reminderTimeOptions)).sort();
  return {
    id: `med_${index + 1}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    prescriptionId: `pres_${randomInt(1, 1000)}`,
    drugName: drug.name,
    genericName: drug.generic,
    dosage: drug.dosage,
    frequency: frequencies[timesPerDay - 1],
    route: randomItem(routes),
    startDate: randomDate(90),
    endDate: randomDate(30),
    timesPerDay,
    reminderTimes,
    quantity: randomInt(30, 100),
    remainingQuantity: randomInt(10, 90),
    doctorId: `doctor_${randomInt(1, 10)}`,
    doctorName: randomName(),
    pharmacistId: `pharmacist_${randomInt(1, 5)}`,
    pharmacistName: randomName(),
    indication: randomItem(['高血压', '糖尿病', '冠心病', '高血脂', '慢性胃炎', '头痛']),
    sideEffects: randomItem([[], ['胃肠道不适'], ['头晕', '恶心'], ['皮疹']]),
    contraindications: randomItem(['无', '过敏体质者禁用', '肝肾功能不全者慎用']),
    precautions: randomItem(['饭后服用', '避免饮酒', '定期监测肝肾功能', '请勿自行停药']),
    status: randomItem<Medication['status']>(['active', 'active', 'active', 'completed', 'discontinued', 'paused']),
    remark: '',
    createdAt: randomDate(90),
    updatedAt: randomDate(30),
  };
});

const mockMedicationRecords: MedicationRecord[] = Array.from({ length: 200 }, (_, index) => {
  const status = randomItem<MedicationStatus>(['pending', 'taken', 'taken', 'taken', 'missed', 'skipped']);
  const scheduledDate = randomDate(7);
  const scheduledTime = randomItem(reminderTimeOptions);
  return {
    id: `med_rec_${index + 1}`,
    medicationId: `med_${randomInt(1, 80)}`,
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    drugName: randomItem(drugList).name,
    scheduledTime: `${new Date(scheduledDate).toISOString().split('T')[0]} ${scheduledTime}`,
    actualTime: status !== 'pending' ? `${new Date(scheduledDate).toISOString().split('T')[0]} ${randomInt(7, 22)}:${String(randomInt(0, 59)).padStart(2, '0')}` : undefined,
    dosage: randomItem(drugList).dosage,
    status,
    administeredBy: status !== 'pending' ? `staff_${randomInt(1, 20)}` : undefined,
    administeredByName: status !== 'pending' ? randomName() : undefined,
    note: status === 'missed' ? '老人已休息，未服药' : status === 'skipped' ? '医生医嘱今日跳过' : undefined,
    createdAt: scheduledDate,
  };
});

export const getMedicationList = async (params: MedicationQueryParams = {}): Promise<PageResult<Medication>> => {
  return mockDelay(() => {
    let filtered = [...mockMedications];
    const { elderId, status, startDate, endDate, drugName, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(m => m.elderId === elderId);
    }
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    if (startDate) {
      filtered = filtered.filter(m => m.startDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(m => m.endDate <= endDate);
    }
    if (drugName) {
      filtered = filtered.filter(m => m.drugName.includes(drugName) || m.genericName.includes(drugName));
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getMedicationDetail = async (id: string): Promise<Medication> => {
  return mockDelay(() => {
    const medication = mockMedications.find(m => m.id === id);
    if (!medication) {
      throw new Error('用药不存在');
    }
    return mockSuccess(medication).data;
  }, 200);
};

export const createMedication = async (data: MedicationCreateParams): Promise<Medication> => {
  return mockDelay(() => {
    const newMedication: Medication = {
      ...data,
      id: randomId(),
      remainingQuantity: data.quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMedications.unshift(newMedication);
    return mockSuccess(newMedication, '创建成功').data;
  }, 300);
};

export const updateMedication = async (id: string, data: Partial<MedicationCreateParams>): Promise<Medication> => {
  return mockDelay(() => {
    const index = mockMedications.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('用药不存在');
    }
    const updated = { ...mockMedications[index], ...data, updatedAt: new Date().toISOString() };
    mockMedications[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteMedication = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockMedications.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('用药不存在');
    }
    mockMedications.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const getMedicationRecords = async (params: MedicationRecordQueryParams = {}): Promise<PageResult<MedicationRecord>> => {
  return mockDelay(() => {
    let filtered = [...mockMedicationRecords];
    const { elderId, medicationId, status, startDate, endDate, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(r => r.elderId === elderId);
    }
    if (medicationId) {
      filtered = filtered.filter(r => r.medicationId === medicationId);
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (startDate) {
      filtered = filtered.filter(r => r.scheduledTime >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.scheduledTime <= endDate);
    }
    filtered.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const recordMedication = async (recordId: string, status: MedicationStatus, note?: string): Promise<MedicationRecord> => {
  return mockDelay(() => {
    const index = mockMedicationRecords.findIndex(r => r.id === recordId);
    if (index === -1) {
      throw new Error('记录不存在');
    }
    const updated = {
      ...mockMedicationRecords[index],
      status,
      actualTime: new Date().toISOString(),
      administeredBy: 'current_user',
      administeredByName: '当前用户',
      note,
    };
    mockMedicationRecords[index] = updated;
    return mockSuccess(updated, '记录成功').data;
  }, 200);
};

export const getTodayMedications = async (elderId?: string): Promise<MedicationRecord[]> => {
  return mockDelay(() => {
    const today = new Date().toISOString().split('T')[0];
    let records = mockMedicationRecords.filter(r => r.scheduledTime.startsWith(today));
    if (elderId) {
      records = records.filter(r => r.elderId === elderId);
    }
    records.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return mockSuccess(records).data;
  }, 200);
};

export const getElderActiveMedications = async (elderId: string): Promise<Medication[]> => {
  return mockDelay(() => {
    const medications = mockMedications.filter(m => m.elderId === elderId && m.status === 'active');
    return mockSuccess(medications).data;
  }, 200);
};

export const getMedicationStats = async (elderId?: string): Promise<{
  total: number;
  active: number;
  completed: number;
  discontinued: number;
  todayTotal: number;
  todayTaken: number;
  todayMissed: number;
  todayPending: number;
  adherenceRate: number;
}> => {
  return mockDelay(() => {
    let meds = mockMedications;
    let records = mockMedicationRecords;
    if (elderId) {
      meds = meds.filter(m => m.elderId === elderId);
      records = records.filter(r => r.elderId === elderId);
    }
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.scheduledTime.startsWith(today));
    const takenCount = records.filter(r => r.status === 'taken').length;
    const totalRecords = records.filter(r => r.status !== 'pending').length;
    return mockSuccess({
      total: meds.length,
      active: meds.filter(m => m.status === 'active').length,
      completed: meds.filter(m => m.status === 'completed').length,
      discontinued: meds.filter(m => m.status === 'discontinued').length,
      todayTotal: todayRecords.length,
      todayTaken: todayRecords.filter(r => r.status === 'taken').length,
      todayMissed: todayRecords.filter(r => r.status === 'missed').length,
      todayPending: todayRecords.filter(r => r.status === 'pending').length,
      adherenceRate: totalRecords > 0 ? Number(((takenCount / totalRecords) * 100).toFixed(1)) : 0,
    }).data;
  }, 300);
};

export const getMedicationReminders = async (): Promise<MedicationRecord[]> => {
  return mockDelay(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const pendingRecords = mockMedicationRecords.filter(r => r.scheduledTime.startsWith(today) && r.status === 'pending');
    return mockSuccess(pendingRecords).data;
  }, 200);
};

export default {
  getMedicationList,
  getMedicationDetail,
  createMedication,
  updateMedication,
  deleteMedication,
  getMedicationRecords,
  recordMedication,
  getTodayMedications,
  getElderActiveMedications,
  getMedicationStats,
  getMedicationReminders,
};
