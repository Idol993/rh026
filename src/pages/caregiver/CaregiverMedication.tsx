import { useEffect, useMemo, useState } from 'react';
import { Card, Tag, Button, Modal, Form, Select, Checkbox, Input, Collapse, Badge, Row, Col, Statistic, message, Empty } from 'antd';
import { MedicineBoxOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import type { MedicationRecord } from '@/types';
import { useMedicationStore } from '@/stores/medicationStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const roomMap: Record<string, string> = {
  elder1: '302A',
  elder2: '201B',
  elder3: '401A',
  elder4: '101A',
  elder6: '305B',
  elder7: '203A',
  elder8: '403B',
  elder10: '102A',
};

const dosageMap: Record<string, string> = {
  'elder1-med1': '30mg',
  'elder1-med2': '0.5g',
  'elder2-med1': '100mg',
  'elder2-med2': '20mg',
  'elder3-med1': '1.2g',
  'elder4-med1': '30mg',
  'elder4-med2': '0.5g',
  'elder4-med3': '0.25g',
  'elder6-med1': '80mg',
  'elder6-med2': '20mg',
  'elder7-med1': '30mg',
  'elder7-med2': '0.5g',
  'elder8-med1': '75mg',
  'elder8-med2': '5mg',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'blue', label: '待服' },
  taken: { color: 'green', label: '已服' },
  missed: { color: 'red', label: '漏服' },
  refused: { color: 'red', label: '拒服' },
};

const missReasons = [
  { value: '老人拒绝', label: '老人拒绝' },
  { value: '不在房间', label: '不在房间' },
  { value: '药物不良反应', label: '药物不良反应' },
  { value: '其他', label: '其他' },
];

const interveneOptions = [
  { label: '上门核查', value: '上门核查' },
  { label: '协助服药', value: '协助服药' },
  { label: '上报护士', value: '上报护士' },
];

export default function CaregiverMedication() {
  const navigate = useNavigate();
  const userName = useAuthStore(s => s.user?.name) ?? '王护工';
  const { initIfNeeded, confirmTaken, interveneMissed, getTodayRecords } = useMedicationStore(s => ({
    initIfNeeded: s.initIfNeeded,
    confirmTaken: s.confirmTaken,
    interveneMissed: s.interveneMissed,
    getTodayRecords: s.getTodayRecords,
  }));
  const [interveneModal, setInterveneModal] = useState<MedicationRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    initIfNeeded();
  }, [initIfNeeded]);

  const todayRecords = useMemo(() => getTodayRecords(), [getTodayRecords]);

  const filteredRecords = useMemo(
    () => todayRecords.filter(r => (r.elderName ?? '').includes(searchText.trim())),
    [todayRecords, searchText],
  );

  const taken = useMemo(
    () => filteredRecords.filter(r => r.status === 'taken').sort((a, b) => dayjs(a.scheduledTime).valueOf() - dayjs(b.scheduledTime).valueOf()),
    [filteredRecords],
  );
  const scheduled = useMemo(
    () => filteredRecords.filter(r => r.status === 'scheduled').sort((a, b) => dayjs(a.scheduledTime).valueOf() - dayjs(b.scheduledTime).valueOf()),
    [filteredRecords],
  );
  const missed = useMemo(
    () => filteredRecords.filter(r => r.status === 'missed' || r.status === 'refused').sort((a, b) => dayjs(a.scheduledTime).valueOf() - dayjs(b.scheduledTime).valueOf()),
    [filteredRecords],
  );

  const todayAllTaken = todayRecords.filter(r => r.status === 'taken').length;
  const todayAllScheduled = todayRecords.filter(r => r.status === 'scheduled').length;
  const todayAllMissed = todayRecords.filter(r => r.status === 'missed' || r.status === 'refused').length;

  const openIntervene = (record: MedicationRecord) => {
    form.resetFields();
    setInterveneModal(record);
  };

  const submitIntervene = () => {
    form.validateFields().then(values => {
      const measures: string[] = values.actions ?? [];
      const assisted = measures.includes('协助服药');
      interveneMissed(interveneModal!.id, {
        measures,
        reason: values.reason,
        note: values.note,
        operator: userName,
        assisted,
      });
      message.success(measures.includes('上报护士') ? '已上报护士，干预记录已提交' : '干预记录已提交');
      setInterveneModal(null);
    });
  };

  const markTaken = (record: MedicationRecord) => {
    Modal.confirm({
      title: '确认服药',
      content: `确认 ${record.elderName} 已服用 ${record.medicationName}？`,
      onOk: () => {
        confirmTaken(record.id, userName);
        message.success('已确认服药');
      },
    });
  };

  const MedicationCard = ({ record, showAction = true }: { record: MedicationRecord; showAction?: boolean }) => {
    const cfg = statusConfig[record.status];
    const isAttention = record.status === 'missed' || record.status === 'refused';
    return (
      <Card
        size="small"
        className={`rounded-xl ${isAttention ? 'border-2 border-red-300 bg-red-50' : 'shadow-sm'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <MedicineBoxOutlined className={isAttention ? 'text-red-500 text-lg' : (record.status === 'taken' ? 'text-green-500 text-lg' : 'text-blue-500 text-lg')} />
            <span className="font-semibold text-base">{record.elderName}</span>
            {roomMap[record.elderId] && (
              <Tag color="purple" className="mr-0">{roomMap[record.elderId]}</Tag>
            )}
          </div>
          <Tag color={cfg.color}>{cfg.label}</Tag>
        </div>
        <div className="mt-2 text-gray-700 text-sm">
          <div>{record.medicationName} <span className="text-gray-400">({dosageMap[record.medicationId] ?? '-'})</span></div>
          <div className="text-gray-400 flex items-center gap-1 mt-1">
            <ClockCircleOutlined /> {dayjs(record.scheduledTime).format('HH:mm')}
          </div>
          {record.note && <div className={`text-xs mt-1 ${isAttention ? 'text-red-500' : 'text-gray-500'}`}>{record.note}</div>}
          {record.notedBy && record.status === 'taken' && (
            <div className="text-gray-400 text-xs mt-1">
              操作人：{record.notedBy}
              {record.takenAt && ` | 服于 ${dayjs(record.takenAt).format('HH:mm')}`}
            </div>
          )}
        </div>
        {showAction && record.status === 'scheduled' && (
          <Button type="primary" block className="mt-3" size="large" onClick={() => markTaken(record)}>
            确认服药
          </Button>
        )}
        {showAction && isAttention && (
          <Button type="primary" danger block className="mt-3" size="large" onClick={() => openIntervene(record)}>
            漏服干预
          </Button>
        )}
      </Card>
    );
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      <Row gutter={12} className="mb-4">
        <Col span={8}>
          <div className="rounded-xl p-3 bg-green-50 text-center">
            <Statistic
              title={<span className="text-xs">今日已完成</span>}
              value={todayAllTaken}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="rounded-xl p-3 bg-blue-50 text-center">
            <Statistic
              title={<span className="text-xs">今日待服</span>}
              value={todayAllScheduled}
              valueStyle={{ color: '#1677ff', fontSize: 24 }}
              prefix={<ClockCircleOutlined />}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="rounded-xl p-3 bg-red-50 text-center">
            <Statistic
              title={<span className="text-xs">今日漏服</span>}
              value={todayAllMissed}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              prefix={<WarningOutlined />}
            />
          </div>
        </Col>
      </Row>

      <div className="mb-4 flex gap-2">
        <Input
          size="large"
          placeholder="搜索老人姓名"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          className="flex-1"
        />
        <Button
          type="default"
          size="large"
          icon={<SwapOutlined />}
          onClick={() => navigate('/caregiver/handover?tab=medication')}
        >
          批量交班
        </Button>
      </div>

      {missed.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <WarningOutlined className="text-red-500" />
            <h3 className="font-semibold text-base text-red-600 m-0">需要关注</h3>
            <Badge count={missed.length} color="#ff4d4f" />
          </div>
          <div className="space-y-3">
            {missed.map(record => <MedicationCard key={record.id} record={record} />)}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ClockCircleOutlined className="text-blue-500" />
          <h3 className="font-semibold text-base m-0">今日待服药</h3>
          <Badge count={scheduled.length} color="#1677ff" />
        </div>
        <div className="space-y-3">
          {scheduled.map(record => <MedicationCard key={record.id} record={record} />)}
          {scheduled.length === 0 && <Empty description="暂无待服药任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
      </div>

      {taken.length > 0 && (
        <Collapse
          items={[{
            key: '1',
            label: (
              <span className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <span className="font-semibold text-green-700">今日已完成</span>
                <Badge count={taken.length} color="#52c41a" />
              </span>
            ),
            children: <div className="space-y-2">{taken.map(record => <MedicationCard key={record.id} record={record} showAction={false} />)}</div>,
          }]}
          defaultActiveKey={[]}
        />
      )}

      <Modal
        title="漏服干预"
        open={!!interveneModal}
        onOk={submitIntervene}
        onCancel={() => setInterveneModal(null)}
        okText="提交"
        destroyOnClose
      >
        {interveneModal && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm">
            <div className="font-semibold">{interveneModal.elderName} - {interveneModal.medicationName}</div>
            <div className="text-gray-500 mt-1">计划时间：{dayjs(interveneModal.scheduledTime).format('HH:mm')}</div>
          </div>
        )}
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="干预措施" name="actions" rules={[{ required: true, message: '请选择至少一项干预措施' }]}>
            <Checkbox.Group options={interveneOptions} />
          </Form.Item>
          <Form.Item label="原因选择" name="reason" rules={[{ required: true, message: '请选择原因' }]}>
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
