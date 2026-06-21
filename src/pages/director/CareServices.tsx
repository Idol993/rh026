import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, DatePicker, Modal, Descriptions, Rate,
  Form, Input, Space, Row, Col, Statistic, message,
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, CheckCircleOutlined,
  SyncOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { CareService } from '@/types';
import { mockCareServices } from '@/mock';
import { formatDateTime } from '@/utils/date';
import dayjs, { Dayjs } from 'dayjs';

const statusConfig: Record<CareService['status'], { color: string; text: string }> = {
  scheduled: { color: 'blue', text: '待执行' },
  in_progress: { color: 'green', text: '进行中' },
  completed: { color: 'default', text: '已完成' },
  missed: { color: 'red', text: '超时' },
  cancelled: { color: 'default', text: '已取消' },
};

const serviceTypeOptions = [
  '翻身', '喂食', '洗澡', '理发', '口腔护理', '压疮护理',
  '康复训练', '心理慰藉', '清洁消毒', '晨间护理', '协助进食',
  '生命体征测量', '协助如厕', '协助服药', '户外活动',
];

const caregiverOptions = [
  { label: '王护工', value: '王护工', id: 'user3' },
  { label: '赵护工', value: '赵护工', id: 'user5' },
  { label: '钱护工', value: '钱护工', id: 'user6' },
];

interface CreateFormValues {
  elderName: string;
  type: string;
  caregiverName: string;
  scheduledAt: Dayjs;
  notes?: string;
}

export default function CareServices() {
  const [services, setServices] = useState<CareService[]>(mockCareServices);
  const [detailVisible, setDetailVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CareService | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [caregiverFilter, setCaregiverFilter] = useState<string | undefined>();
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [createForm] = Form.useForm<CreateFormValues>();

  const today = dayjs().format('YYYY-MM-DD');
  const stats = useMemo(() => {
    const todayServices = services.filter(s => dayjs(s.scheduledAt).format('YYYY-MM-DD') === today);
    return {
      total: todayServices.length,
      completed: todayServices.filter(s => s.status === 'completed').length,
      inProgress: todayServices.filter(s => s.status === 'in_progress').length,
      missed: todayServices.filter(s => s.status === 'missed').length,
    };
  }, [services, today]);

  const filteredData = useMemo(() => {
    return services.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      if (caregiverFilter && item.caregiverName !== caregiverFilter) return false;
      if (dateFilter) {
        if (dayjs(item.scheduledAt).format('YYYY-MM-DD') !== dateFilter.format('YYYY-MM-DD')) return false;
      }
      return true;
    });
  }, [services, statusFilter, typeFilter, caregiverFilter, dateFilter]);

  const handleCreate = () => {
    createForm.validateFields().then(values => {
      const caregiver = caregiverOptions.find(c => c.value === values.caregiverName);
      const newService: CareService = {
        id: `svc-new-${Date.now()}`,
        elderId: `elder-new-${Date.now()}`,
        elderName: values.elderName,
        type: values.type,
        scheduledAt: values.scheduledAt.toISOString(),
        caregiverId: caregiver?.id || 'user3',
        caregiverName: values.caregiverName,
        status: 'scheduled',
        notes: values.notes,
      };
      setServices(prev => [newService, ...prev]);
      message.success('工单已创建');
      setCreateVisible(false);
      createForm.resetFields();
      setCurrentRecord(newService);
      setDetailVisible(true);
    });
  };

  const columns = [
    { title: '工单编号', dataIndex: 'id', key: 'id', width: 140 },
    { title: '老人姓名', dataIndex: 'elderName', key: 'elderName', width: 90 },
    { title: '服务类型', dataIndex: 'type', key: 'type', width: 110 },
    { title: '护工', dataIndex: 'caregiverName', key: 'caregiverName', width: 80 },
    {
      title: '计划时间', dataIndex: 'scheduledAt', key: 'scheduledAt', width: 160,
      render: (val: string) => formatDateTime(val),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (status: CareService['status']) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 70,
      render: (_: unknown, record: CareService) => (
        <Button
          type="link"
          size="small"
          onClick={() => { setCurrentRecord(record); setDetailVisible(true); }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="今日工单总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#8c8c8c' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="进行中" value={stats.inProgress} valueStyle={{ color: '#52c41a' }} prefix={<SyncOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="超时" value={stats.missed} valueStyle={{ color: '#f5222d' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Space wrap>
            <DatePicker
              placeholder="选择日期"
              value={dateFilter}
              onChange={(v) => setDateFilter(v)}
              allowClear
            />
            <Select
              placeholder="服务类型" allowClear style={{ width: 140 }}
              value={typeFilter} onChange={setTypeFilter}
              options={serviceTypeOptions.map((t) => ({ label: t, value: t }))}
            />
            <Select
              placeholder="护工" allowClear style={{ width: 120 }}
              value={caregiverFilter} onChange={setCaregiverFilter}
              options={caregiverOptions.map(c => ({ label: c.label, value: c.value }))}
            />
            <Select
              placeholder="状态" allowClear style={{ width: 120 }}
              value={statusFilter} onChange={setStatusFilter}
              options={Object.entries(statusConfig).map(([k, v]) => ({ label: v.text, value: k }))}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateVisible(true); }}>
            新建工单
          </Button>
        </div>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="工单详情" open={detailVisible}
        onCancel={() => setDetailVisible(false)} footer={null} width={680}
      >
        {currentRecord && (
          <div className="space-y-4">
            <Descriptions title="服务基本信息" column={2} bordered size="small">
              <Descriptions.Item label="工单编号">{currentRecord.id}</Descriptions.Item>
              <Descriptions.Item label="老人姓名">{currentRecord.elderName}</Descriptions.Item>
              <Descriptions.Item label="服务类型">{currentRecord.type}</Descriptions.Item>
              <Descriptions.Item label="护工">{currentRecord.caregiverName}</Descriptions.Item>
              <Descriptions.Item label="计划时间">{formatDateTime(currentRecord.scheduledAt)}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[currentRecord.status]?.color}>
                  {statusConfig[currentRecord.status]?.text}
                </Tag>
              </Descriptions.Item>
              {currentRecord.startedAt && (
                <Descriptions.Item label="开始时间">{formatDateTime(currentRecord.startedAt)}</Descriptions.Item>
              )}
              {currentRecord.completedAt && (
                <Descriptions.Item label="完成时间">{formatDateTime(currentRecord.completedAt)}</Descriptions.Item>
              )}
              {currentRecord.duration != null && (
                <Descriptions.Item label="服务时长">{currentRecord.duration}分钟</Descriptions.Item>
              )}
            </Descriptions>

            {(currentRecord.elderStatus || currentRecord.notes) && (
              <Descriptions title="服务记录" column={1} bordered size="small">
                {currentRecord.startedAt && (
                  <Descriptions.Item label="服务时间">{formatDateTime(currentRecord.startedAt)}</Descriptions.Item>
                )}
                {currentRecord.duration != null && (
                  <Descriptions.Item label="服务时长">{currentRecord.duration}分钟</Descriptions.Item>
                )}
                {currentRecord.elderStatus && (
                  <Descriptions.Item label="老人状态">{currentRecord.elderStatus}</Descriptions.Item>
                )}
                {currentRecord.notes && (
                  <Descriptions.Item label="异常备注">{currentRecord.notes}</Descriptions.Item>
                )}
              </Descriptions>
            )}

            {currentRecord.rating != null && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">家属评价</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500">评分：</span>
                  <Rate disabled value={currentRecord.rating} />
                  <span className="text-orange-500 font-medium">{currentRecord.rating}.0</span>
                </div>
                {currentRecord.feedback && (
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{currentRecord.feedback}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="新建工单"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={handleCreate}
        okText="确认创建"
        width={520}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" preserve={false}>
          <Form.Item label="老人姓名" name="elderName" rules={[{ required: true, message: '请输入老人姓名' }]}>
            <Input placeholder="请输入老人姓名" />
          </Form.Item>
          <Form.Item label="服务类型" name="type" rules={[{ required: true, message: '请选择服务类型' }]}>
            <Select
              placeholder="请选择服务类型"
              options={serviceTypeOptions.map((t) => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Form.Item label="护工" name="caregiverName" rules={[{ required: true, message: '请选择护工' }]}>
            <Select placeholder="请选择护工" options={caregiverOptions.map(c => ({ label: c.label, value: c.value }))} />
          </Form.Item>
          <Form.Item label="计划时间" name="scheduledAt" rules={[{ required: true, message: '请选择计划时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
