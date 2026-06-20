import { formatDate, formatDateTime, formatAge } from './date';
import {
  NURSING_LEVEL_MAP,
  ALERT_TYPE_MAP,
  ALERT_STATUS_MAP,
  SERVICE_TYPE_MAP,
  SERVICE_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  GENDER_MAP,
  MARITAL_STATUS_MAP,
  BLOOD_TYPE_MAP,
  VISIT_TYPE_MAP,
  VISIT_STATUS_MAP,
  MEDICATION_STATUS_MAP,
  ROLE_MAP,
  type NursingLevel,
  type AlertType,
  type AlertStatus,
  type ServiceType,
  type ServiceStatus,
  type PaymentStatus,
  type Gender,
  type MaritalStatus,
  type BloodType,
  type VisitType,
  type VisitStatus,
  type MedicationStatus,
  type Role,
} from './constants';

export const formatNursingLevel = (level: NursingLevel | string | null | undefined): string => {
  if (!level) return '-';
  return NURSING_LEVEL_MAP[level as NursingLevel] || level;
};

export const formatAlertType = (type: AlertType | string | null | undefined): string => {
  if (!type) return '-';
  return ALERT_TYPE_MAP[type as AlertType] || type;
};

export const formatAlertStatus = (status: AlertStatus | string | null | undefined): string => {
  if (!status) return '-';
  return ALERT_STATUS_MAP[status as AlertStatus] || status;
};

export const formatServiceType = (type: ServiceType | string | null | undefined): string => {
  if (!type) return '-';
  return SERVICE_TYPE_MAP[type as ServiceType] || type;
};

export const formatServiceStatus = (status: ServiceStatus | string | null | undefined): string => {
  if (!status) return '-';
  return SERVICE_STATUS_MAP[status as ServiceStatus] || status;
};

export const formatPaymentStatus = (status: PaymentStatus | string | null | undefined): string => {
  if (!status) return '-';
  return PAYMENT_STATUS_MAP[status as PaymentStatus] || status;
};

export const formatGender = (gender: Gender | string | null | undefined): string => {
  if (!gender) return '-';
  return GENDER_MAP[gender as Gender] || gender;
};

export const formatMaritalStatus = (status: MaritalStatus | string | null | undefined): string => {
  if (!status) return '-';
  return MARITAL_STATUS_MAP[status as MaritalStatus] || status;
};

export const formatBloodType = (type: BloodType | string | null | undefined): string => {
  if (!type) return '-';
  return BLOOD_TYPE_MAP[type as BloodType] || type;
};

export const formatVisitType = (type: VisitType | string | null | undefined): string => {
  if (!type) return '-';
  return VISIT_TYPE_MAP[type as VisitType] || type;
};

export const formatVisitStatus = (status: VisitStatus | string | null | undefined): string => {
  if (!status) return '-';
  return VISIT_STATUS_MAP[status as VisitStatus] || status;
};

export const formatMedicationStatus = (status: MedicationStatus | string | null | undefined): string => {
  if (!status) return '-';
  return MEDICATION_STATUS_MAP[status as MedicationStatus] || status;
};

export const formatRole = (role: Role | string | null | undefined): string => {
  if (!role) return '-';
  return ROLE_MAP[role as Role] || role;
};

export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
  }
  return phone;
};

export const formatIdCard = (idCard: string | null | undefined): string => {
  if (!idCard) return '-';
  if (idCard.length === 18) {
    return `${idCard.slice(0, 6)}********${idCard.slice(-4)}`;
  }
  return idCard;
};

export const formatName = (name: string | null | undefined): string => {
  if (!name) return '-';
  if (name.length <= 1) return name;
  return `${name[0]}${'*'.repeat(name.length - 1)}`;
};

export const formatCurrency = (amount: number | null | undefined, symbol: string = '¥'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatNumber = (num: number | null | undefined, decimals: number = 0): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatPercent = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(decimals)}%`;
};

export const formatHeartRate = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value} 次/分`;
};

export const formatBloodPressure = (systolic: number | null | undefined, diastolic: number | null | undefined): string => {
  if (systolic === null || systolic === undefined || diastolic === null || diastolic === undefined) return '-';
  return `${systolic}/${diastolic} mmHg`;
};

export const formatBloodSugar = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(1)} mmol/L`;
};

export const formatBloodOxygen = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(1)}%`;
};

export const formatTemperature = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(1)} °C`;
};

export const formatWeight = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(1)} kg`;
};

export const formatHeight = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(0)} cm`;
};

export const formatBMI = (weight: number | null | undefined, height: number | null | undefined): string => {
  if (!weight || !height) return '-';
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

export const getBMIStatus = (bmi: number): string => {
  if (bmi < 18.5) return '偏瘦';
  if (bmi < 24) return '正常';
  if (bmi < 28) return '偏胖';
  return '肥胖';
};

export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes < 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const formatDistance = (meters: number | null | undefined): string => {
  if (meters === null || meters === undefined || isNaN(meters) || meters < 0) return '-';
  if (meters < 1000) return `${meters.toFixed(0)} 米`;
  return `${(meters / 1000).toFixed(2)} 公里`;
};

export const formatAddress = (address: string | null | undefined, maxLength: number = 50): string => {
  if (!address) return '-';
  if (address.length <= maxLength) return address;
  return `${address.slice(0, maxLength)}...`;
};

export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatArray = (arr: unknown[] | null | undefined, separator: string = '、'): string => {
  if (!arr || arr.length === 0) return '-';
  return arr.join(separator);
};

export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value ? '是' : '否';
};

export const formatDateOnly = (date: string | null | undefined): string => {
  return formatDate(date);
};

export const formatDateTimeFull = (date: string | null | undefined): string => {
  return formatDateTime(date);
};

export const formatBirthdayWithAge = (birthday: string | null | undefined): string => {
  if (!birthday) return '-';
  return `${formatDate(birthday)} (${formatAge(birthday)})`;
};

export const formatCount = (count: number | null | undefined): string => {
  if (count === null || count === undefined || isNaN(count)) return '0';
  if (count < 10000) return count.toString();
  return `${(count / 10000).toFixed(1)}万`;
};

export const getHealthStatusColor = (value: number, min: number, max: number): string => {
  if (value < min * 0.9 || value > max * 1.1) return '#f5222d';
  if (value < min || value > max) return '#faad14';
  return '#52c41a';
};

export const getHealthStatusText = (value: number, min: number, max: number): string => {
  if (value < min * 0.9 || value > max * 1.1) return '严重异常';
  if (value < min || value > max) return '轻度异常';
  return '正常';
};

export default {
  formatNursingLevel,
  formatAlertType,
  formatAlertStatus,
  formatServiceType,
  formatServiceStatus,
  formatPaymentStatus,
  formatGender,
  formatMaritalStatus,
  formatBloodType,
  formatVisitType,
  formatVisitStatus,
  formatMedicationStatus,
  formatRole,
  formatPhone,
  formatIdCard,
  formatName,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatHeartRate,
  formatBloodPressure,
  formatBloodSugar,
  formatBloodOxygen,
  formatTemperature,
  formatWeight,
  formatHeight,
  formatBMI,
  formatDuration,
  formatFileSize,
  formatDistance,
  formatAddress,
  truncateText,
  capitalize,
  formatArray,
  formatBoolean,
  formatDateOnly,
  formatDateTimeFull,
  formatBirthdayWithAge,
  formatCount,
  getHealthStatusColor,
  getHealthStatusText,
};
