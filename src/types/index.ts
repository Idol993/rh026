export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'director' | 'nurse' | 'caregiver' | 'family';
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  elderId?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  type: 'family' | 'community' | 'hospital';
}

export interface Device {
  id: string;
  type: 'mattress' | 'bracelet' | 'pillbox' | 'smoke' | 'gas' | 'door';
  name: string;
  serialNumber: string;
  status: 'online' | 'offline' | 'error';
  lastOnline: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  usage: string;
  times: string[];
  frequency: string;
  contraindications: string;
  prescriptionSource: string;
  validUntil: string;
  reminders: boolean;
}

export interface CareLog {
  id: string;
  timestamp: string;
  type: 'vital' | 'medication' | 'service' | 'alert' | 'note';
  content: string;
  operator?: string;
  status?: string;
}

export interface Elder {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  avatar?: string;
  idCard: string;
  address: string;
  careType: 'home' | 'institution';
  careLevel: 'level1' | 'level2' | 'level3' | 'special';
  roomNumber?: string;
  bedNumber?: string;
  medicalInsurance: string;
  economicStatus: string;
  assessmentReport: string;
  medicalHistory: string[];
  allergies: string[];
  chronicDiseases: string[];
  bloodPressureBaseline: { systolic: number; diastolic: number };
  bloodSugarBaseline: number;
  dietaryRestrictions: string[];
  mobility: 'normal' | 'assisted' | 'wheelchair' | 'bedridden';
  cognitiveStatus: 'normal' | 'mild' | 'moderate' | 'severe';
  sleepHabits: string;
  emergencyContacts: EmergencyContact[];
  devices: Device[];
  medications: Medication[];
  status: 'active' | 'discharged' | 'deceased';
  createdAt: string;
  careLogs?: CareLog[];
}

export interface HealthData {
  id: string;
  elderId: string;
  timestamp: string;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  bloodOxygen: number;
  temperature: number;
  sleepStatus: 'awake' | 'light' | 'deep';
  inBed: boolean;
  activityLevel: number;
}

export interface AlertNote {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
  note: string;
  photos?: string[];
}

export interface Alert {
  id: string;
  elderId: string;
  elderName?: string;
  type: 'fall' | 'inactivity' | 'out_of_bed' | 'heart_rate' | 'respiration' | 'sos' | 'medication_miss' | 'door' | 'smoke' | 'gas';
  level: 1 | 2 | 3;
  status: 'pending' | 'acknowledged' | 'processing' | 'resolved' | 'closed';
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  location?: string;
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  handlingNotes: AlertNote[];
}

export interface CareService {
  id: string;
  elderId: string;
  elderName: string;
  type: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  caregiverId: string;
  caregiverName: string;
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  notes?: string;
  photos?: string[];
  elderStatus?: string;
  rating?: number;
  feedback?: string;
}

export interface MedicationRecord {
  id: string;
  elderId: string;
  elderName?: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  takenAt?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'refused';
  notedBy?: string;
  note?: string;
}

export interface Visit {
  id: string;
  elderId: string;
  elderName?: string;
  applicantName: string;
  applicantPhone: string;
  relationship: string;
  visitorCount: number;
  scheduledAt: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rescheduled' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  actualArrival?: string;
  actualDeparture?: string;
}

export interface BillItem {
  id: string;
  name: string;
  type: 'care' | 'service' | 'device' | 'material' | 'other';
  quantity: number;
  unitPrice: number;
  amount: number;
  description: string;
}

export interface Bill {
  id: string;
  elderId: string;
  elderName?: string;
  month: string;
  items: BillItem[];
  totalAmount: number;
  subsidyAmount: number;
  payableAmount: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface HandoverItem {
  type: 'service' | 'medication' | 'alert';
  refId: string;
  title: string;
  elderName: string;
  detail: string;
  status: string;
  closedAt?: string;
  closedBy?: string;
}

export interface HandoverRecord {
  id: string;
  fromCaregiverId: string;
  fromCaregiverName: string;
  toCaregiverId: string;
  toCaregiverName: string;
  createdAt: string;
  shiftNote: string;
  items: HandoverItem[];
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}> {}
