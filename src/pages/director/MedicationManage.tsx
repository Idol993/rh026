import { useState } from 'react';
import {
  Card, Table, Tag, Button, Modal, Descriptions, Form, Select,
  Input, Space, Row, Col, Statistic, Alert, DatePicker,
} from 'antd';
import {
  MedicineBoxOutlined, CheckCircleOutlined, WarningOutlined,
  StopOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MedicationRecord } from '@/types';
import { mockMedicationRecords, mockElders } from '@/mock';
import { formatDateTime } from '@/utils/date';

const statusConfig: Record<MedicationRecord['status'], { color: string; text: string }> = {
  scheduled: { color: 'blue', text: '待服' },
  taken: { color: 'green', text: '已服' },
  missed: { color: 'red', text: '漏服' },
  refused: { color: 'red', text: '拒服' },
};

const dosageMap: Record<string, string> = {};
mockElders.forEach((elder) => {
  elder.medications.forEach((med) => {
    dosageMap[med.id] = med.dosage;
  });
});

const complianceData = [
  { day: '06-15', rate: 85 },
  { day: '06-16', rate: 90 },
  { day: '06-17', rate: 78 },
  { day: '06-18', rate: 88 },
  { day: '06-19', rate: 82 },
  { day: '06-20', rate: 75 },
  { day: '06-21', rate: 80 },
];

const stockAlerts = [
  { name: '硝苯地平缓释片', stock: 5, threshold: 10 },
  { name: '美多芭', stock: 3, threshold: 10 },
];

export default function MedicationManage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [interveneVisible, setInterveneVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MedicationRecord | null>(null);

  const filteredData = mockMedicationRecords.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    return true;
  });

  const handleIntervene = (record: MedicationRecord) => {
    setCurrentRecord(record);
    setInterveneVisible(true);
  };

  const columns = [
    { title: '老人姓名', dataIndex: 'elderName', key: 'elderName', width: 90 },
    { title: '药品名称', dataIndex: 'medicationName', key: 'medicationName', width: 150 },
    {
      title: '剂量', key: 'dosage', width: 90,
      render: (_: unknown, record: MedicationRecord) => dosageMap[record.medicationId] || '-',
    },
    {
      title: '服用时间', dataIndex: 'scheduledTime', key: 'scheduledTime', width: 160,
      render: (val: string) => formatDateTime(val),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: MedicationRecord['status']) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 90,
      render: (_: unknown, record: MedicationRecord) => {
        if (record.status === 'missed' || record.status === 'refused') {
          return (
            <Button type="link" size="small" danger onClick={() => handleIntervene(record)}>
              干预
            </Button>
          );
        }
        return <Button type="link" size="small" disabled>查看</Button>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="今日用药计划" value={35} prefix={<MedicineBoxOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="已服" value={28} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="漏服" value={3} valueStyle={{ color: '#f5222d' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="拒服" value={2} valueStyle={{ color: '#f5222d' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="待服" value={2} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic title="依从率" value={80} suffix="%" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      {stockAlerts.length > 0 && (
        <Alert
          message="药品库存提醒"
          description={stockAlerts.map((s) => `${s.name}库存不足（剩余${s.stock}盒，低于阈值${s.threshold}盒）`).join('；')}
          type="warning"
          showIcon
          closable
        />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Space>
            <DatePicker placeholder="选择日期" />
            <Select
              placeholder="状态筛选" allowClear style={{ width: 120 }}
              value={statusFilter} onChange={setStatusFilter}
              options={Object.entries(statusConfig).map(([k, v]) => ({ label: v.text, value: k }))}
            />
          </Space>
        </div>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 700 }}
        />
      </Card>

      <Card title="近7天依从率趋势">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={complianceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[60, 100]} unit="%" />
            <Tooltip formatter={(value: number) => [`${value}%`, '依从率']} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#722ed1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#722ed1' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Modal
        title="漏服/拒服干预"
        open={interveneVisible}
        onCancel={() => setInterveneVisible(false)}
        onOk={() => setInterveneVisible(false)}
        width={560}
      >
        {currentRecord && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="老人姓名">{currentRecord.elderName}</Descriptions.Item>
              <Descriptions.Item label="药品名称">{currentRecord.medicationName}</Descriptions.Item>
              <Descriptions.Item label="计划时间">
                {formatDateTime(currentRecord.scheduledTime)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[currentRecord.status]?.color}>
                  {statusConfig[currentRecord.status]?.text}
                </Tag>
              </Descriptions.Item>
              {currentRecord.note && (
                <Descriptions.Item label="备注" span={2}>{currentRecord.note}</Descriptions.Item>
              )}
            </Descriptions>
            <Form layout="vertical">
              <Form.Item label="干预措施" required>
                <Select
                  mode="multiple"
                  placeholder="请选择干预措施"
                  options={[
                    { label: '护工上门核查', value: 'check' },
                    { label: '协助服药', value: 'assist' },
                    { label: '记录原因', value: 'record' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="原因记录">
                <Input.TextArea rows={3} placeholder="请记录漏服/拒服原因" />
              </Form.Item>
              <Form.Item label="是否上报护士评估">
                <Select
                  options={[{ label: '是', value: 'yes' }, { label: '否', value: 'no' }]}
                  placeholder="请选择"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
