import { useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Tag, List, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Visit } from '@/types';
import { mockVisits } from '@/mock';

const statusMap: Record<Visit['status'], { color: string; text: string }> = {
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'green', text: '已批准' },
  completed: { color: 'blue', text: '已完成' },
  rejected: { color: 'red', text: '已拒绝' },
  rescheduled: { color: 'purple', text: '已改期' },
};

export default function FamilyVisits() {
  const [formVisible, setFormVisible] = useState(false);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      message.success('预约提交成功，等待审核');
      setFormVisible(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <Card
        title="探视预约"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormVisible(true)}>新建预约</Button>}
        style={{ borderRadius: 12 }}
      >
        <List
          dataSource={mockVisits}
          renderItem={(v) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 0' }}
              onClick={() => { setCurrentVisit(v); setDetailVisible(true); }}
            >
              <Card
                size="small"
                style={{ width: '100%', borderRadius: 10 }}
                styles={{ body: { padding: '10px 14px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{v.elderName}</span>
                  <Tag color={statusMap[v.status].color}>{statusMap[v.status].text}</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: '22px' }}>
                  <div>🕐 {new Date(v.scheduledAt).toLocaleString()}</div>
                  <div>👥 探视人数：{v.visitorCount}人</div>
                  <div>📝 {v.purpose}</div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="新建探视预约"
        open={formVisible}
        onOk={handleSubmit}
        onCancel={() => setFormVisible(false)}
        okText="提交预约"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scheduledAt" label="预约时间" rules={[{ required: true, message: '请选择预约时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} placeholder="选择日期和时间" />
          </Form.Item>
          <Form.Item name="visitorCount" label="探视人数" rules={[{ required: true, message: '请输入人数' }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="1-10人" />
          </Form.Item>
          <Form.Item name="purpose" label="探视目的" rules={[{ required: true, message: '请输入探视目的' }]}>
            <Input.TextArea rows={3} placeholder="请简要说明探视目的" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="预约详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
      >
        {currentVisit && (
          <div style={{ lineHeight: '28px' }}>
            <div><strong>老人姓名：</strong>{currentVisit.elderName}</div>
            <div><strong>预约时间：</strong>{new Date(currentVisit.scheduledAt).toLocaleString()}</div>
            <div><strong>申请人：</strong>{currentVisit.applicantName}（{currentVisit.relationship}）</div>
            <div><strong>联系电话：</strong>{currentVisit.applicantPhone}</div>
            <div><strong>探视人数：</strong>{currentVisit.visitorCount}人</div>
            <div><strong>探视目的：</strong>{currentVisit.purpose}</div>
            <div>
              <strong>状态：</strong>
              <Tag color={statusMap[currentVisit.status].color}>{statusMap[currentVisit.status].text}</Tag>
            </div>
            {currentVisit.approvedBy && <div><strong>审批人：</strong>{currentVisit.approvedBy}</div>}
            {currentVisit.approvedAt && <div><strong>审批时间：</strong>{new Date(currentVisit.approvedAt).toLocaleString()}</div>}
            {currentVisit.rejectReason && <div style={{ color: '#ff4d4f' }}><strong>拒绝原因：</strong>{currentVisit.rejectReason}</div>}
            {currentVisit.actualArrival && <div><strong>实际到达：</strong>{new Date(currentVisit.actualArrival).toLocaleString()}</div>}
            {currentVisit.actualDeparture && <div><strong>实际离开：</strong>{new Date(currentVisit.actualDeparture).toLocaleString()}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
