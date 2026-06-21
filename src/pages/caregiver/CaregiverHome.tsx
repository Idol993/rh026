import { useMemo, useEffect } from 'react';
import { Card, Tag, List, Badge, Timeline, Button, Divider } from 'antd';
import {
  FileTextOutlined, MedicineBoxOutlined, AlertOutlined,
  ArrowRightOutlined, CalendarOutlined, SafetyCertificateOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCareServiceStore } from '@/stores/careServiceStore';
import { useMedicationStore } from '@/stores/medicationStore';
import { useAlertStore, ALERT_TYPE_MAP, CARE_SERVICE_STATUS_MAP, MED_STATUS_MAP } from '@/stores/alertStore';
import { useAuthStore } from '@/stores/authStore';
import type { CareService, MedicationRecord, Alert, HandoverItem } from '@/types';

const getGreeting = () => {
  const h = dayjs().hour();
  return h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
};

const alertLevelMap: Record<number, { color: string; label: string }> = {
  1: { color: 'blue', label: '低' }, 2: { color: 'orange', label: '中' }, 3: { color: 'red', label: '高' },
};

type TimelineItemType = 'service' | 'medication' | 'alert';

interface MergedTimelineItem {
  id: string;
  type: TimelineItemType;
  timestamp: string;
  elderName: string;
  title: string;
  operator?: string;
  status: string;
  color: string;
  note?: string;
}

const HANDOVER_COLORS: Record<HandoverItem['type'], string> = {
  service: '#4CAF50', medication: '#1E88E5', alert: '#F44336',
};

const HANDOVER_LABELS: Record<HandoverItem['type'], string> = {
  service: '服务', medication: '服药', alert: '告警',
};

const TYPE_ICONS: Record<TimelineItemType, JSX.Element> = {
  service: <FileTextOutlined />, medication: <MedicineBoxOutlined />, alert: <AlertOutlined />,
};

export default function CaregiverHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const initServices = useCareServiceStore(s => s.initIfNeeded);
  const initMeds = useMedicationStore(s => s.initIfNeeded);
  const initAlerts = useAlertStore(s => s.initIfNeeded);
  const getTodayServices = useCareServiceStore(s => s.getTodayServices);
  const getTodayRecords = useMedicationStore(s => s.getTodayRecords);
  const getTodayAlerts = useAlertStore(s => s.getTodayAlerts);
  const getLatestHandover = useAlertStore(s => s.getLatestHandoverForToday);

  useEffect(() => { initServices(); initMeds(); initAlerts(); }, [initServices, initMeds, initAlerts]);

  const todayServices = useMemo(() => getTodayServices(), [getTodayServices]);
  const todayMeds = useMemo(() => getTodayRecords(), [getTodayRecords]);
  const todayAlerts = useMemo(() => getTodayAlerts(), [getTodayAlerts]);
  const latestHandover = useMemo(() => getLatestHandover(), [getLatestHandover]);

  const pendingTasks = useMemo(
    () => todayServices.filter(s => s.status === 'scheduled' || s.status === 'in_progress'),
    [todayServices],
  );
  const pendingMeds = useMemo(
    () => todayMeds.filter(m => ['scheduled', 'missed', 'refused'].includes(m.status)),
    [todayMeds],
  );
  const scheduledMedCount = pendingMeds.filter(m => m.status === 'scheduled').length;
  const missedMedCount = pendingMeds.filter(m => m.status === 'missed').length;
  const pendingAlerts = useMemo(
    () => todayAlerts.filter(a => a.status !== 'resolved' && a.status !== 'closed'),
    [todayAlerts],
  );

  const timelineItems = useMemo(() => {
    const items: MergedTimelineItem[] = [];

    todayServices.forEach(s => {
      if (!['completed', 'in_progress', 'missed'].includes(s.status)) return;
      items.push({
        id: `svc-${s.id}`, type: 'service',
        timestamp: s.completedAt || s.startedAt || s.scheduledAt,
        elderName: s.elderName, title: s.type, operator: s.caregiverName,
        status: CARE_SERVICE_STATUS_MAP[s.status] || s.status,
        color: '#4CAF50', note: s.notes,
      });
    });

    todayMeds.forEach(m => {
      if (!['taken', 'missed', 'refused'].includes(m.status)) return;
      items.push({
        id: `med-${m.id}`, type: 'medication',
        timestamp: m.takenAt || m.scheduledTime,
        elderName: m.elderName || '', title: m.medicationName, operator: m.notedBy,
        status: MED_STATUS_MAP[m.status] || m.status,
        color: '#1E88E5', note: m.note,
      });
    });

    todayAlerts.forEach(a => {
      if (!['resolved', 'closed', 'processing'].includes(a.status)) return;
      const statusLabel = a.status === 'processing' ? '处理中' : a.status === 'resolved' ? '已解决' : '已关闭';
      const lastNote = a.handlingNotes.length > 0 ? a.handlingNotes[a.handlingNotes.length - 1].note : a.description;
      items.push({
        id: `alert-${a.id}`, type: 'alert',
        timestamp: a.resolvedAt || a.acknowledgedAt || a.triggeredAt,
        elderName: a.elderName || '', title: ALERT_TYPE_MAP[a.type] || a.type, operator: a.assignedToName,
        status: statusLabel, color: '#F44336', note: lastNote,
      });
    });

    return items
      .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
      .slice(0, 20);
  }, [todayServices, todayMeds, todayAlerts]);

  const cardGradient = (c1: string, c2: string) =>
    `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;

  const EntryCard = ({
    onClick, color1, color2, icon, title, count, countText,
    extraBadge, data, renderItem,
  }: {
    onClick: () => void; color1: string; color2: string;
    icon: React.ReactNode; title: string; count: number; countText: React.ReactNode;
    extraBadge?: React.ReactNode;
    data: any[];
    renderItem: (item: any) => React.ReactNode;
  }) => (
    <Card
      onClick={onClick}
      className="cursor-pointer rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow"
      styles={{ body: { padding: 0, background: cardGradient(color1, color2) } }}
    >
      <div className="px-5 pt-5 pb-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-lg font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge count={count} showZero size="default" color="#fff"
              style={{ color: color1, fontWeight: 'bold' }} />
            {extraBadge}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{count}</span>
          <span className="text-white/80 text-sm">{countText}</span>
        </div>
      </div>
      <div className="bg-white rounded-b-2xl">
        <List size="small" dataSource={data.slice(0, 2)}
          locale={{ emptyText: '暂无数据' }}
          renderItem={(item) => (
            <List.Item className="px-5 py-3 border-0">{renderItem(item)}</List.Item>
          )} />
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between"
          style={{ color: color1 }}>
          <span className="text-sm font-medium">查看全部</span>
          <ArrowRightOutlined />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-8">
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

      <EntryCard
        onClick={() => navigate('/caregiver/tasks')}
        color1="#4CAF50" color2="#66BB6A"
        icon={<FileTextOutlined />} title="今日照护任务"
        count={pendingTasks.length} countText="项待执行/进行中"
        data={pendingTasks}
        renderItem={(item: CareService) => (
          <div className="flex-1 flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{item.elderName}</span>
              <Tag color={item.status === 'in_progress' ? 'orange' : 'blue'} className="m-0">
                {item.type}
              </Tag>
            </div>
            <span className="text-gray-500 text-sm">{dayjs(item.scheduledAt).format('HH:mm')}</span>
          </div>
        )}
      />

      <EntryCard
        onClick={() => navigate('/caregiver/medication')}
        color1="#1E88E5" color2="#42A5F5"
        icon={<MedicineBoxOutlined />} title="待服药提醒"
        count={scheduledMedCount + missedMedCount}
        countText={
          missedMedCount > 0
            ? <span>项待处理<span className="ml-1 text-yellow-200">（含漏服{missedMedCount}）</span></span>
            : '项待处理'
        }
        extraBadge={
          missedMedCount > 0
            ? <Badge count={`漏${missedMedCount}`} size="small" color="#FF5252" />
            : undefined
        }
        data={pendingMeds}
        renderItem={(item: MedicationRecord) => {
          const tagColor = item.status === 'scheduled' ? 'blue' : item.status === 'missed' ? 'red' : 'orange';
          return (
            <div className="flex-1 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{item.elderName}</span>
                <Tag color={tagColor} className="m-0">{item.medicationName}</Tag>
              </div>
              <span className="text-gray-500 text-sm">{dayjs(item.scheduledTime).format('HH:mm')}</span>
            </div>
          );
        }}
      />

      <EntryCard
        onClick={() => navigate('/caregiver/alerts')}
        color1="#F44336" color2="#EF5350"
        icon={<AlertOutlined />} title="待处理告警"
        count={pendingAlerts.length} countText="项告警待处理"
        data={pendingAlerts}
        renderItem={(item: Alert) => (
          <div className="flex-1 flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{ALERT_TYPE_MAP[item.type] || item.type}</span>
              <span className="text-gray-500 text-sm">{item.elderName}</span>
              <Tag color={alertLevelMap[item.level].color} className="m-0">
                {alertLevelMap[item.level].label}级
              </Tag>
            </div>
            <span className="text-gray-500 text-sm">{dayjs(item.triggeredAt).format('HH:mm')}</span>
          </div>
        )}
      />

      <Card className="rounded-2xl shadow-sm border-0"
        styles={{ body: { padding: '16px 20px' } }}
        title={
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <ReloadOutlined className="text-gray-500" />
            <span>值班进度时间线</span>
            <Tag color="blue" className="m-0 ml-auto">{timelineItems.length} 条记录</Tag>
          </div>
        }>
        {timelineItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">暂无值班记录</div>
        ) : (
          <Timeline items={timelineItems.map(t => ({
            color: t.color,
            dot: <span style={{ color: t.color }}>{TYPE_ICONS[t.type]}</span>,
            children: (
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">
                    {t.elderName} · {t.title}
                  </span>
                  <span className="text-gray-400 text-xs">{dayjs(t.timestamp).format('HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Tag color={t.color} className="m-0" style={{ fontSize: '11px', padding: '0 6px' }}>
                    {t.status}
                  </Tag>
                  {t.operator && <span className="text-xs text-gray-400">处理人：{t.operator}</span>}
                </div>
                {t.note && (
                  <div className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">{t.note}</div>
                )}
              </div>
            ),
          }))} />
        )}
      </Card>

      {latestHandover && (
        <Card className="rounded-2xl shadow-sm border-0"
          styles={{ body: { padding: '16px 20px' } }}
          title={
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <SafetyCertificateOutlined className="text-[#FF9800]" />
              <span>最新交接记录</span>
            </div>
          }>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{latestHandover.fromCaregiverName}</span>
                <ArrowRightOutlined className="text-gray-400" />
                <span className="font-medium text-[#4CAF50]">{latestHandover.toCaregiverName}</span>
              </div>
              <span className="text-gray-400 text-xs">{dayjs(latestHandover.createdAt).format('HH:mm')}</span>
            </div>
            {latestHandover.shiftNote && (
              <div className="text-sm text-gray-600 bg-[#FFF8E1] rounded-lg px-3 py-2">
                {latestHandover.shiftNote}
              </div>
            )}
            {latestHandover.items.length > 0 && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <div className="space-y-2">
                  {latestHandover.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Tag color={HANDOVER_COLORS[item.type]} className="m-0 mt-0.5"
                        style={{ fontSize: '11px', padding: '0 6px' }}>
                        {HANDOVER_LABELS[item.type]}
                      </Tag>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{item.elderName}</span>
                        <span className="text-gray-500 ml-1">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      <Button type="primary" size="large" block
        onClick={() => navigate('/caregiver/handover')}
        className="rounded-xl h-12 text-base font-medium"
        style={{
          background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
          border: 'none', boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
        }}
        icon={<SafetyCertificateOutlined />}>
        开始交班
      </Button>
    </div>
  );
}
