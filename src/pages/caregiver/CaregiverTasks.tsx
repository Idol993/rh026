import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Card, Tag, Button, Modal, Form, Input, Collapse, Row, Col, Statistic, Empty, Select, message, Upload, Rate } from 'antd';
import { ClockCircleOutlined, PlayCircleOutlined, CheckCircleOutlined, UserOutlined, SearchOutlined, UploadOutlined, SwapOutlined } from '@ant-design/icons';
import type { CareService } from '@/types';
import { useCareServiceStore } from '@/stores/careServiceStore';
import { mockElders } from '@/mock';
import dayjs from 'dayjs';

const SERVICE_TYPES = ['翻身', '喂食', '洗澡', '理发', '口腔护理', '压疮护理', '康复训练', '心理慰藉', '清洁消毒', '晨间护理', '协助进食', '生命体征测量', '协助如厕', '协助服药', '户外活动'];
const typeColors: Record<string, string> = { '翻身': 'purple', '喂食': 'orange', '洗澡': 'cyan', '理发': 'magenta', '口腔护理': 'blue', '压疮护理': 'red', '康复训练': 'green', '心理慰藉': 'geekblue', '清洁消毒': 'volcano', '晨间护理': 'gold', '协助进食': 'orange', '生命体征测量': 'red', '协助如厕': 'purple', '协助服药': 'blue', '户外活动': 'lime' };
const elderStatusOptions = ['良好', '一般', '较差'];

export default function CaregiverTasks() {
  const navigate = useNavigate();
  const initServices = useCareServiceStore(s => s.initIfNeeded);
  const { startService, completeService, getTodayServices } = useCareServiceStore(s => ({
    startService: s.startService,
    completeService: s.completeService,
    getTodayServices: s.getTodayServices,
  }));

  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [completeModal, setCompleteModal] = useState<CareService | null>(null);
  const [form] = Form.useForm();
  const [, setNow] = useState(0);
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      initServices();
    }
  }, [initServices]);

  useEffect(() => {
    const timer = setInterval(() => setNow(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayServices = getTodayServices();
  const roomMap = useMemo(() => Object.fromEntries(mockElders.map(e => [e.id, e.roomNumber ?? ''])), []);

  const filteredServices = useMemo(() => todayServices.filter(s => {
    const matchName = !searchName || s.elderName.includes(searchName);
    const matchType = !filterType || s.type === filterType;
    return matchName && matchType;
  }), [todayServices, searchName, filterType]);

  const pending = filteredServices.filter(s => s.status === 'scheduled');
  const inProgress = filteredServices.filter(s => s.status === 'in_progress');
  const completed = filteredServices.filter(s => s.status === 'completed');

  const formatElapsed = (startedAt: string | undefined): string => {
    if (!startedAt) return '00分00秒';
    const diff = Date.now() - new Date(startedAt).getTime();
    const mins = Math.floor(diff / 60000), secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
  };

  const handleStart = (task: CareService) => {
    Modal.confirm({
      title: '开始服务', content: `确认开始为 ${task.elderName} 提供「${task.type}」服务？`, okText: '确认开始', cancelText: '取消',
      onOk: () => {
        startService(task.id);
        message.success('服务已开始，计时中');
      }
    });
  };

  const openCompleteModal = (task: CareService) => {
    form.setFieldsValue({ elderStatus: '良好', notes: '' });
    setCompleteModal(task);
  };

  const submitComplete = () => {
    form.validateFields().then(values => {
      const startedAt = completeModal!.startedAt ?? new Date().toISOString();
      const duration = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
      completeService(completeModal!.id, { elderStatus: values.elderStatus, notes: values.notes, duration });
      message.success('服务记录已提交');
      setCompleteModal(null);
      form.resetFields();
    });
  };

  const goHandover = () => navigate('/caregiver/handover', { state: { defaultTab: 'service' } });

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex gap-2 items-center">
        <Input prefix={<SearchOutlined />} placeholder="搜索老人姓名" value={searchName} onChange={e => setSearchName(e.target.value)} allowClear className="flex-1" />
        <Select placeholder="服务类型" value={filterType} onChange={setFilterType} allowClear style={{ minWidth: 110 }} options={SERVICE_TYPES.map(t => ({ value: t, label: t }))} />
      </div>

      <Row gutter={12}>
        {[{ v: pending.length, c: '#1677ff', t: '待执行' }, { v: inProgress.length, c: '#fa8c16', t: '进行中' }, { v: completed.length, c: '#52c41a', t: '已完成' }].map(s => (
          <Col span={8} key={s.t}>
            <Card className="rounded-xl"><Statistic title={<span className="text-xs text-gray-500">{s.t}</span>} value={s.v} valueStyle={{ color: s.c, fontSize: 24 }} /></Card>
          </Col>
        ))}
      </Row>

      {inProgress.length > 0 && (
        <div className="space-y-3">
          <div className="font-semibold text-orange-600 flex items-center gap-1"><ClockCircleOutlined /> 正在进行中</div>
          {inProgress.map(task => (
            <Card key={task.id} className="rounded-xl border-2 border-orange-300 shadow-md" style={{ background: 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)' }}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><UserOutlined className="text-orange-500 text-lg" /></div>
                    <div><div className="font-bold text-lg">{task.elderName}</div><div className="text-sm text-gray-500">{roomMap[task.elderId]}房间</div></div>
                  </div>
                  <Tag color={typeColors[task.type] ?? 'blue'}>{task.type}</Tag>
                </div>
                <div className="text-sm text-gray-600">开始时间：{dayjs(task.startedAt).format('HH:mm')}</div>
                <div className="text-center py-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-500">已服务</div>
                  <div className="text-2xl font-bold text-orange-600 font-mono">{formatElapsed(task.startedAt)}</div>
                </div>
                <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => openCompleteModal(task)} block className="h-12 text-base font-semibold">完成服务</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-blue-600 flex items-center gap-1"><PlayCircleOutlined /> 待执行任务</div>
          <Button icon={<SwapOutlined />} size="small" onClick={goHandover} className="border-blue-400 text-blue-600 hover:!bg-blue-50">批量交班</Button>
        </div>
        {pending.length === 0 ? <Empty description="暂无待执行任务" /> : pending.map(task => (
          <Card key={task.id} size="small" className="rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center"><UserOutlined className="text-blue-500" /></div>
                <div className="font-semibold">{task.elderName}<span className="text-gray-400 text-sm ml-1">{roomMap[task.elderId]}房间</span></div>
              </div>
              <Tag color="blue" className="m-0">待执行</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Tag color={typeColors[task.type] ?? 'default'}>{task.type}</Tag>
              <div className="text-sm text-gray-500 flex items-center gap-1"><ClockCircleOutlined /> {dayjs(task.scheduledAt).format('HH:mm')}</div>
            </div>
            <div className="mt-3"><Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleStart(task)} block>开始服务</Button></div>
          </Card>
        ))}
      </div>

      <Collapse className="rounded-xl" defaultActiveKey={[]} items={[{
        key: 'completed', label: <span className="font-semibold text-green-600">已完成任务 ({completed.length})</span>,
        children: completed.length === 0 ? <Empty description="暂无已完成任务" /> : <div className="space-y-3">{completed.map(task => (
          <Card key={task.id} size="small" className="rounded-xl">
            <div className="flex items-start justify-between"><div className="font-semibold">{task.elderName}</div><Tag color="green">{task.duration}分钟</Tag></div>
            <div className="mt-1 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><span>服务类型</span><Tag color={typeColors[task.type] ?? 'default'}>{task.type}</Tag></div>
              <div className="flex justify-between"><span>完成时间</span><span>{dayjs(task.completedAt).format('HH:mm')}</span></div>
              <div className="flex justify-between"><span>老人状态</span><span>{task.elderStatus ?? '—'}</span></div>
              {task.notes && <div><div className="text-gray-500 mb-1">备注</div><div className="bg-gray-50 p-2 rounded">{task.notes}</div></div>}
              {task.rating !== undefined && (
                <div className="flex justify-between items-center"><span>评分</span><Rate disabled value={task.rating} allowHalf className="text-sm" /></div>
              )}
              {task.feedback && <div><div className="text-gray-500 mb-1">家属反馈</div><div className="bg-blue-50 p-2 rounded">{task.feedback}</div></div>}
            </div>
          </Card>
        ))}</div>
      }]} />

      <Modal title="完成服务记录" open={!!completeModal} onOk={submitComplete} onCancel={() => { setCompleteModal(null); form.resetFields(); }} okText="提交记录" okButtonProps={{ className: 'h-10 px-6' }} width="90%" style={{ maxWidth: 420 }}>
        {completeModal && <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-semibold">{completeModal.elderName} - {completeModal.type}</div>
          <div className="text-gray-500 mt-1">已服务 {formatElapsed(completeModal.startedAt)}</div>
        </div>}
        <Form form={form} layout="vertical">
          <Form.Item label="老人状态" name="elderStatus" rules={[{ required: true, message: '请选择老人状态' }]}>
            <Select options={elderStatusOptions.map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="异常备注" name="notes"><Input.TextArea rows={3} placeholder="请记录异常情况（如有）" /></Form.Item>
          <Form.Item label="照片上传">
            <Upload listType="picture-card" maxCount={3} beforeUpload={() => { message.info('模拟上传成功'); return false; }}>
              <div className="flex flex-col items-center justify-center py-2"><UploadOutlined className="text-xl" /><div className="text-xs text-gray-500 mt-1">上传照片</div></div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
