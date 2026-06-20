import { useState, useMemo } from 'react';
import { Card, Tag, Button, Modal, Form, Select, Input, Collapse, message } from 'antd';
import { Clock, PlayCircle, CheckCircle, HeartPulse, UtensilsCrossed, Bath, Activity } from 'lucide-react';
import dayjs from 'dayjs';
import type { CareService } from '@/types';
import { mockCareServices, mockElders } from '@/mock';

const roomMap = Object.fromEntries(mockElders.map(e => [e.id, e.roomNumber ?? '']));

const typeIcons: Record<string, React.ReactNode> = {
  '晨间护理': <HeartPulse size={18} className="text-blue-500" />,
  '协助进食': <UtensilsCrossed size={18} className="text-orange-500" />,
  '生命体征测量': <Activity size={18} className="text-red-500" />,
  '协助洗澡': <Bath size={18} className="text-cyan-500" />,
  '康复训练': <Activity size={18} className="text-green-500" />,
};

const statusConfig: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'blue', label: '待执行' },
  in_progress: { color: 'orange', label: '进行中' },
  completed: { color: 'green', label: '已完成' },
  missed: { color: 'red', label: '已过期' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function CaregiverTasks() {
  const [services, setServices] = useState<CareService[]>(mockCareServices);
  const [completeModal, setCompleteModal] = useState<CareService | null>(null);
  const [form] = Form.useForm();
  const [timers, setTimers] = useState<Record<string, number>>({});

  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayServices = useMemo(
    () => services.filter(s => dayjs(s.scheduledAt).format('YYYY-MM-DD') === todayStr),
    [services, todayStr],
  );

  const pending = todayServices.filter(s => s.status === 'scheduled');
  const inProgress = todayServices.filter(s => s.status === 'in_progress');
  const completed = todayServices.filter(s => s.status === 'completed');

  const startService = (task: CareService) => {
    Modal.confirm({
      title: '开始服务',
      content: `确认开始为 ${task.elderName} 提供「${task.type}」服务？`,
      okText: '确认开始',
      cancelText: '取消',
      onOk: () => {
        setServices(prev => prev.map(s =>
          s.id === task.id
            ? { ...s, status: 'in_progress' as const, startedAt: new Date().toISOString() }
            : s,
        ));
        setTimers(prev => ({ ...prev, [task.id]: Date.now() }));
        message.success('服务已开始，计时中');
      },
    });
  };

  const openCompleteModal = (task: CareService) => {
    const elapsed = timers[task.id]
      ? Math.round((Date.now() - timers[task.id]) / 60000)
      : (task.duration ?? 30);
    form.setFieldsValue({ duration: elapsed, elderStatus: '良好', notes: '' });
    setCompleteModal(task);
  };

  const submitComplete = () => {
    form.validateFields().then(values => {
      setServices(prev => prev.map(s =>
        s.id === completeModal!.id
          ? {
            ...s,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            duration: values.duration,
            elderStatus: values.elderStatus,
            notes: values.notes,
          }
          : s,
      ));
      message.success('服务记录已提交');
      setCompleteModal(null);
      form.resetFields();
    });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex gap-3 mb-4">
        {[
          { label: '待执行', count: pending.length, color: 'bg-blue-50 text-blue-700' },
          { label: '进行中', count: inProgress.length, color: 'bg-orange-50 text-orange-700' },
          { label: '已完成', count: completed.length, color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`flex-1 rounded-xl p-3 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...inProgress, ...pending].map(task => (
          <Card key={task.id} size="small" className="rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {typeIcons[task.type] ?? <Clock size={18} className="text-gray-500" />}
                <span className="font-semibold text-base">{task.elderName}</span>
                <span className="text-gray-400 text-sm">{roomMap[task.elderId]}房间</span>
              </div>
              <Tag color={statusConfig[task.status].color}>{statusConfig[task.status].label}</Tag>
            </div>
            <div className="mt-2 text-gray-600">
              <div className="text-sm">服务类型：{task.type}</div>
              <div className="text-sm flex items-center gap-1">
                <Clock size={14} /> 计划时间：{dayjs(task.scheduledAt).format('HH:mm')}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {task.status === 'scheduled' && (
                <Button type="primary" icon={<PlayCircle size={16} />} onClick={() => startService(task)} block>
                  开始服务
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button type="primary" icon={<CheckCircle size={16} />} onClick={() => openCompleteModal(task)} block>
                  完成服务
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {completed.length > 0 && (
        <Collapse className="mt-4 rounded-xl" items={[{
          key: '1',
          label: `已完成任务 (${completed.length})`,
          children: completed.map(task => (
            <div key={task.id} className="py-2 border-b last:border-0">
              <div className="flex justify-between items-center">
                <span>{task.elderName} - {task.type}</span>
                <Tag color="green">{task.duration}分钟</Tag>
              </div>
              <div className="text-xs text-gray-400">{dayjs(task.completedAt).format('HH:mm')} 完成</div>
            </div>
          )),
        }]} />
      )}

      <Modal
        title="服务记录"
        open={!!completeModal}
        onOk={submitComplete}
        onCancel={() => { setCompleteModal(null); form.resetFields(); }}
        okText="提交记录"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="服务时长（分钟）" name="duration" rules={[{ required: true }]}>
            <Input type="number" suffix="分钟" />
          </Form.Item>
          <Form.Item label="老人状态" name="elderStatus" rules={[{ required: true }]}>
            <Select options={['良好', '一般', '不适', '需关注'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="异常备注" name="notes">
            <Input.TextArea rows={2} placeholder="请记录异常情况（如有）" />
          </Form.Item>
          <Form.Item label="照片上传">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              + 上传
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
