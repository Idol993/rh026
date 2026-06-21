import type {
  User,
  Elder,
  HealthData,
  Alert,
  CareService,
  MedicationRecord,
  Visit,
  Bill,
  CareLog,
  EmergencyContact,
  Device,
  Medication,
} from '../types';

const now = (() => {
  const d = new Date();
  d.setHours(10, 30, 0, 0);
  return d;
})();
const formatDate = (date: Date): string => date.toISOString();

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addHours = (date: Date, hours: number): Date => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

const addMinutes = (date: Date, minutes: number): Date => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'director',
    password: '123456',
    name: '张院长',
    role: 'director',
    phone: '13800138000',
    avatar: '',
    status: 'active',
    createdAt: formatDate(addDays(now, -365)),
  },
  {
    id: 'user2',
    username: 'nurse',
    password: '123456',
    name: '李护士',
    role: 'nurse',
    phone: '13800138001',
    avatar: '',
    status: 'active',
    createdAt: formatDate(addDays(now, -300)),
  },
  {
    id: 'user3',
    username: 'caregiver',
    password: '123456',
    name: '王护工',
    role: 'caregiver',
    phone: '13800138002',
    avatar: '',
    status: 'active',
    createdAt: formatDate(addDays(now, -200)),
  },
  {
    id: 'user4',
    username: 'family',
    password: '123456',
    name: '刘家属',
    role: 'family',
    phone: '13800138003',
    avatar: '',
    status: 'active',
    createdAt: formatDate(addDays(now, -180)),
    elderId: 'elder1',
  },
];

const emergencyContacts = (elderId: string): EmergencyContact[] => [
  {
    id: `${elderId}-ec1`,
    name: '张伟',
    relationship: '儿子',
    phone: '13900139001',
    priority: 1,
    type: 'family',
  },
  {
    id: `${elderId}-ec2`,
    name: '李芳',
    relationship: '女儿',
    phone: '13900139002',
    priority: 2,
    type: 'family',
  },
];

const devices = (elderId: string): Device[] => [
  {
    id: `${elderId}-dev1`,
    type: 'mattress',
    name: '智能床垫',
    serialNumber: `MT-${elderId}-001`,
    status: 'online',
    lastOnline: formatDate(addMinutes(now, -10)),
  },
  {
    id: `${elderId}-dev2`,
    type: 'bracelet',
    name: '健康手环',
    serialNumber: `BR-${elderId}-002`,
    status: 'online',
    lastOnline: formatDate(addMinutes(now, -5)),
  },
  {
    id: `${elderId}-dev3`,
    type: 'pillbox',
    name: '智能药盒',
    serialNumber: `PB-${elderId}-003`,
    status: 'online',
    lastOnline: formatDate(addMinutes(now, -15)),
  },
];

const medications = (elderId: string): Medication[] => [
  {
    id: `${elderId}-med1`,
    name: '硝苯地平缓释片',
    dosage: '30mg',
    usage: '口服',
    times: ['08:00', '20:00'],
    frequency: '每日2次',
    contraindications: '低血压患者慎用',
    prescriptionSource: '市人民医院',
    validUntil: formatDate(addDays(now, 90)),
    reminders: true,
  },
  {
    id: `${elderId}-med2`,
    name: '盐酸二甲双胍片',
    dosage: '0.5g',
    usage: '口服',
    times: ['07:00', '12:00', '18:00'],
    frequency: '每日3次',
    contraindications: '肾功能不全者禁用',
    prescriptionSource: '市人民医院',
    validUntil: formatDate(addDays(now, 60)),
    reminders: true,
  },
];

const generateCareLogs = (elderId: string, elderName: string): CareLog[] => {
  const logs: CareLog[] = [];
  const baseTime = addDays(now, -7);
  
  for (let i = 0; i < 30; i++) {
    const logTime = addHours(baseTime, i * 6);
    const types: CareLog['type'][] = ['vital', 'medication', 'service', 'alert', 'note'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let content = '';
    let operator = '';
    let status = '';
    
    switch (type) {
      case 'vital':
        content = '生命体征监测：血压135/85mmHg，心率72次/分，血氧98%，体温36.5℃';
        operator = '李护士';
        status = '正常';
        break;
      case 'medication':
        content = '服用硝苯地平缓释片30mg';
        operator = '王护工';
        status = '已完成';
        break;
      case 'service':
        content = '协助进食早餐，进食情况良好';
        operator = '王护工';
        status = '已完成';
        break;
      case 'alert':
        content = '心率异常告警，已派人查看';
        operator = '李护士';
        status = '已处理';
        break;
      case 'note':
        content = '老人精神状态良好，情绪稳定';
        operator = '张院长';
        status = '';
        break;
    }
    
    logs.push({
      id: `${elderId}-log-${i}`,
      timestamp: formatDate(logTime),
      type,
      content,
      operator,
      status,
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const mockElders: Elder[] = [
  {
    id: 'elder1',
    name: '陈桂英',
    gender: 'female',
    age: 78,
    avatar: '',
    idCard: '110101194806151234',
    address: '北京市朝阳区幸福小区3号楼2单元501',
    careType: 'institution',
    careLevel: 'level2',
    roomNumber: '302',
    bedNumber: 'A',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '生活需要部分协助，认知功能正常，高血压、糖尿病慢性病管理中',
    medicalHistory: ['高血压20年', '糖尿病15年', '冠心病5年'],
    allergies: ['青霉素过敏', '海鲜过敏'],
    chronicDiseases: ['高血压', '糖尿病', '冠心病'],
    bloodPressureBaseline: { systolic: 140, diastolic: 90 },
    bloodSugarBaseline: 7.8,
    dietaryRestrictions: ['低盐饮食', '低糖饮食', '低脂肪饮食'],
    mobility: 'assisted',
    cognitiveStatus: 'normal',
    sleepHabits: '每日22:00入睡，6:00起床，午间休息1小时',
    emergencyContacts: emergencyContacts('elder1'),
    devices: devices('elder1'),
    medications: medications('elder1'),
    status: 'active',
    createdAt: formatDate(addDays(now, -365)),
    careLogs: generateCareLogs('elder1', '陈桂英'),
  },
  {
    id: 'elder2',
    name: '王德明',
    gender: 'male',
    age: 82,
    avatar: '',
    idCard: '110102194403205678',
    address: '北京市海淀区中关村大街1号',
    careType: 'institution',
    careLevel: 'level3',
    roomNumber: '201',
    bedNumber: 'B',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '行动不便需轮椅代步，轻度认知障碍，需专人照护',
    medicalHistory: ['冠心病10年', '关节炎8年', '脑梗塞3年'],
    allergies: ['磺胺类药物过敏'],
    chronicDiseases: ['冠心病', '关节炎', '脑梗塞后遗症'],
    bloodPressureBaseline: { systolic: 135, diastolic: 85 },
    bloodSugarBaseline: 6.5,
    dietaryRestrictions: ['低嘌呤饮食', '易消化食物'],
    mobility: 'wheelchair',
    cognitiveStatus: 'mild',
    sleepHabits: '每日21:30入睡，5:30起床，睡眠质量一般',
    emergencyContacts: [
      { id: 'elder2-ec1', name: '王建国', relationship: '儿子', phone: '13900139011', priority: 1, type: 'family' },
      { id: 'elder2-ec2', name: '王秀兰', relationship: '女儿', phone: '13900139012', priority: 2, type: 'family' },
    ],
    devices: devices('elder2'),
    medications: [
      {
        id: 'elder2-med1',
        name: '阿司匹林肠溶片',
        dosage: '100mg',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '出血性疾病禁用',
        prescriptionSource: '市人民医院',
        validUntil: formatDate(addDays(now, 120)),
        reminders: true,
      },
      {
        id: 'elder2-med2',
        name: '阿托伐他汀钙片',
        dosage: '20mg',
        usage: '口服',
        times: ['20:00'],
        frequency: '每日1次',
        contraindications: '肝功能异常者慎用',
        prescriptionSource: '市人民医院',
        validUntil: formatDate(addDays(now, 120)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -300)),
    careLogs: generateCareLogs('elder2', '王德明'),
  },
  {
    id: 'elder3',
    name: '李淑华',
    gender: 'female',
    age: 75,
    avatar: '',
    idCard: '110103195108109012',
    address: '北京市西城区西单北大街100号',
    careType: 'institution',
    careLevel: 'level1',
    roomNumber: '401',
    bedNumber: 'A',
    medicalInsurance: '城镇居民医保',
    economicStatus: '退休金一般',
    assessmentReport: '生活基本自理，健康状况良好，需常规健康监测',
    medicalHistory: ['高血压5年', '骨质疏松3年'],
    allergies: [],
    chronicDiseases: ['高血压', '骨质疏松'],
    bloodPressureBaseline: { systolic: 130, diastolic: 80 },
    bloodSugarBaseline: 5.8,
    dietaryRestrictions: ['低盐饮食'],
    mobility: 'normal',
    cognitiveStatus: 'normal',
    sleepHabits: '每日22:30入睡，6:30起床，作息规律',
    emergencyContacts: [
      { id: 'elder3-ec1', name: '李明', relationship: '儿子', phone: '13900139021', priority: 1, type: 'family' },
    ],
    devices: [
      { id: 'elder3-dev1', type: 'bracelet', name: '健康手环', serialNumber: 'BR-elder3-001', status: 'online', lastOnline: formatDate(addMinutes(now, -8)) },
    ],
    medications: [
      {
        id: 'elder3-med1',
        name: '碳酸钙D3片',
        dosage: '1.2g',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '高钙血症禁用',
        prescriptionSource: '社区医院',
        validUntil: formatDate(addDays(now, 180)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -250)),
    careLogs: generateCareLogs('elder3', '李淑华'),
  },
  {
    id: 'elder4',
    name: '张富贵',
    gender: 'male',
    age: 85,
    avatar: '',
    idCard: '110104194101153456',
    address: '北京市东城区东长安街10号',
    careType: 'institution',
    careLevel: 'special',
    roomNumber: '101',
    bedNumber: 'A',
    medicalInsurance: '离休医疗',
    economicStatus: '离休待遇',
    assessmentReport: '长期卧床，重度认知障碍，需要24小时专人照护',
    medicalHistory: ['阿尔茨海默病8年', '糖尿病20年', '高血压30年', '帕金森综合征5年'],
    allergies: ['青霉素过敏'],
    chronicDiseases: ['阿尔茨海默病', '糖尿病', '高血压', '帕金森综合征'],
    bloodPressureBaseline: { systolic: 150, diastolic: 95 },
    bloodSugarBaseline: 8.5,
    dietaryRestrictions: ['流质饮食', '低糖饮食', '低盐饮食'],
    mobility: 'bedridden',
    cognitiveStatus: 'severe',
    sleepHabits: '睡眠不规律，时常昼夜颠倒',
    emergencyContacts: [
      { id: 'elder4-ec1', name: '张卫国', relationship: '儿子', phone: '13900139031', priority: 1, type: 'family' },
      { id: 'elder4-ec2', name: '张卫民', relationship: '儿子', phone: '13900139032', priority: 2, type: 'family' },
    ],
    devices: [
      ...devices('elder4'),
      { id: 'elder4-dev4', type: 'door', name: '门磁传感器', serialNumber: 'DR-elder4-004', status: 'online', lastOnline: formatDate(addMinutes(now, -3)) },
    ],
    medications: [
      ...medications('elder4'),
      {
        id: 'elder4-med3',
        name: '美多芭',
        dosage: '0.25g',
        usage: '口服',
        times: ['07:00', '12:00', '17:00', '22:00'],
        frequency: '每日4次',
        contraindications: '闭角型青光眼禁用',
        prescriptionSource: '市第一医院',
        validUntil: formatDate(addDays(now, 60)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -400)),
    careLogs: generateCareLogs('elder4', '张富贵'),
  },
  {
    id: 'elder5',
    name: '刘秀兰',
    gender: 'female',
    age: 72,
    avatar: '',
    idCard: '110105195405207890',
    address: '北京市丰台区丰台路50号',
    careType: 'home',
    careLevel: 'level1',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '居家养老，生活完全自理，健康状况良好',
    medicalHistory: ['高血脂3年'],
    allergies: [],
    chronicDiseases: ['高血脂'],
    bloodPressureBaseline: { systolic: 125, diastolic: 75 },
    bloodSugarBaseline: 5.5,
    dietaryRestrictions: ['低脂肪饮食'],
    mobility: 'normal',
    cognitiveStatus: 'normal',
    sleepHabits: '每日22:00入睡，6:00起床，习惯午休',
    emergencyContacts: [
      { id: 'elder5-ec1', name: '刘芳', relationship: '女儿', phone: '13900139041', priority: 1, type: 'family' },
    ],
    devices: [
      { id: 'elder5-dev1', type: 'bracelet', name: '健康手环', serialNumber: 'BR-elder5-001', status: 'online', lastOnline: formatDate(addMinutes(now, -12)) },
      { id: 'elder5-dev2', type: 'smoke', name: '烟雾报警器', serialNumber: 'SM-elder5-002', status: 'online', lastOnline: formatDate(addMinutes(now, -20)) },
      { id: 'elder5-dev3', type: 'gas', name: '燃气报警器', serialNumber: 'GS-elder5-003', status: 'online', lastOnline: formatDate(addMinutes(now, -20)) },
    ],
    medications: [
      {
        id: 'elder5-med1',
        name: '瑞舒伐他汀钙片',
        dosage: '10mg',
        usage: '口服',
        times: ['20:00'],
        frequency: '每日1次',
        contraindications: '肝功能异常者慎用',
        prescriptionSource: '社区医院',
        validUntil: formatDate(addDays(now, 90)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -200)),
    careLogs: generateCareLogs('elder5', '刘秀兰'),
  },
  {
    id: 'elder6',
    name: '赵志强',
    gender: 'male',
    age: 79,
    avatar: '',
    idCard: '110106194709102345',
    address: '北京市石景山区石景山路80号',
    careType: 'institution',
    careLevel: 'level2',
    roomNumber: '305',
    bedNumber: 'B',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '前列腺增生术后康复中，生活部分自理，需协助护理',
    medicalHistory: ['前列腺增生', '高血压10年', '慢性胃炎5年'],
    allergies: ['花粉过敏'],
    chronicDiseases: ['高血压', '慢性胃炎'],
    bloodPressureBaseline: { systolic: 138, diastolic: 88 },
    bloodSugarBaseline: 6.0,
    dietaryRestrictions: ['易消化食物', '避免辛辣刺激'],
    mobility: 'assisted',
    cognitiveStatus: 'normal',
    sleepHabits: '每日21:00入睡，5:00起床，夜间如厕2-3次',
    emergencyContacts: [
      { id: 'elder6-ec1', name: '赵刚', relationship: '儿子', phone: '13900139051', priority: 1, type: 'family' },
      { id: 'elder6-ec2', name: '赵敏', relationship: '女儿', phone: '13900139052', priority: 2, type: 'family' },
    ],
    devices: devices('elder6'),
    medications: [
      {
        id: 'elder6-med1',
        name: '缬沙坦胶囊',
        dosage: '80mg',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '妊娠禁用',
        prescriptionSource: '市人民医院',
        validUntil: formatDate(addDays(now, 90)),
        reminders: true,
      },
      {
        id: 'elder6-med2',
        name: '奥美拉唑肠溶胶囊',
        dosage: '20mg',
        usage: '口服',
        times: ['07:00'],
        frequency: '每日1次',
        contraindications: '过敏者禁用',
        prescriptionSource: '市人民医院',
        validUntil: formatDate(addDays(now, 60)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -150)),
    careLogs: generateCareLogs('elder6', '赵志强'),
  },
  {
    id: 'elder7',
    name: '孙玉珍',
    gender: 'female',
    age: 83,
    avatar: '',
    idCard: '110107194302286789',
    address: '北京市通州区新华大街200号',
    careType: 'institution',
    careLevel: 'level3',
    roomNumber: '203',
    bedNumber: 'A',
    medicalInsurance: '城镇居民医保',
    economicStatus: '低保',
    assessmentReport: '中度认知障碍，糖尿病并发症，视力障碍，需要全面照护',
    medicalHistory: ['糖尿病25年', '糖尿病视网膜病变', '白内障术后', '中度认知障碍'],
    allergies: [],
    chronicDiseases: ['糖尿病', '认知障碍'],
    bloodPressureBaseline: { systolic: 145, diastolic: 92 },
    bloodSugarBaseline: 9.0,
    dietaryRestrictions: ['糖尿病饮食', '低盐低脂'],
    mobility: 'wheelchair',
    cognitiveStatus: 'moderate',
    sleepHabits: '睡眠不规律，时有夜间躁动',
    emergencyContacts: [
      { id: 'elder7-ec1', name: '孙明', relationship: '侄子', phone: '13900139061', priority: 1, type: 'family' },
      { id: 'elder7-ec2', name: '社区居委会', relationship: '社区', phone: '010-12345678', priority: 3, type: 'community' },
    ],
    devices: [
      ...devices('elder7'),
      { id: 'elder7-dev4', type: 'smoke', name: '烟雾报警器', serialNumber: 'SM-elder7-004', status: 'online', lastOnline: formatDate(addMinutes(now, -25)) },
    ],
    medications: medications('elder7'),
    status: 'active',
    createdAt: formatDate(addDays(now, -280)),
    careLogs: generateCareLogs('elder7', '孙玉珍'),
  },
  {
    id: 'elder8',
    name: '周国华',
    gender: 'male',
    age: 76,
    avatar: '',
    idCard: '110108195011054567',
    address: '北京市昌平区回龙观大街100号',
    careType: 'institution',
    careLevel: 'level2',
    roomNumber: '403',
    bedNumber: 'B',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '脑梗塞后遗症，左侧肢体活动不利，需要康复训练和生活协助',
    medicalHistory: ['脑梗塞2年', '高血压15年', '高血脂10年'],
    allergies: [],
    chronicDiseases: ['高血压', '高血脂', '脑梗塞后遗症'],
    bloodPressureBaseline: { systolic: 142, diastolic: 88 },
    bloodSugarBaseline: 6.2,
    dietaryRestrictions: ['低盐低脂', '易消化'],
    mobility: 'assisted',
    cognitiveStatus: 'normal',
    sleepHabits: '每日22:00入睡，6:30起床，午休1小时',
    emergencyContacts: [
      { id: 'elder8-ec1', name: '周涛', relationship: '儿子', phone: '13900139071', priority: 1, type: 'family' },
      { id: 'elder8-ec2', name: '周婷', relationship: '女儿', phone: '13900139072', priority: 2, type: 'family' },
    ],
    devices: devices('elder8'),
    medications: [
      {
        id: 'elder8-med1',
        name: '氯吡格雷片',
        dosage: '75mg',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '出血性疾病禁用',
        prescriptionSource: '市第一医院',
        validUntil: formatDate(addDays(now, 90)),
        reminders: true,
      },
      {
        id: 'elder8-med2',
        name: '氨氯地平片',
        dosage: '5mg',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '低血压禁用',
        prescriptionSource: '市第一医院',
        validUntil: formatDate(addDays(now, 90)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -220)),
    careLogs: generateCareLogs('elder8', '周国华'),
  },
  {
    id: 'elder9',
    name: '吴秀梅',
    gender: 'female',
    age: 70,
    avatar: '',
    idCard: '110109195603188901',
    address: '北京市顺义区府前东街50号',
    careType: 'home',
    careLevel: 'level1',
    medicalInsurance: '城镇职工医保',
    economicStatus: '退休金稳定',
    assessmentReport: '居家养老，健康状况良好，定期体检',
    medicalHistory: ['甲状腺结节术后', '骨关节炎'],
    allergies: [],
    chronicDiseases: ['骨关节炎'],
    bloodPressureBaseline: { systolic: 120, diastolic: 78 },
    bloodSugarBaseline: 5.3,
    dietaryRestrictions: [],
    mobility: 'normal',
    cognitiveStatus: 'normal',
    sleepHabits: '每日22:30入睡，7:00起床，喜欢晨练',
    emergencyContacts: [
      { id: 'elder9-ec1', name: '吴昊', relationship: '儿子', phone: '13900139081', priority: 1, type: 'family' },
    ],
    devices: [
      { id: 'elder9-dev1', type: 'bracelet', name: '健康手环', serialNumber: 'BR-elder9-001', status: 'online', lastOnline: formatDate(addMinutes(now, -6)) },
      { id: 'elder9-dev2', type: 'gas', name: '燃气报警器', serialNumber: 'GS-elder9-002', status: 'online', lastOnline: formatDate(addMinutes(now, -15)) },
    ],
    medications: [
      {
        id: 'elder9-med1',
        name: '氨基葡萄糖胶囊',
        dosage: '0.75g',
        usage: '口服',
        times: ['08:00', '20:00'],
        frequency: '每日2次',
        contraindications: '过敏者禁用',
        prescriptionSource: '社区医院',
        validUntil: formatDate(addDays(now, 120)),
        reminders: false,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -180)),
    careLogs: generateCareLogs('elder9', '吴秀梅'),
  },
  {
    id: 'elder10',
    name: '郑天保',
    gender: 'male',
    age: 88,
    avatar: '',
    idCard: '110110193807015678',
    address: '北京市大兴区黄村东大街100号',
    careType: 'institution',
    careLevel: 'special',
    roomNumber: '102',
    bedNumber: 'A',
    medicalInsurance: '离休医疗',
    economicStatus: '离休待遇',
    assessmentReport: '高龄体弱，多种慢性疾病，完全丧失自理能力，需要24小时重症照护',
    medicalHistory: ['冠心病30年', '高血压40年', '糖尿病25年', '慢性肾功能不全', '褥疮', '肺部感染史'],
    allergies: ['青霉素过敏', '头孢类过敏'],
    chronicDiseases: ['冠心病', '高血压', '糖尿病', '慢性肾功能不全'],
    bloodPressureBaseline: { systolic: 155, diastolic: 98 },
    bloodSugarBaseline: 9.5,
    dietaryRestrictions: ['流质饮食', '低蛋白', '低糖', '低盐'],
    mobility: 'bedridden',
    cognitiveStatus: 'moderate',
    sleepHabits: '嗜睡与失眠交替，需密切观察',
    emergencyContacts: [
      { id: 'elder10-ec1', name: '郑明', relationship: '儿子', phone: '13900139091', priority: 1, type: 'family' },
      { id: 'elder10-ec2', name: '郑华', relationship: '女儿', phone: '13900139092', priority: 2, type: 'family' },
      { id: 'elder10-ec3', name: '北京协和医院', relationship: '定点医院', phone: '010-88888888', priority: 3, type: 'hospital' },
    ],
    devices: [
      ...devices('elder10'),
      { id: 'elder10-dev4', type: 'smoke', name: '烟雾报警器', serialNumber: 'SM-elder10-004', status: 'online', lastOnline: formatDate(addMinutes(now, -10)) },
      { id: 'elder10-dev5', type: 'door', name: '门磁传感器', serialNumber: 'DR-elder10-005', status: 'online', lastOnline: formatDate(addMinutes(now, -5)) },
    ],
    medications: [
      ...medications('elder10'),
      {
        id: 'elder10-med3',
        name: '单硝酸异山梨酯片',
        dosage: '20mg',
        usage: '口服',
        times: ['08:00', '16:00'],
        frequency: '每日2次',
        contraindications: '青光眼禁用',
        prescriptionSource: '北京协和医院',
        validUntil: formatDate(addDays(now, 30)),
        reminders: true,
      },
      {
        id: 'elder10-med4',
        name: '呋塞米片',
        dosage: '20mg',
        usage: '口服',
        times: ['08:00'],
        frequency: '每日1次',
        contraindications: '低钾血症禁用',
        prescriptionSource: '北京协和医院',
        validUntil: formatDate(addDays(now, 30)),
        reminders: true,
      },
    ],
    status: 'active',
    createdAt: formatDate(addDays(now, -500)),
    careLogs: generateCareLogs('elder10', '郑天保'),
  },
];

export const mockHealthData: HealthData[] = (() => {
  const data: HealthData[] = [];
  const elders = mockElders.slice(0, 5);
  const startTime = addHours(now, -23);
  
  for (let h = 0; h < 24; h++) {
    const timestamp = addHours(startTime, h);
    const isNight = h >= 0 && h < 6;
    const isSleep = h >= 22 || h < 6;
    
    elders.forEach((elder, eIdx) => {
      const baseHeartRate = 70 + eIdx * 5;
      const baseSystolic = 130 + eIdx * 5;
      const baseDiastolic = 80 + eIdx * 3;
      
      const heartRateVar = Math.floor(Math.random() * 15) - 5;
      const sysVar = Math.floor(Math.random() * 10) - 3;
      const diaVar = Math.floor(Math.random() * 6) - 2;
      const tempVar = Math.random() * 0.4 - 0.1;
      const activityVar = Math.floor(Math.random() * 20);
      
      let heartRate = baseHeartRate + heartRateVar;
      let systolic = baseSystolic + sysVar;
      let diastolic = baseDiastolic + diaVar;
      
      if (isNight) {
        heartRate -= 8;
        systolic -= 10;
        diastolic -= 5;
      }
      
      let sleepStatus: HealthData['sleepStatus'] = 'awake';
      let inBed = false;
      let activityLevel = 30 + activityVar;
      
      if (isSleep) {
        inBed = true;
        activityLevel = Math.random() > 0.7 ? 15 : 5;
        sleepStatus = Math.random() > 0.5 ? 'deep' : 'light';
      } else if (h >= 12 && h <= 14) {
        inBed = Math.random() > 0.5;
        sleepStatus = inBed ? 'light' : 'awake';
        activityLevel = inBed ? 10 : 40;
      }
      
      data.push({
        id: `hd-${h}-${elder.id}`,
        elderId: elder.id,
        timestamp: formatDate(timestamp),
        heartRate,
        bloodPressure: { systolic, diastolic },
        bloodOxygen: 95 + Math.floor(Math.random() * 5),
        temperature: 36.4 + tempVar,
        sleepStatus,
        inBed,
        activityLevel,
      });
    });
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
})();

export const mockAlerts: Alert[] = [
  {
    id: 'alert1',
    elderId: 'elder1',
    elderName: '陈桂英',
    type: 'heart_rate',
    level: 2,
    status: 'resolved',
    triggeredAt: formatDate(addHours(now, -48)),
    acknowledgedAt: formatDate(addHours(now, -47.5)),
    resolvedAt: formatDate(addHours(now, -47)),
    location: '302房间A床',
    description: '心率异常，检测到心率115次/分，超过正常范围',
    assignedTo: 'user2',
    assignedToName: '李护士',
    handlingNotes: [
      {
        id: 'an1',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(now, -47.5)),
        action: '确认告警',
        note: '已收到告警，立即前往查看',
      },
      {
        id: 'an2',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(now, -47)),
        action: '处理完成',
        note: '老人情绪激动导致心率升高，休息后恢复正常，心率82次/分',
      },
    ],
  },
  {
    id: 'alert2',
    elderId: 'elder2',
    elderName: '王德明',
    type: 'inactivity',
    level: 2,
    status: 'resolved',
    triggeredAt: formatDate(addHours(now, -36)),
    acknowledgedAt: formatDate(addHours(now, -35.8)),
    resolvedAt: formatDate(addHours(now, -35.5)),
    location: '201房间B床',
    description: '活动异常，2小时未检测到明显活动',
    assignedTo: 'user3',
    assignedToName: '王护工',
    handlingNotes: [
      {
        id: 'an3',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(now, -35.8)),
        action: '确认告警',
        note: '已前往查看',
      },
      {
        id: 'an4',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(now, -35.5)),
        action: '处理完成',
        note: '老人在午睡，已确认状态正常',
      },
    ],
  },
  {
    id: 'alert3',
    elderId: 'elder4',
    elderName: '张富贵',
    type: 'out_of_bed',
    level: 2,
    status: 'processing',
    triggeredAt: formatDate(addHours(now, -2)),
    acknowledgedAt: formatDate(addHours(now, -1.9)),
    location: '101房间A床',
    description: '离床告警，老人不在床上超过10分钟',
    assignedTo: 'user3',
    assignedToName: '王护工',
    handlingNotes: [
      {
        id: 'an5',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(now, -1.9)),
        action: '确认告警',
        note: '已收到告警，正在前往101房间',
      },
    ],
  },
  {
    id: 'alert4',
    elderId: 'elder7',
    elderName: '孙玉珍',
    type: 'sos',
    level: 3,
    status: 'pending',
    triggeredAt: formatDate(addMinutes(now, -15)),
    location: '203房间A床',
    description: 'SOS紧急呼叫，老人按下紧急呼叫按钮',
    handlingNotes: [],
  },
  {
    id: 'alert5',
    elderId: 'elder1',
    elderName: '陈桂英',
    type: 'medication_miss',
    level: 1,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -3)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -3)), 1)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -3)), 1.5)),
    location: '302房间A床',
    description: '漏服药物提醒，未检测到8:00服药记录',
    assignedTo: 'user3',
    assignedToName: '王护工',
    handlingNotes: [
      {
        id: 'an6',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(new Date(addDays(now, -3)), 1)),
        action: '确认告警',
        note: '已收到提醒，前往确认',
      },
      {
        id: 'an7',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(new Date(addDays(now, -3)), 1.5)),
        action: '处理完成',
        note: '老人已补服药物，状态良好',
      },
    ],
  },
  {
    id: 'alert6',
    elderId: 'elder5',
    elderName: '刘秀兰',
    type: 'smoke',
    level: 3,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -5)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -5)), 0.1)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -5)), 0.5)),
    location: '家中厨房',
    description: '烟雾报警，检测到烟雾浓度超标',
    assignedTo: 'user2',
    assignedToName: '李护士',
    handlingNotes: [
      {
        id: 'an8',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -5)), 0.1)),
        action: '确认告警',
        note: '立即联系老人和家属，同时拨打119',
      },
      {
        id: 'an9',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -5)), 0.5)),
        action: '处理完成',
        note: '老人做饭时油烟触发报警，无危险，已确认安全',
      },
    ],
  },
  {
    id: 'alert7',
    elderId: 'elder10',
    elderName: '郑天保',
    type: 'respiration',
    level: 3,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -7)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -7)), 0.05)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -7)), 2)),
    location: '102房间A床',
    description: '呼吸异常，检测到呼吸频率异常',
    assignedTo: 'user2',
    assignedToName: '李护士',
    handlingNotes: [
      {
        id: 'an10',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -7)), 0.05)),
        action: '确认告警',
        note: '立即前往查看，同时通知医生',
      },
      {
        id: 'an11',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -7)), 0.5)),
        action: '转院处理',
        note: '老人呼吸困难，已联系120转送医院',
      },
      {
        id: 'an12',
        userId: 'user1',
        userName: '张院长',
        timestamp: formatDate(addHours(new Date(addDays(now, -7)), 2)),
        action: '处理完成',
        note: '老人在医院接受治疗，情况稳定，已通知家属',
      },
    ],
  },
  {
    id: 'alert8',
    elderId: 'elder4',
    elderName: '张富贵',
    type: 'door',
    level: 2,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -10)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -10)), 0.1)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -10)), 0.3)),
    location: '101房门',
    description: '房门异常开启，重度认知障碍老人独自外出风险',
    assignedTo: 'user3',
    assignedToName: '王护工',
    handlingNotes: [
      {
        id: 'an13',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(new Date(addDays(now, -10)), 0.1)),
        action: '确认告警',
        note: '立即前往查看',
      },
      {
        id: 'an14',
        userId: 'user3',
        userName: '王护工',
        timestamp: formatDate(addHours(new Date(addDays(now, -10)), 0.3)),
        action: '处理完成',
        note: '护工进入房间检查，老人在房间内，房门可能被风吹开，已关好',
      },
    ],
  },
  {
    id: 'alert9',
    elderId: 'elder8',
    elderName: '周国华',
    type: 'fall',
    level: 3,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -14)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -14)), 0.08)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -14)), 3)),
    location: '403房间卫生间',
    description: '跌倒告警，手环检测到跌倒动作',
    assignedTo: 'user2',
    assignedToName: '李护士',
    handlingNotes: [
      {
        id: 'an15',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -14)), 0.08)),
        action: '确认告警',
        note: '立即前往查看，通知值班医生',
      },
      {
        id: 'an16',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -14)), 0.25)),
        action: '现场处置',
        note: '老人在卫生间摔倒，右侧髋部疼痛，不能站立，已初步固定',
      },
      {
        id: 'an17',
        userId: 'user1',
        userName: '张院长',
        timestamp: formatDate(addHours(new Date(addDays(now, -14)), 3)),
        action: '处理完成',
        note: '已送医院检查，确诊右侧股骨颈骨折，已安排手术治疗，家属已通知',
      },
    ],
  },
  {
    id: 'alert10',
    elderId: 'elder7',
    elderName: '孙玉珍',
    type: 'gas',
    level: 3,
    status: 'resolved',
    triggeredAt: formatDate(addDays(now, -20)),
    acknowledgedAt: formatDate(addHours(new Date(addDays(now, -20)), 0.05)),
    resolvedAt: formatDate(addHours(new Date(addDays(now, -20)), 1)),
    location: '203房间',
    description: '燃气泄漏报警，检测到燃气浓度超标',
    assignedTo: 'user2',
    assignedToName: '李护士',
    handlingNotes: [
      {
        id: 'an18',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -20)), 0.05)),
        action: '确认告警',
        note: '立即前往，打开门窗通风，关闭燃气阀门',
      },
      {
        id: 'an19',
        userId: 'user2',
        userName: '李护士',
        timestamp: formatDate(addHours(new Date(addDays(now, -20)), 0.5)),
        action: '老人转移',
        note: '已将老人转移至安全区域，生命体征平稳',
      },
      {
        id: 'an20',
        userId: 'user1',
        userName: '张院长',
        timestamp: formatDate(addHours(new Date(addDays(now, -20)), 1)),
        action: '处理完成',
        note: '燃气公司已检修，确认是燃气灶阀门未关严，已对老人进行安全提醒，家属知情',
      },
    ],
  },
];

const serviceTypes = [
  '晨间护理', '协助进食', '生命体征测量', '协助如厕', '康复训练',
  '心理疏导', '协助洗澡', '更换床单位', '协助服药', '户外活动',
  '午间照料', '晚间护理', '协助饮水', '压疮护理', '协助翻身',
];

export const mockCareServices: CareService[] = (() => {
  const services: CareService[] = [];
  const caregivers = [
    { id: 'user3', name: '王护工' },
    { id: 'user5', name: '赵护工' },
    { id: 'user6', name: '钱护工' },
  ];
  const statuses: CareService['status'][] = ['scheduled', 'in_progress', 'completed', 'missed', 'cancelled'];
  
  let serviceId = 1;
  for (let day = 0; day < 5; day++) {
    const baseDate = addDays(now, -day);
    
    mockElders.slice(0, 6).forEach((elder) => {
      const dailyServices = serviceTypes.slice(0, 3 + Math.floor(Math.random() * 2));
      
      dailyServices.forEach((type, idx) => {
        const hour = 7 + idx * 4;
        const scheduledAt = new Date(baseDate);
        scheduledAt.setHours(hour, 0, 0, 0);
        
        const caregiver = caregivers[Math.floor(Math.random() * caregivers.length)];
        const statusDayOffset = day;
        let status: CareService['status'] = 'completed';
        
        if (statusDayOffset === 0) {
          if (hour < new Date().getHours()) {
            status = Math.random() > 0.1 ? 'completed' : 'in_progress';
          } else if (hour === new Date().getHours()) {
            status = Math.random() > 0.5 ? 'in_progress' : 'scheduled';
          } else {
            status = 'scheduled';
          }
        } else {
          status = statuses[Math.floor(Math.random() * 3)];
        }
        
        let startedAt: string | undefined;
        let completedAt: string | undefined;
        let duration: number | undefined;
        let rating: number | undefined;
        let feedback: string | undefined;
        let notes: string | undefined;
        
        if (status === 'in_progress' || status === 'completed') {
          startedAt = formatDate(addMinutes(scheduledAt, Math.floor(Math.random() * 10) - 5));
        }
        
        if (status === 'completed') {
          duration = 30 + Math.floor(Math.random() * 30);
          completedAt = formatDate(addMinutes(new Date(startedAt!), duration));
          rating = 3 + Math.floor(Math.random() * 3);
          
          if (Math.random() > 0.5) {
            feedback = '服务态度很好，很有耐心';
          }
          if (Math.random() > 0.7) {
            notes = '老人今天精神状态不错，食欲良好';
          }
        }
        
        if (status === 'missed') {
          notes = '老人身体不适，暂不适合此项服务';
        }
        
        if (status === 'cancelled') {
          notes = '家属临时取消';
        }
        
        services.push({
          id: `svc-${serviceId++}`,
          elderId: elder.id,
          elderName: elder.name,
          type,
          scheduledAt: formatDate(scheduledAt),
          startedAt,
          completedAt,
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
          duration,
          status,
          notes,
          elderStatus: status === 'completed' ? '良好' : undefined,
          rating,
          feedback,
        });
      });
    });
  }
  
  return services.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
})();

export const mockMedicationRecords: MedicationRecord[] = (() => {
  const records: MedicationRecord[] = [];
  let recordId = 1;
  
  for (let day = 0; day < 5; day++) {
    const baseDate = addDays(now, -day);
    
    mockElders.slice(0, 6).forEach((elder) => {
      elder.medications.forEach((med) => {
        med.times.forEach((timeStr) => {
          const [hour, minute] = timeStr.split(':').map(Number);
          const scheduledTime = new Date(baseDate);
          scheduledTime.setHours(hour, minute, 0, 0);
          
          if (scheduledTime > now && day === 0) {
            return;
          }
          
          const random = Math.random();
          let status: MedicationRecord['status'];
          let takenAt: string | undefined;
          let notedBy: string | undefined;
          let note: string | undefined;
          
          if (day === 0 && scheduledTime > addHours(now, -1)) {
            status = 'scheduled';
          } else if (random < 0.85) {
            status = 'taken';
            takenAt = formatDate(addMinutes(scheduledTime, Math.floor(Math.random() * 15) - 5));
            notedBy = '王护工';
          } else if (random < 0.95) {
            status = 'missed';
            note = '老人外出未归，后续补服';
            notedBy = '李护士';
          } else {
            status = 'refused';
            note = '老人拒绝服药，已告知医生';
            notedBy = '李护士';
          }
          
          records.push({
            id: `mr-${recordId++}`,
            elderId: elder.id,
            elderName: elder.name,
            medicationId: med.id,
            medicationName: med.name,
            scheduledTime: formatDate(scheduledTime),
            takenAt,
            status,
            notedBy,
            note,
          });
        });
      });
    });
  }
  
  return records.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
})();

export const mockVisits: Visit[] = [
  {
    id: 'visit1',
    elderId: 'elder1',
    elderName: '陈桂英',
    applicantName: '张伟',
    applicantPhone: '13900139001',
    relationship: '儿子',
    visitorCount: 2,
    scheduledAt: formatDate(new Date(addDays(now, 3).setHours(14, 0, 0, 0))),
    purpose: '日常探望，陪老人聊天',
    status: 'approved',
    approvedBy: 'user2',
    approvedAt: formatDate(addDays(now, -1)),
  },
  {
    id: 'visit2',
    elderId: 'elder2',
    elderName: '王德明',
    applicantName: '王建国',
    applicantPhone: '13900139011',
    relationship: '儿子',
    visitorCount: 4,
    scheduledAt: formatDate(new Date(addDays(now, 7).setHours(10, 0, 0, 0))),
    purpose: '周末家庭聚会',
    status: 'pending',
  },
  {
    id: 'visit3',
    elderId: 'elder3',
    elderName: '李淑华',
    applicantName: '李明',
    applicantPhone: '13900139021',
    relationship: '儿子',
    visitorCount: 1,
    scheduledAt: formatDate(new Date(addDays(now, -2).setHours(15, 0, 0, 0))),
    purpose: '给老人送生活用品',
    status: 'completed',
    approvedBy: 'user2',
    approvedAt: formatDate(addDays(now, -3)),
    actualArrival: formatDate(new Date(addDays(now, -2).setHours(14, 50, 0, 0))),
    actualDeparture: formatDate(new Date(addDays(now, -2).setHours(17, 30, 0, 0))),
  },
  {
    id: 'visit4',
    elderId: 'elder5',
    elderName: '刘秀兰',
    applicantName: '刘芳',
    applicantPhone: '13900139041',
    relationship: '女儿',
    visitorCount: 3,
    scheduledAt: formatDate(new Date(addDays(now, 1).setHours(11, 0, 0, 0))),
    purpose: '给老人过生日',
    status: 'approved',
    approvedBy: 'user2',
    approvedAt: formatDate(addDays(now, -1)),
  },
  {
    id: 'visit5',
    elderId: 'elder7',
    elderName: '孙玉珍',
    applicantName: '孙明',
    applicantPhone: '13900139061',
    relationship: '侄子',
    visitorCount: 1,
    scheduledAt: formatDate(new Date(addDays(now, -5).setHours(9, 0, 0, 0))),
    purpose: '探视并了解老人近况',
    status: 'rejected',
    approvedBy: 'user1',
    approvedAt: formatDate(addDays(now, -6)),
    rejectReason: '老人当日有医疗检查安排，请改日预约',
  },
  {
    id: 'visit6',
    elderId: 'elder8',
    elderName: '周国华',
    applicantName: '周涛',
    applicantPhone: '13900139071',
    relationship: '儿子',
    visitorCount: 2,
    scheduledAt: formatDate(new Date(addDays(now, -10).setHours(14, 0, 0, 0))),
    purpose: '康复情况探视',
    status: 'completed',
    approvedBy: 'user2',
    approvedAt: formatDate(addDays(now, -11)),
    actualArrival: formatDate(new Date(addDays(now, -10).setHours(13, 55, 0, 0))),
    actualDeparture: formatDate(new Date(addDays(now, -10).setHours(16, 20, 0, 0))),
  },
  {
    id: 'visit7',
    elderId: 'elder10',
    elderName: '郑天保',
    applicantName: '郑明',
    applicantPhone: '13900139091',
    relationship: '儿子',
    visitorCount: 5,
    scheduledAt: formatDate(new Date(addDays(now, 5).setHours(9, 30, 0, 0))),
    purpose: '家属集体探望',
    status: 'rescheduled',
    approvedBy: 'user1',
    approvedAt: formatDate(addDays(now, -2)),
    rejectReason: '建议改为上午9点，避开治疗时间',
  },
  {
    id: 'visit8',
    elderId: 'elder6',
    elderName: '赵志强',
    applicantName: '赵敏',
    applicantPhone: '13900139052',
    relationship: '女儿',
    visitorCount: 2,
    scheduledAt: formatDate(new Date(addDays(now, 14).setHours(10, 0, 0, 0))),
    purpose: '术后康复情况探望',
    status: 'pending',
  },
];

export const mockBills: Bill[] = [
  {
    id: 'bill1',
    elderId: 'elder1',
    elderName: '陈桂英',
    month: '2026-05',
    items: [
      { id: 'bi1', name: '护理费', type: 'care', quantity: 31, unitPrice: 120, amount: 3720, description: '二级护理，每日费用' },
      { id: 'bi2', name: '伙食费', type: 'service', quantity: 31, unitPrice: 50, amount: 1550, description: '每日三餐营养餐' },
      { id: 'bi3', name: '床位费', type: 'service', quantity: 31, unitPrice: 80, amount: 2480, description: '双人间床位费' },
      { id: 'bi4', name: '健康监测', type: 'service', quantity: 31, unitPrice: 30, amount: 930, description: '每日生命体征监测' },
      { id: 'bi5', name: '护理用品', type: 'material', quantity: 1, unitPrice: 200, amount: 200, description: '一次性护理垫、湿巾等' },
    ],
    totalAmount: 8880,
    subsidyAmount: 2000,
    payableAmount: 6880,
    paidAmount: 6880,
    status: 'paid',
    dueDate: formatDate(new Date('2026-06-10')),
    paidAt: formatDate(new Date('2026-06-08')),
    paymentMethod: '微信支付',
  },
  {
    id: 'bill2',
    elderId: 'elder2',
    elderName: '王德明',
    month: '2026-05',
    items: [
      { id: 'bi6', name: '护理费', type: 'care', quantity: 31, unitPrice: 180, amount: 5580, description: '三级护理，每日费用' },
      { id: 'bi7', name: '伙食费', type: 'service', quantity: 31, unitPrice: 50, amount: 1550, description: '每日三餐营养餐' },
      { id: 'bi8', name: '床位费', type: 'service', quantity: 31, unitPrice: 100, amount: 3100, description: '单人间床位费' },
      { id: 'bi9', name: '康复训练', type: 'service', quantity: 12, unitPrice: 150, amount: 1800, description: '肢体康复训练，每周3次' },
      { id: 'bi10', name: '健康监测', type: 'service', quantity: 31, unitPrice: 40, amount: 1240, description: '每日生命体征监测' },
      { id: 'bi11', name: '护理用品', type: 'material', quantity: 1, unitPrice: 350, amount: 350, description: '一次性护理用品、成人纸尿裤' },
      { id: 'bi12', name: '设备使用费', type: 'device', quantity: 31, unitPrice: 10, amount: 310, description: '智能设备月使用费' },
    ],
    totalAmount: 13930,
    subsidyAmount: 3000,
    payableAmount: 10930,
    paidAmount: 5000,
    status: 'partial',
    dueDate: formatDate(new Date('2026-06-10')),
    paidAt: formatDate(new Date('2026-06-12')),
    paymentMethod: '银行转账',
  },
  {
    id: 'bill3',
    elderId: 'elder4',
    elderName: '张富贵',
    month: '2026-05',
    items: [
      { id: 'bi13', name: '护理费', type: 'care', quantity: 31, unitPrice: 300, amount: 9300, description: '特护，24小时专人照护' },
      { id: 'bi14', name: '伙食费', type: 'service', quantity: 31, unitPrice: 60, amount: 1860, description: '特殊营养餐' },
      { id: 'bi15', name: '床位费', type: 'service', quantity: 31, unitPrice: 150, amount: 4650, description: '特护单人间' },
      { id: 'bi16', name: '健康监测', type: 'service', quantity: 31, unitPrice: 80, amount: 2480, description: '24小时实时监测' },
      { id: 'bi17', name: '护理用品', type: 'material', quantity: 1, unitPrice: 800, amount: 800, description: '一次性护理用品、成人纸尿裤、褥疮护理用品' },
      { id: 'bi18', name: '设备使用费', type: 'device', quantity: 31, unitPrice: 25, amount: 775, description: '智能设备月使用费' },
      { id: 'bi19', name: '其他', type: 'other', quantity: 1, unitPrice: 500, amount: 500, description: '特殊药品及耗材' },
    ],
    totalAmount: 20365,
    subsidyAmount: 5000,
    payableAmount: 15365,
    paidAmount: 0,
    status: 'unpaid',
    dueDate: formatDate(new Date('2026-06-10')),
  },
  {
    id: 'bill4',
    elderId: 'elder3',
    elderName: '李淑华',
    month: '2026-05',
    items: [
      { id: 'bi20', name: '护理费', type: 'care', quantity: 31, unitPrice: 80, amount: 2480, description: '一级护理，每日费用' },
      { id: 'bi21', name: '伙食费', type: 'service', quantity: 31, unitPrice: 50, amount: 1550, description: '每日三餐营养餐' },
      { id: 'bi22', name: '床位费', type: 'service', quantity: 31, unitPrice: 80, amount: 2480, description: '双人间床位费' },
      { id: 'bi23', name: '健康监测', type: 'service', quantity: 31, unitPrice: 20, amount: 620, description: '每日生命体征监测' },
    ],
    totalAmount: 7130,
    subsidyAmount: 1500,
    payableAmount: 5630,
    paidAmount: 5630,
    status: 'paid',
    dueDate: formatDate(new Date('2026-06-10')),
    paidAt: formatDate(new Date('2026-06-05')),
    paymentMethod: '支付宝',
  },
  {
    id: 'bill5',
    elderId: 'elder10',
    elderName: '郑天保',
    month: '2026-04',
    items: [
      { id: 'bi24', name: '护理费', type: 'care', quantity: 30, unitPrice: 350, amount: 10500, description: '特护，24小时专人照护' },
      { id: 'bi25', name: '伙食费', type: 'service', quantity: 30, unitPrice: 70, amount: 2100, description: '流质营养餐' },
      { id: 'bi26', name: '床位费', type: 'service', quantity: 30, unitPrice: 200, amount: 6000, description: '医疗监护单人间' },
      { id: 'bi27', name: '健康监测', type: 'service', quantity: 30, unitPrice: 100, amount: 3000, description: '24小时实时监护' },
      { id: 'bi28', name: '护理用品', type: 'material', quantity: 1, unitPrice: 1200, amount: 1200, description: '重症护理用品' },
      { id: 'bi29', name: '设备使用费', type: 'device', quantity: 30, unitPrice: 30, amount: 900, description: '智能设备月使用费' },
      { id: 'bi30', name: '医疗耗材', type: 'material', quantity: 1, unitPrice: 2000, amount: 2000, description: '褥疮治疗耗材及药品' },
    ],
    totalAmount: 25700,
    subsidyAmount: 8000,
    payableAmount: 17700,
    paidAmount: 17700,
    status: 'paid',
    dueDate: formatDate(new Date('2026-05-10')),
    paidAt: formatDate(new Date('2026-05-08')),
    paymentMethod: '银行转账',
  },
];

export const getMockData = () => ({
  users: mockUsers,
  elders: mockElders,
  healthData: mockHealthData,
  alerts: mockAlerts,
  careServices: mockCareServices,
  medicationRecords: mockMedicationRecords,
  visits: mockVisits,
  bills: mockBills,
});

export default getMockData;
