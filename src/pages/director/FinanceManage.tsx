import { useState } from 'react';
import { Table, Card, Row, Col, Statistic, Tag, Button, Modal, Descriptions, message } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { Bill } from '@/types';
import { mockBills } from '@/mock';

const statusMap: Record<Bill['status'], { color: string; text: string }> = {
  paid: { color: 'green', text: '已缴' },
  unpaid: { color: 'orange', text: '未缴' },
  partial: { color: 'blue', text: '部分缴纳' },
  overdue: { color: 'red', text: '欠费' },
};

const typeMap: Record<string, string> = {
  care: '护理费', service: '服务费', device: '设备费', material: '耗材费', other: '其他',
};

export default function FinanceManage() {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  const totalAmount = mockBills.reduce((s, b) => s + b.totalAmount, 0);
  const paidTotal = mockBills.reduce((s, b) => s + b.paidAmount, 0);
  const overdueTotal = mockBills.reduce((s, b) => s + (b.status === 'overdue' || b.status === 'unpaid' || b.status === 'partial' ? b.payableAmount - b.paidAmount : 0), 0);
  const subsidyTotal = mockBills.reduce((s, b) => s + b.subsidyAmount, 0);

  const columns = [
    { title: '老人姓名', dataIndex: 'elderName', key: 'elderName' },
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '补贴', dataIndex: 'subsidyAmount', key: 'subsidyAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '应付', dataIndex: 'payableAmount', key: 'payableAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '已付', dataIndex: 'paidAmount', key: 'paidAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: Bill['status']) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>,
    },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Bill) => (
        <>
          <Button type="link" size="small" onClick={() => { setCurrentBill(record); setDetailVisible(true); }}>详情</Button>
          {record.status !== 'paid' && (
            <>
              <Button type="link" size="small" onClick={() => message.success('缴费操作已提交')}>缴费</Button>
              <Button type="link" size="small" danger onClick={() => message.info('欠费提醒已发送')}>催缴</Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="本月应收总额" value={totalAmount} prefix={<><DollarOutlined /> ¥</>} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已收金额" value={paidTotal} prefix={<><CheckCircleOutlined /> ¥</>} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="欠费金额" value={overdueTotal} prefix={<><ExclamationCircleOutlined /> ¥</>} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="补贴金额" value={subsidyTotal} prefix={<><ThunderboltOutlined /> ¥</>} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      <Card title="账单列表">
        <Table rowKey="id" columns={columns} dataSource={mockBills} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={`账单详情 - ${currentBill?.elderName || ''} ${currentBill?.month || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={720}
      >
        {currentBill && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="老人姓名">{currentBill.elderName}</Descriptions.Item>
              <Descriptions.Item label="账单月份">{currentBill.month}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{currentBill.totalAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="补贴金额">¥{currentBill.subsidyAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="应付金额">¥{currentBill.payableAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已付金额">¥{currentBill.paidAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentBill.status].color}>{statusMap[currentBill.status].text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="截止日期">{new Date(currentBill.dueDate).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={currentBill.items}
              columns={[
                { title: '费用项', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => typeMap[t] || t },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `¥${v}` },
                { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '说明', dataIndex: 'description', key: 'description' },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
