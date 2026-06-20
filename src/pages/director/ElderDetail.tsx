import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Tabs, Table, Timeline, Badge } from 'antd';
import { ArrowLeft, User, Heart, Pill, Phone, Wifi, ClipboardList } from 'lucide-react';
import { mockElders } from '@/mock';
import { formatDateTime } from '@/utils/date';

const CARE_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  special: { label: '特级护理', color: 'red' },
  level1: { label: '一级护理', color: 'orange' },
  level2: { label: '二级护理', color: 'blue' },
  level3: { label: '三级护理', color: 'green' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '在住', color: 'green' },
  discharged: { label: '出院', color: 'orange' },
  deceased: { label: '已故', color: 'default' },
};

const MOBILITY_MAP: Record<string, string> = { normal: '正常行走', assisted: '需辅助', wheelchair: '轮椅', bedridden: '卧床' };
const COGNITIVE_MAP: Record<string, string> = { normal: '正常', mild: '轻度障碍', moderate: '中度障碍', severe: '重度障碍' };

const LOG_TYPE_MAP: Record<string, { color: string; label: string }> = {
  vital: { color: 'blue', label: '体征监测' },
  medication: { color: 'green', label: '用药记录' },
  service: { color: 'orange', label: '护理服务' },
  alert: { color: 'red', label: '预警记录' },
  note: { color: 'gray', label: '护理备注' },
};

export default function ElderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const elder = useMemo(() => mockElders.find(e => e.id === id), [id]);

  if (!elder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <User size={48} className="mb-4" />
        <p>未找到该老人档案</p>
        <a className="text-blue-500 mt-2 cursor-pointer" onClick={() => navigate('/director/elders')}>返回列表</a>
      </div>
    );
  }

  const cl = CARE_LEVEL_MAP[elder.careLevel] || { label: elder.careLevel, color: 'default' };
  const st = STATUS_MAP[elder.status] || { label: elder.status, color: 'default' };

  const BasicInfo = () => (
    <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="small">
      <Descriptions.Item label="姓名">{elder.name}</Descriptions.Item>
      <Descriptions.Item label="性别">{elder.gender === 'male' ? '男' : '女'}</Descriptions.Item>
      <Descriptions.Item label="年龄">{elder.age}岁</Descriptions.Item>
      <Descriptions.Item label="身份证号">{elder.idCard}</Descriptions.Item>
      <Descriptions.Item label="住址" span={2}>{elder.address}</Descriptions.Item>
      <Descriptions.Item label="医保类型">{elder.medicalInsurance}</Descriptions.Item>
      <Descriptions.Item label="经济状况">{elder.economicStatus}</Descriptions.Item>
      <Descriptions.Item label="评估报告" span={3}>{elder.assessmentReport}</Descriptions.Item>
    </Descriptions>
  );

  const HealthInfo = () => (
    <div className="space-y-4">
      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" title="既往病史与过敏">
        <Descriptions.Item label="既往病史">{elder.medicalHistory.join('、') || '-'}</Descriptions.Item>
        <Descriptions.Item label="过敏史">{elder.allergies.join('、') || '无'}</Descriptions.Item>
        <Descriptions.Item label="慢性病">{elder.chronicDiseases.join('、') || '-'}</Descriptions.Item>
        <Descriptions.Item label="饮食限制">{elder.dietaryRestrictions.join('、') || '无'}</Descriptions.Item>
      </Descriptions>
      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" title="生理基线与能力评估">
        <Descriptions.Item label="血压基线">{elder.bloodPressureBaseline.systolic}/{elder.bloodPressureBaseline.diastolic} mmHg</Descriptions.Item>
        <Descriptions.Item label="血糖基线">{elder.bloodSugarBaseline} mmol/L</Descriptions.Item>
        <Descriptions.Item label="行动能力">
          <Tag color={elder.mobility === 'normal' ? 'green' : elder.mobility === 'bedridden' ? 'red' : 'orange'}>
            {MOBILITY_MAP[elder.mobility]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="认知状况">
          <Tag color={elder.cognitiveStatus === 'normal' ? 'green' : elder.cognitiveStatus === 'severe' ? 'red' : 'orange'}>
            {COGNITIVE_MAP[elder.cognitiveStatus]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="睡眠习惯" span={2}>{elder.sleepHabits}</Descriptions.Item>
      </Descriptions>
    </div>
  );

  const MedicationInfo = () => (
    <Table
      dataSource={elder.medications} rowKey="id" size="small" pagination={false}
      columns={[
        { title: '药品名称', dataIndex: 'name', width: 150 },
        { title: '剂量', dataIndex: 'dosage', width: 80 },
        { title: '用法', dataIndex: 'usage', width: 60 },
        { title: '频次', dataIndex: 'frequency', width: 100 },
        { title: '服药时间', dataIndex: 'times', width: 140, render: (v: string[]) => v.join('、') },
        { title: '禁忌', dataIndex: 'contraindications', ellipsis: true },
      ]}
    />
  );

  const ContactInfo = () => (
    <Table
      dataSource={elder.emergencyContacts} rowKey="id" size="small" pagination={false}
      columns={[
        { title: '姓名', dataIndex: 'name', width: 100 },
        { title: '关系', dataIndex: 'relationship', width: 100 },
        { title: '电话', dataIndex: 'phone', width: 140 },
        { title: '优先级', dataIndex: 'priority', width: 80, render: (v: number) => <Tag color={v === 1 ? 'red' : 'blue'}>第{v}联系人</Tag> },
        { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => ({ family: '家属', community: '社区', hospital: '医院' }[v] || v) },
      ]}
    />
  );

  const DeviceInfo = () => (
    <Table
      dataSource={elder.devices} rowKey="id" size="small" pagination={false}
      columns={[
        { title: '设备类型', dataIndex: 'name', width: 120 },
        { title: '序列号', dataIndex: 'serialNumber', width: 160 },
        {
          title: '在线状态', dataIndex: 'status', width: 100,
          render: (v: string) => (
            <Badge status={v === 'online' ? 'success' : v === 'error' ? 'error' : 'default'}
              text={v === 'online' ? '在线' : v === 'error' ? '异常' : '离线'} />
          ),
        },
        { title: '最后在线时间', dataIndex: 'lastOnline', render: (v: string) => formatDateTime(v, 'MM-DD HH:mm') },
      ]}
    />
  );

  const ServiceLogs = () => (
    <Timeline
      items={(elder.careLogs || []).slice(0, 20).map(log => ({
        color: LOG_TYPE_MAP[log.type]?.color || 'gray',
        children: (
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Tag color={LOG_TYPE_MAP[log.type]?.color}>{LOG_TYPE_MAP[log.type]?.label}</Tag>
              <span className="text-xs text-gray-400">{formatDateTime(log.timestamp, 'MM-DD HH:mm')}</span>
              {log.operator && <span className="text-xs text-gray-400">{log.operator}</span>}
            </div>
            <div className="text-sm text-gray-700">{log.content}</div>
            {log.status && <span className="text-xs text-gray-400 ml-2">[{log.status}]</span>}
          </div>
        ),
      }))}
    />
  );

  const tabItems = [
    { key: 'basic', label: <span className="flex items-center gap-1"><User size={14} /> 基本信息</span>, children: <BasicInfo /> },
    { key: 'health', label: <span className="flex items-center gap-1"><Heart size={14} /> 健康档案</span>, children: <HealthInfo /> },
    { key: 'medication', label: <span className="flex items-center gap-1"><Pill size={14} /> 用药计划</span>, children: <MedicationInfo /> },
    { key: 'contact', label: <span className="flex items-center gap-1"><Phone size={14} /> 紧急联系人</span>, children: <ContactInfo /> },
    { key: 'device', label: <span className="flex items-center gap-1"><Wifi size={14} /> 设备绑定</span>, children: <DeviceInfo /> },
    { key: 'logs', label: <span className="flex items-center gap-1"><ClipboardList size={14} /> 服务记录</span>, children: <ServiceLogs /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <a className="flex items-center gap-1 text-blue-500 cursor-pointer hover:text-blue-700"
          onClick={() => navigate('/director/elders')}>
          <ArrowLeft size={16} /> 返回列表
        </a>
      </div>

      <Card className="rounded-xl shadow-sm" bodyStyle={{ padding: '20px 24px' }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {elder.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl font-bold text-gray-800">{elder.name}</span>
              <Tag color={cl.color}>{cl.label}</Tag>
              <Tag color={st.color}>{st.label}</Tag>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{elder.gender === 'male' ? '男' : '女'}</span>
              <span>{elder.age}岁</span>
              {elder.roomNumber && <span>房间 {elder.roomNumber}-{elder.bedNumber}</span>}
              <span>{elder.careType === 'home' ? '居家照护' : '机构照护'}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl shadow-sm" bodyStyle={{ padding: '4px 16px' }}>
        <Tabs items={tabItems} defaultActiveKey="basic" />
      </Card>
    </div>
  );
}
