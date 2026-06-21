import { useMemo } from 'react';
import { Card, Tag, List, Badge } from 'antd';
import {
  FileTextOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  ArrowRightOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { CareService, MedicationRecord, Alert } from '@/types';
import { mockCareServices, mockMedicationRecords, mockAlerts } from '@/mock';
import { useAuthStore } from '@/stores/authStore';

const getGreeting = (): string => {
  const hour = dayjs().hour();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

const alertTypeMap: Record<string, string> = {
  fall: '跌倒',
  inactivity: '活动异常',
  out_of_bed: '离床',
  heart_rate: '心率异常',
  respiration: '呼吸异常',
  sos: 'SOS紧急呼叫',
  medication_miss: '漏服药',
  door: '房门异常',
  smoke: '烟雾报警',
  gas: '燃气泄漏',
};

const alertLevelMap: Record<number, { color: string; label: string }> = {
  1: { color: 'blue', label: '低' },
  2: { color: 'orange', label: '中' },
  3: { color: 'red', label: '高' },
};

const taskStatusMap: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'blue', label: '待执行' },
  in_progress: { color: 'orange', label: '进行中' },
};

const medStatusMap: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'blue', label: '待服药' },
  missed: { color: 'red', label: '漏服' },
  refused: { color: 'orange', label: '拒服' },
};

export default function CaregiverHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const todayStr = dayjs().format('YYYY-MM-DD');

  const todayTasks = useMemo(
    () =>
      mockCareServices.filter(
        (s) =>
          dayjs(s.scheduledAt).format('YYYY-MM-DD') === todayStr &&
          (s.status === 'scheduled' || s.status === 'in_progress'),
      ),
    [todayStr],
  );

  const todayMedications = useMemo(
    () =>
      mockMedicationRecords.filter(
        (m) =>
          dayjs(m.scheduledTime).format('YYYY-MM-DD') === todayStr &&
          (m.status === 'scheduled' || m.status === 'missed' || m.status === 'refused'),
      ),
    [todayStr],
  );

  const todayAlerts = useMemo(
    () =>
      mockAlerts.filter(
        (a) =>
          dayjs(a.triggeredAt).format('YYYY-MM-DD') === todayStr &&
          a.status !== 'resolved' && a.status !== 'closed',
      ),
    [todayStr],
  );

  const taskCount = todayTasks.length;
  const medCount = todayMedications.filter((m) => m.status === 'scheduled').length;
  const missedCount = todayMedications.filter((m) => m.status === 'missed').length;
  const alertCount = todayAlerts.length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="pt-2 pb-1">
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <span>{getGreeting()}</span>
          <span className="text-[#4CAF50]">{user?.name || '护工'}</span>
          <span className="text-2xl">👋</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
          <CalendarOutlined />
          <span>{dayjs().format('YYYY年MM月DD日 dddd')}</span>
        </div>
      </div>

      <Card
        onClick={() => navigate('/caregiver/tasks')}
        className="cursor-pointer rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow"
        styles={{ body: { padding: 0, background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' } }}
      >
        <div className="px-5 pt-5 pb-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-2xl" />
              <span className="text-lg font-semibold">今日照护任务</span>
            </div>
            <Badge count={taskCount} showZero size="default" offset={[0, 0]} color="#fff" style={{ color: '#4CAF50', fontWeight: 'bold' }} />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{taskCount}</span>
            <span className="text-white/80 text-sm">项待执行/进行中</span>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl">
          <List
            size="small"
            dataSource={todayTasks.slice(0, 2)}
            locale={{ emptyText: '暂无待办任务' }}
            renderItem={(item: CareService) => (
              <List.Item className="px-5 py-3 border-0">
                <div className="flex-1 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{item.elderName}</span>
                    <Tag color={taskStatusMap[item.status].color} className="m-0">
                      {item.type}
                    </Tag>
                  </div>
                  <span className="text-gray-500 text-sm">{dayjs(item.scheduledAt).format('HH:mm')}</span>
                </div>
              </List.Item>
            )}
          />
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[#4CAF50]">
            <span className="text-sm font-medium">查看全部</span>
            <ArrowRightOutlined />
          </div>
        </div>
      </Card>

      <Card
        onClick={() => navigate('/caregiver/medication')}
        className="cursor-pointer rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow"
        styles={{ body: { padding: 0, background: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)' } }}
      >
        <div className="px-5 pt-5 pb-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MedicineBoxOutlined className="text-2xl" />
              <span className="text-lg font-semibold">待服药提醒</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge count={medCount} showZero size="small" color="#fff" style={{ color: '#1E88E5', fontWeight: 'bold' }} />
              {missedCount > 0 && (
                <Badge count={`漏${missedCount}`} size="small" color="#FF5252" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{medCount + missedCount}</span>
            <span className="text-white/80 text-sm">
              项待处理
              {missedCount > 0 && <span className="ml-1 text-yellow-200">（含漏服{missedCount}）</span>}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl">
          <List
            size="small"
            dataSource={todayMedications.slice(0, 2)}
            locale={{ emptyText: '暂无服药提醒' }}
            renderItem={(item: MedicationRecord) => (
              <List.Item className="px-5 py-3 border-0">
                <div className="flex-1 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{item.elderName}</span>
                    <Tag color={medStatusMap[item.status].color} className="m-0">
                      {item.medicationName}
                    </Tag>
                  </div>
                  <span className="text-gray-500 text-sm">{dayjs(item.scheduledTime).format('HH:mm')}</span>
                </div>
              </List.Item>
            )}
          />
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[#1E88E5]">
            <span className="text-sm font-medium">查看全部</span>
            <ArrowRightOutlined />
          </div>
        </div>
      </Card>

      <Card
        onClick={() => navigate('/caregiver/alerts')}
        className="cursor-pointer rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow"
        styles={{ body: { padding: 0, background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)' } }}
      >
        <div className="px-5 pt-5 pb-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOutlined className="text-2xl" />
              <span className="text-lg font-semibold">待处理告警</span>
            </div>
            <Badge count={alertCount} showZero size="default" color="#fff" style={{ color: '#F44336', fontWeight: 'bold' }} />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{alertCount}</span>
            <span className="text-white/80 text-sm">项告警待处理</span>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl">
          <List
            size="small"
            dataSource={todayAlerts.slice(0, 2)}
            locale={{ emptyText: '暂无待处理告警' }}
            renderItem={(item: Alert) => (
              <List.Item className="px-5 py-3 border-0">
                <div className="flex-1 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{alertTypeMap[item.type] || item.type}</span>
                    <span className="text-gray-500 text-sm">{item.elderName}</span>
                    <Tag color={alertLevelMap[item.level].color} className="m-0">
                      {alertLevelMap[item.level].label}级
                    </Tag>
                  </div>
                  <span className="text-gray-500 text-sm">{dayjs(item.triggeredAt).format('HH:mm')}</span>
                </div>
              </List.Item>
            )}
          />
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[#F44336]">
            <span className="text-sm font-medium">查看全部</span>
            <ArrowRightOutlined />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-sm border-0" styles={{ body: { padding: '16px 20px' } }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
            <SafetyCertificateOutlined className="text-xl text-[#FF9800]" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">今日值班提醒</div>
            <div className="text-sm text-gray-500 mt-1">
              今日 <span className="text-[#FF9800] font-medium">{user?.name || '您'}</span> 负责白班（08:00-20:00），请按时完成各项照护任务，关注老人健康状态。
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <UserOutlined />
              <span>当前在岗 · 正常值班</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
