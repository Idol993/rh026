export type NursingLevel = 'level1' | 'level2' | 'level3' | 'level4' | 'special';

export type AlertType = 'health' | 'fall' | 'sos' | 'medication' | 'device' | 'abnormal';

export type ServiceType = 'daily' | 'nursing' | 'medical' | 'rehabilitation' | 'psychological' | 'meal';

export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'ignored';

export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial';

export type Gender = 'male' | 'female';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'unknown';

export type VisitType = 'family' | 'friend' | 'other';

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export type MedicationStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export type Role = 'admin' | 'nurse' | 'doctor' | 'worker' | 'family' | 'elder';

export const NURSING_LEVEL_MAP: Record<NursingLevel, string> = {
  level1: '特级护理',
  level2: '一级护理',
  level3: '二级护理',
  level4: '三级护理',
  special: '特殊护理',
};

export const ALERT_TYPE_MAP: Record<AlertType, string> = {
  health: '健康异常',
  fall: '跌倒告警',
  sos: '紧急呼救',
  medication: '用药提醒',
  device: '设备异常',
  abnormal: '异常行为',
};

export const ALERT_STATUS_MAP: Record<AlertStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  ignored: '已忽略',
};

export const SERVICE_TYPE_MAP: Record<ServiceType, string> = {
  daily: '日常照料',
  nursing: '护理服务',
  medical: '医疗服务',
  rehabilitation: '康复服务',
  psychological: '心理服务',
  meal: '餐饮服务',
};

export const SERVICE_STATUS_MAP: Record<ServiceStatus, string> = {
  pending: '待执行',
  in_progress: '执行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, string> = {
  unpaid: '待支付',
  paid: '已支付',
  refunded: '已退款',
  partial: '部分支付',
};

export const GENDER_MAP: Record<Gender, string> = {
  male: '男',
  female: '女',
};

export const MARITAL_STATUS_MAP: Record<MaritalStatus, string> = {
  single: '未婚',
  married: '已婚',
  divorced: '离异',
  widowed: '丧偶',
};

export const BLOOD_TYPE_MAP: Record<BloodType, string> = {
  A: 'A型',
  B: 'B型',
  AB: 'AB型',
  O: 'O型',
  unknown: '未知',
};

export const VISIT_TYPE_MAP: Record<VisitType, string> = {
  family: '家属探视',
  friend: '朋友探视',
  other: '其他探视',
};

export const VISIT_STATUS_MAP: Record<VisitStatus, string> = {
  pending: '待审核',
  approved: '已批准',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已取消',
};

export const MEDICATION_STATUS_MAP: Record<MedicationStatus, string> = {
  pending: '待服用',
  taken: '已服用',
  missed: '漏服',
  skipped: '跳过',
};

export const ROLE_MAP: Record<Role, string> = {
  admin: '系统管理员',
  nurse: '护士',
  doctor: '医生',
  worker: '护工',
  family: '家属',
  elder: '老人',
};

export const ALERT_LEVEL_COLORS: Record<AlertType, string> = {
  health: '#faad14',
  fall: '#f5222d',
  sos: '#f5222d',
  medication: '#1890ff',
  device: '#faad14',
  abnormal: '#722ed1',
};

export const NURSING_LEVEL_COLORS: Record<NursingLevel, string> = {
  level1: '#f5222d',
  level2: '#fa8c16',
  level3: '#faad14',
  level4: '#52c41a',
  special: '#722ed1',
};

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  daily: '#1890ff',
  nursing: '#52c41a',
  medical: '#f5222d',
  rehabilitation: '#722ed1',
  psychological: '#13c2c2',
  meal: '#fa8c16',
};

export const HEALTH_THRESHOLDS = {
  heartRate: { min: 60, max: 100 },
  bloodPressure: { systolicMin: 90, systolicMax: 140, diastolicMin: 60, diastolicMax: 90 },
  bloodSugar: { min: 3.9, max: 6.1 },
  bloodOxygen: { min: 95 },
  temperature: { min: 36.0, max: 37.3 },
  weight: { min: 40, max: 100 },
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DEFAULT_PAGE_SIZE = 10;
