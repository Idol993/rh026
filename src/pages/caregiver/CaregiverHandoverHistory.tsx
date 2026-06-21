import { useState, useMemo } from 'react';
import { Card, Tag, Modal, Timeline, Button, Segmented, Empty, Divider } from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAlertStore, ALERT_TYPE_MAP } from '@/stores/alertStore';
import { useCareServiceStore } from '@/stores/careServiceStore';
import { useMedicationStore } from '@/stores/medicationStore';
import type { HandoverItem } from '@/types';

const HO_COLORS: Record<HandoverItem['type'], string> = {
  service: '#4CAF50', medication: '#1E88E5', alert: '#F44336',
};
const HO_LABELS: Record<HandoverItem['type'], string> = {
  service: '服务', medication: '服药', alert: '告警',
};
const HO_ROUTES: Record<HandoverItem['type'], string> = {
  service: '/caregiver/tasks', medication: '/caregiver/medication', alert: '/caregiver/alerts',
};

export default function CaregiverHandoverHistory() {
  const navigate = useNavigate();
  const handovers = useAlertStore(s => s.handovers);
  const services = useCareServiceStore(s => s.services);
  const medRecords = useMedicationStore(s => s.records);
  const alerts = useAlertStore(s => s.alerts);

  const [period, setPeriod] = useState('今天');
  const [closedFilter, setClosedFilter] = useState('全部');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredHandovers = useMemo(() => {
    let result = [...handovers];
    if (period === '今天') {
      const today = dayjs().format('YYYY-MM-DD');
      result = result.filter(h => dayjs(h.createdAt).format('YYYY-MM-DD') === today);
    } else if (period === '本周') {
      const weekAgo = dayjs().subtract(7, 'day');
      result = result.filter(h => dayjs(h.createdAt).isAfter(weekAgo));
    }
    if (closedFilter === '未闭环') {
      result = result.filter(h => h.items.some(i => !i.closedAt));
    } else if (closedFilter === '已闭环') {
      result = result.filter(h => h.items.every(i => i.closedAt));
    }
    return result.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [handovers, period, closedFilter]);

  const selectedHandover = useMemo(() =>
    selectedId ? handovers.find(h => h.id === selectedId) || null : null,
  [selectedId, handovers]);

  const getItemDetail = (item: HandoverItem) => {
    if (item.type === 'service') {
      const svc = services.find(s => s.id === item.refId);
      return svc ? { type: 'service' as const, startedAt: svc.startedAt, completedAt: svc.completedAt, duration: svc.duration, elderStatus: svc.elderStatus, notes: svc.notes } : null;
    }
    if (item.type === 'medication') {
      const med = medRecords.find(r => r.id === item.refId);
      return med ? { type: 'medication' as const, takenAt: med.takenAt, notedBy: med.notedBy, note: med.note } : null;
    }
    const alt = alerts.find(a => a.id === item.refId);
    return alt ? { type: 'alert' as const, handlingNotes: alt.handlingNotes } : null;
  };

  const renderDetailContent = (item: HandoverItem) => {
    const detail = getItemDetail(item);
    if (!detail) return null;
    if (detail.type === 'alert') {
      return (
        <Timeline items={detail.handlingNotes.map(n => ({
          color: 'blue',
          children: (
            <div>
              <div className="text-xs text-gray-400">{dayjs(n.timestamp).format('HH:mm')} - {n.userName}</div>
              <div className="text-sm font-medium">{n.action}</div>
              {n.note && <div className="text-sm text-gray-600">{n.note}</div>}
            </div>
          ),
        }))} />
      );
    }
    if (detail.type === 'service') {
      return (
        <div className="space-y-1 text-sm text-gray-600">
          {detail.startedAt && <div>开始：{dayjs(detail.startedAt).format('HH:mm')}</div>}
          {detail.completedAt && <div>完成：{dayjs(detail.completedAt).format('HH:mm')}</div>}
          {detail.duration != null && <div>时长：{detail.duration}分钟</div>}
          {detail.elderStatus && <div>老人状态：{detail.elderStatus}</div>}
          {detail.notes && <div>备注：{detail.notes}</div>}
        </div>
      );
    }
    return (
      <div className="space-y-1 text-sm text-gray-600">
        {detail.takenAt && <div>服药时间：{dayjs(detail.takenAt).format('HH:mm')}</div>}
        {detail.notedBy && <div>记录人：{detail.notedBy}</div>}
        {detail.note && <div>备注：{detail.note}</div>}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3 pt-2">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <span className="text-lg font-semibold text-gray-800">交接记录</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Segmented size="small" options={['今天', '本周', '全部']} value={period} onChange={v => setPeriod(v as string)} />
        <Segmented size="small" options={['全部', '未闭环', '已闭环']} value={closedFilter} onChange={v => setClosedFilter(v as string)} />
      </div>

      {filteredHandovers.length === 0 ? (
        <Empty description="暂无交接记录" />
      ) : (
        <div className="space-y-3">
          {filteredHandovers.map(h => {
            const closedCount = h.items.filter(i => i.closedAt).length;
            const allClosed = closedCount === h.items.length;
            return (
              <Card key={h.id} className="rounded-2xl shadow-sm border-0 cursor-pointer"
                styles={{ body: { padding: '16px 20px' } }}
                onClick={() => setSelectedId(h.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{h.fromCaregiverName}</span>
                    <ArrowRightOutlined className="text-gray-400" />
                    <span className="font-medium text-[#4CAF50]">{h.toCaregiverName}</span>
                  </div>
                  <span className="text-xs text-gray-400">{dayjs(h.createdAt).format('MM-DD HH:mm')}</span>
                </div>
                {h.shiftNote && (
                  <div className="mt-2 text-sm text-gray-600 bg-[#FFF8E1] rounded px-2 py-1">{h.shiftNote}</div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">闭环进度 {closedCount}/{h.items.length}</span>
                  {allClosed ? (
                    <Tag icon={<CheckCircleOutlined />} color="success" className="m-0">已闭环</Tag>
                  ) : (
                    <Tag icon={<ExclamationCircleOutlined />} color="warning" className="m-0">未闭环</Tag>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal title="交接详情" open={!!selectedHandover} onCancel={() => setSelectedId(null)} footer={null} width={400}>
        {selectedHandover && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">{selectedHandover.fromCaregiverName}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-[#4CAF50]">{selectedHandover.toCaregiverName}</span>
              <span className="text-xs text-gray-400 ml-auto">{dayjs(selectedHandover.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            </div>
            {selectedHandover.shiftNote && (
              <div className="text-sm text-gray-600 bg-[#FFF8E1] rounded px-3 py-2">{selectedHandover.shiftNote}</div>
            )}
            <Divider style={{ margin: '8px 0' }} />
            <div className="space-y-3">
              {selectedHandover.items.map((item, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Tag color={HO_COLORS[item.type]} className="m-0">{HO_LABELS[item.type]}</Tag>
                    <span className="font-medium text-gray-800">{item.elderName}</span>
                    <span className="text-gray-500 text-sm">{item.title}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">状态：{item.status}</div>
                  {item.closedAt ? (
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <CheckCircleOutlined /> 已闭环
                      <span className="text-xs text-gray-400 ml-1">{dayjs(item.closedAt).format('HH:mm')} {item.closedBy}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-orange-500"><ExclamationCircleOutlined /> 未闭环</span>
                      <Button size="small" type="link" className="p-0 text-xs"
                        onClick={() => navigate(HO_ROUTES[item.type])}>去处理</Button>
                    </div>
                  )}
                  <div className="mt-2">{renderDetailContent(item)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
