import { useState } from 'react';
import { Card, Tag, Button, Modal, Form, Select, Input, Timeline, message } from 'antd';
import { AlertTriangle, Siren, Heart, BedDouble, DoorOpen, Flame, Wind } from 'lucide-react';
import dayjs from 'dayjs';
import type { Alert } from '@/types';
import { mockAlerts, mockElders } from '@/mock';

const roomMap = Object.fromEntries(mockElders.map(e => [e.id, e.roomNumber ?? '']));

const levelConfig: Record<number, { color: string; label: string; bg: string }> = {
  3: { color: '#cf1322', label: '紧急', bg: 'bg-red-50 border-red-200' },
  2: { color: '#fa8c16', label: '警告', bg: 'bg-orange-50 border-orange-200' },
  1: { color: '#fadb14', label: '提示', bg: 'bg-yellow-50 border-yellow-200' },
};

const typeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  fall: { icon: <AlertTriangle size={18} className="text-red-500" />, label: '跌倒' },
  sos: { icon: <Siren size={18} className="text-red-500" />, label: 'SOS呼叫' },
  heart_rate: { icon: <Heart size={18} className="text-orange-500" />, label: '心率异常' },
  out_of_bed: { icon: <BedDouble size={18} className="text-orange-500" />, label: '离床超时' },
  door: { icon: <DoorOpen size={18} className="text-yellow-600" />, label: '门磁告警' },
  smoke: { icon: <Flame size={18} className="text-red-500" />, label: '烟雾告警' },
  gas: { icon: <Wind size={18} className="text-red-500" />, label: '燃气告警' },
  respiration: { icon: <Heart size={18} className="text-orange-500" />, label: '呼吸异常' },
  inactivity: { icon: <BedDouble size={18} className="text-yellow-600" />, label: '活动异常' },
  medication_miss: { icon: <AlertTriangle size={18} className="text-yellow-600" />, label: '漏服药物' },
};

export default function CaregiverAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [handleModal, setHandleModal] = useState<Alert | null>(null);
  const [form] = Form.useForm();

  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayAlerts = alerts.filter(a => dayjs(a.triggeredAt).format('YYYY-MM-DD') === todayStr);

  const pending = todayAlerts
    .filter(a => a.status === 'pending' || a.status === 'acknowledged' || a.status === 'processing')
    .sort((a, b) => b.level - a.level);
  const resolved = todayAlerts.filter(a => a.status === 'resolved' || a.status === 'closed');

  const openHandleModal = (alert: Alert) => {
    form.resetFields();
    setHandleModal(alert);
  };

  const submitHandle = () => {
    form.validateFields().then(values => {
      setAlerts(prev => prev.map(a =>
        a.id === handleModal!.id
          ? {
            ...a,
            status: 'closed' as const,
            resolvedAt: new Date().toISOString(),
            handlingNotes: [
              ...a.handlingNotes,
              {
                id: `an-${Date.now()}`,
                userId: 'user3',
                userName: '王护工',
                timestamp: new Date().toISOString(),
                action: values.action,
                note: values.note,
              },
            ],
          }
          : a,
      ));
      message.success('告警已关闭');
      setHandleModal(null);
    });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-xl p-3 text-center bg-red-50 text-red-700">
          <div className="text-2xl font-bold">{pending.filter(a => a.level === 3).length}</div>
          <div className="text-sm">紧急</div>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center bg-orange-50 text-orange-700">
          <div className="text-2xl font-bold">{pending.filter(a => a.level === 2).length}</div>
          <div className="text-sm">警告</div>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center bg-yellow-50 text-yellow-700">
          <div className="text-2xl font-bold">{pending.filter(a => a.level === 1).length}</div>
          <div className="text-sm">提示</div>
        </div>
      </div>

      <h3 className="font-semibold text-base mb-3">待处理告警</h3>
      <div className="space-y-3">
        {pending.map(alert => {
          const cfg = levelConfig[alert.level];
          const tCfg = typeConfig[alert.type] ?? { icon: <AlertTriangle size={18} />, label: alert.type };
          return (
            <Card
              key={alert.id}
              size="small"
              className={`rounded-xl border-2 ${cfg.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {tCfg.icon}
                  <span className="font-semibold text-base">{alert.elderName}</span>
                  <span className="text-gray-400 text-sm">{roomMap[alert.elderId] ?? ''}房间</span>
                </div>
                <Tag color={cfg.color}>{cfg.label}</Tag>
              </div>
              <div className="mt-2 text-gray-700">
                <div className="text-sm font-medium">{tCfg.label}</div>
                <div className="text-xs text-gray-500 mt-1">{alert.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  触发时间：{dayjs(alert.triggeredAt).format('MM-DD HH:mm')}
                </div>
              </div>
              <Button
                type="primary"
                danger={alert.level === 3}
                block
                className="mt-3"
                size="large"
                onClick={() => openHandleModal(alert)}
              >
                立即处理
              </Button>
            </Card>
          );
        })}
        {pending.length === 0 && (
          <div className="text-center text-gray-400 py-8">暂无待处理告警</div>
        )}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="font-semibold text-base mt-6 mb-3">已处理告警</h3>
          <Timeline
            items={resolved.slice(0, 8).map(alert => ({
              color: alert.level === 3 ? 'red' : alert.level === 2 ? 'orange' : 'gray',
              children: (
                <div className="text-sm">
                  <span className="font-medium">{alert.elderName}</span>
                  {' - '}{typeConfig[alert.type]?.label ?? alert.type}
                  <div className="text-xs text-gray-400">
                    {dayjs(alert.triggeredAt).format('MM-DD HH:mm')}
                    {alert.resolvedAt && ` → ${dayjs(alert.resolvedAt).format('HH:mm')} 已处理`}
                  </div>
                </div>
              ),
            }))}
          />
        </>
      )}

      <Modal
        title="处理告警"
        open={!!handleModal}
        onOk={submitHandle}
        onCancel={() => setHandleModal(null)}
        okText="关闭告警"
        width={400}
      >
        {handleModal && (
          <div className="mb-3 p-3 rounded-lg bg-gray-50 text-sm">
            <div className="font-semibold">{handleModal.elderName} - {typeConfig[handleModal.type]?.label}</div>
            <div className="text-gray-500 mt-1">{handleModal.description}</div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="到场确认" name="arrival" rules={[{ required: true, message: '请确认到场' }]}>
            <Select placeholder="请选择" options={[
              { value: '已到场', label: '已到场' },
              { value: '正在前往', label: '正在前往' },
            ]} />
          </Form.Item>
          <Form.Item label="处置措施" name="action" rules={[{ required: true }]}>
            <Select placeholder="请选择处置措施" options={[
              { value: '现场检查确认', label: '现场检查确认' },
              { value: '协助老人返回', label: '协助老人返回' },
              { value: '联系医护人员', label: '联系医护人员' },
              { value: '紧急呼叫120', label: '紧急呼叫120' },
              { value: '通知家属', label: '通知家属' },
              { value: '其他', label: '其他' },
            ]} />
          </Form.Item>
          <Form.Item label="老人当前状态" name="elderStatus" rules={[{ required: true }]}>
            <Select options={['安全/正常', '轻微不适', '需要就医', '紧急送医'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="处理备注" name="note">
            <Input.TextArea rows={2} placeholder="请描述处理情况" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
