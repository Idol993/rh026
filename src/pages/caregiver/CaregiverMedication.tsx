import { useState, useMemo } from 'react';
import { Card, Tag, Button, Modal, Form, Select, Input, message, Statistic } from 'antd';
import { Pill, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import dayjs from 'dayjs';
import type { MedicationRecord } from '@/types';
import { mockMedicationRecords, mockElders } from '@/mock';

const roomMap = Object.fromEntries(mockElders.map(e => [e.id, e.roomNumber ?? '']));

const statusConfig: Record<string, { color: string; label: string; highlight: boolean }> = {
  scheduled: { color: 'blue', label: '待服', highlight: false },
  taken: { color: 'green', label: '已服', highlight: false },
  missed: { color: 'red', label: '漏服', highlight: true },
  refused: { color: 'red', label: '拒服', highlight: true },
};

const missReasons = [
  { value: '老人拒绝', label: '老人拒绝' },
  { value: '不在房间', label: '不在房间' },
  { value: '药物不良反应', label: '药物不良反应' },
  { value: '其他', label: '其他' },
];

export default function CaregiverMedication() {
  const [records, setRecords] = useState<MedicationRecord[]>(mockMedicationRecords);
  const [interveneModal, setInterveneModal] = useState<MedicationRecord | null>(null);
  const [form] = Form.useForm();

  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayRecords = useMemo(
    () => records.filter(r => dayjs(r.scheduledTime).format('YYYY-MM-DD') === todayStr),
    [records, todayStr],
  );

  const taken = todayRecords.filter(r => r.status === 'taken');
  const scheduled = todayRecords.filter(r => r.status === 'scheduled');
  const missed = todayRecords.filter(r => r.status === 'missed');
  const refused = todayRecords.filter(r => r.status === 'refused');
  const needAttention = [...missed, ...refused];

  const openIntervene = (record: MedicationRecord) => {
    form.resetFields();
    setInterveneModal(record);
  };

  const submitIntervene = () => {
    form.validateFields().then(values => {
      setRecords(prev => prev.map(r =>
        r.id === interveneModal!.id
          ? {
            ...r,
            status: values.action === '协助服药' ? 'taken' as const : r.status,
            note: `${values.reason ?? ''}${values.note ? '；' + values.note : ''}`,
            notedBy: '王护工',
            takenAt: values.action === '协助服药' ? new Date().toISOString() : r.takenAt,
          }
          : r,
      ));
      message.success(values.action === '上报护士' ? '已上报护士' : '干预记录已提交');
      setInterveneModal(null);
    });
  };

  const markTaken = (record: MedicationRecord) => {
    Modal.confirm({
      title: '确认服药',
      content: `确认 ${record.elderName} 已服用 ${record.medicationName}？`,
      onOk: () => {
        setRecords(prev => prev.map(r =>
          r.id === record.id
            ? { ...r, status: 'taken' as const, takenAt: new Date().toISOString(), notedBy: '王护工' }
            : r,
        ));
        message.success('已确认服药');
      },
    });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3 bg-green-50 text-center">
          <Statistic title="已完成" value={taken.length} valueStyle={{ color: '#52c41a', fontSize: 28 }} />
        </div>
        <div className="rounded-xl p-3 bg-blue-50 text-center">
          <Statistic title="待执行" value={scheduled.length} valueStyle={{ color: '#1677ff', fontSize: 28 }} />
        </div>
      </div>

      {needAttention.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-semibold text-base text-red-600">需要关注</h3>
            <Tag color="red">{needAttention.length}</Tag>
          </div>
          <div className="space-y-3 mb-6">
            {needAttention.map(record => (
              <Card
                key={record.id}
                size="small"
                className={`rounded-xl border-2 ${statusConfig[record.status].highlight ? 'border-red-300 bg-red-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill size={18} className={record.status === 'missed' ? 'text-red-500' : 'text-orange-500'} />
                    <span className="font-semibold text-base">{record.elderName}</span>
                    <span className="text-gray-400 text-sm">{roomMap[record.elderId] ?? ''}房间</span>
                  </div>
                  <Tag color={statusConfig[record.status].color}>{statusConfig[record.status].label}</Tag>
                </div>
                <div className="mt-2 text-gray-700 text-sm">
                  <div>{record.medicationName}</div>
                  <div className="text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={14} /> {dayjs(record.scheduledTime).format('HH:mm')}
                  </div>
                  {record.note && <div className="text-red-500 text-xs mt-1">{record.note}</div>}
                </div>
                <Button
                  type="primary"
                  danger
                  block
                  className="mt-3"
                  size="large"
                  onClick={() => openIntervene(record)}
                >
                  漏服干预
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      <h3 className="font-semibold text-base mb-3">待服药</h3>
      <div className="space-y-3">
        {scheduled.map(record => (
          <Card key={record.id} size="small" className="rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-blue-500" />
                <span className="font-semibold">{record.elderName}</span>
                <span className="text-gray-400 text-sm">{roomMap[record.elderId] ?? ''}房间</span>
              </div>
              <Tag color="blue">待服</Tag>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <div>{record.medicationName}</div>
              <div className="text-gray-400 flex items-center gap-1 mt-1">
                <Clock size={14} /> {dayjs(record.scheduledTime).format('HH:mm')}
              </div>
            </div>
            <Button type="primary" block className="mt-3" size="large" onClick={() => markTaken(record)}>
              确认服药
            </Button>
          </Card>
        ))}
        {scheduled.length === 0 && (
          <div className="text-center text-gray-400 py-6">暂无待服药任务</div>
        )}
      </div>

      {taken.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-base mb-3 text-green-700">已完成 ({taken.length})</h3>
          <div className="space-y-2">
            {taken.slice(0, 6).map(record => (
              <div key={record.id} className="flex justify-between items-center py-2 border-b text-sm">
                <span>
                  <span className="text-gray-500">{record.elderName}</span>
                  {' - '}{record.medicationName}
                </span>
                <Tag color="green">已服</Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        title="漏服干预"
        open={!!interveneModal}
        onOk={submitIntervene}
        onCancel={() => setInterveneModal(null)}
        okText="提交"
      >
        {interveneModal && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 text-sm">
            <div className="font-semibold">{interveneModal.elderName} - {interveneModal.medicationName}</div>
            <div className="text-gray-500 mt-1">计划时间：{dayjs(interveneModal.scheduledTime).format('HH:mm')}</div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="干预措施" name="action" rules={[{ required: true }]}>
            <Select options={[
              { value: '上门核查', label: '上门核查', icon: <UserCheck size={16} /> },
              { value: '协助服药', label: '协助服药' },
              { value: '上报护士', label: '上报护士' },
            ]} />
          </Form.Item>
          <Form.Item label="原因" name="reason" rules={[{ required: true }]}>
            <Select options={missReasons} placeholder="请选择原因" />
          </Form.Item>
          <Form.Item label="补充说明" name="note">
            <Input.TextArea rows={2} placeholder="请补充说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
