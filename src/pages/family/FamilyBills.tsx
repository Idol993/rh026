import { useState } from 'react';
import { Card, Tag, Button, List, Modal, Descriptions, Table, message } from 'antd';
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

const familyBills = mockBills.filter((b) => b.elderId === 'elder1');

export default function FamilyBills() {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <Card title="费用账单" style={{ borderRadius: 12 }}>
        <List
          dataSource={familyBills}
          renderItem={(bill) => (
            <List.Item style={{ padding: '8px 0' }}>
              <Card
                size="small"
                style={{ width: '100%', borderRadius: 10 }}
                styles={{ body: { padding: '12px 14px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{bill.month}</span>
                  <Tag color={statusMap[bill.status].color}>{statusMap[bill.status].text}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888' }}>应付金额</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>¥{bill.payableAmount.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#888' }}>已付金额</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>¥{bill.paidAmount.toLocaleString()}</div>
                  </div>
                </div>
                {bill.subsidyAmount > 0 && (
                  <div style={{ fontSize: 12, color: '#faad14', marginBottom: 8 }}>
                    政府补贴：¥{bill.subsidyAmount.toLocaleString()}
                  </div>
                )}
                {bill.status !== 'paid' && (
                  <div style={{ fontSize: 12, color: '#ff4d4f', marginBottom: 8 }}>
                    待缴：¥{(bill.payableAmount - bill.paidAmount).toLocaleString()}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{ borderRadius: 8, flex: 1 }}
                    disabled={bill.status === 'paid'}
                    onClick={() => message.success('缴费操作已提交')}
                  >
                    {bill.status === 'paid' ? '已缴清' : '立即缴费'}
                  </Button>
                  <Button
                    block
                    size="large"
                    style={{ borderRadius: 8 }}
                    onClick={() => { setCurrentBill(bill); setDetailVisible(true); }}
                  >
                    查看明细
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={`账单明细 - ${currentBill?.month || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={480}
      >
        {currentBill && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="老人姓名">{currentBill.elderName}</Descriptions.Item>
              <Descriptions.Item label="月份">{currentBill.month}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{currentBill.totalAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="补贴">¥{currentBill.subsidyAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="应付">¥{currentBill.payableAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已付">¥{currentBill.paidAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="截止日期" span={2}>{new Date(currentBill.dueDate).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={currentBill.items}
              columns={[
                { title: '项目', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => typeMap[t] || t },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
