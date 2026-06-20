import { useState } from 'react';
import {
  Card, Table, Tabs, Tag, Button, Modal, Descriptions, Form, Input,
  Select, DatePicker, Space, message,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, CalendarOutlined, EyeOutlined,
} from '@ant-design/icons';
import type { Visit } from '@/types';
import { mockVisits } from '@/mock';
import { formatDateTime } from '@/utils/date';

const statusConfig: Record<Visit['status'], { color: string; text: string }> = {
  pending: { color: 'blue', text: '待审核' },
  approved: { color: 'green', text: '已批准' },
  rescheduled: { color: 'orange', text: '已改期' },
  rejected: { color: 'red', text: '已拒绝' },
  completed: { color: 'default', text: '已完成' },
};

const tabStatusMap: Record<string, Visit['status'][]> = {
  pending: ['pending', 'rescheduled'],
  approved: ['approved'],
  completed: ['completed'],
  rejected: ['rejected'],
};

export default function VisitManage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [detailVisible, setDetailVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Visit | null>(null);

  const filteredData = mockVisits.filter((v) => tabStatusMap[activeTab]?.includes(v.status));

  const handleApprove = (record: Visit) => {
    message.success(`已批准 ${record.applicantName} 的探视申请`);
  };

  const handleReject = (record: Visit) => {
    setCurrentRecord(record);
    setRejectVisible(true);
  };

  const handleReschedule = (record: Visit) => {
    setCurrentRecord(record);
    setRescheduleVisible(true);
  };

  const handleViewDetail = (record: Visit) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const columns = [
    { title: '申请人', dataIndex: 'applicantName', key: 'applicantName', width: 90 },
    { title: '与老人关系', dataIndex: 'relationship', key: 'relationship', width: 100 },
    { title: '探视老人', dataIndex: 'elderName', key: 'elderName', width: 90 },
    {
      title: '预约时间', dataIndex: 'scheduledAt', key: 'scheduledAt', width: 160,
      render: (val: string) => formatDateTime(val),
    },
    { title: '人数', dataIndex: 'visitorCount', key: 'visitorCount', width: 60, align: 'center' as const },
    {
      title: '目的', dataIndex: 'purpose', key: 'purpose', width: 150, ellipsis: true,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (status: Visit['status']) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, record: Visit) => {
        const isPending = record.status === 'pending' || record.status === 'rescheduled';
        return (
          <Space size="small">
            {isPending && (
              <>
                <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
                  批准
                </Button>
                <Button type="link" size="small" icon={<CalendarOutlined />} onClick={() => handleReschedule(record)}>
                  改期
                </Button>
                <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record)}>
                  拒绝
                </Button>
              </>
            )}
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              详情
            </Button>
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已批准' },
    { key: 'completed', label: '已完成' },
    { key: 'rejected', label: '已拒绝' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarExtraContent={
            <Space>
              <DatePicker placeholder="选择日期" />
            </Space>
          }
        />
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="探视详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {currentRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="申请人">{currentRecord.applicantName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentRecord.applicantPhone}</Descriptions.Item>
            <Descriptions.Item label="与老人关系">{currentRecord.relationship}</Descriptions.Item>
            <Descriptions.Item label="探视老人">{currentRecord.elderName}</Descriptions.Item>
            <Descriptions.Item label="预约时间">{formatDateTime(currentRecord.scheduledAt)}</Descriptions.Item>
            <Descriptions.Item label="人数">{currentRecord.visitorCount}人</Descriptions.Item>
            <Descriptions.Item label="探视目的" span={2}>{currentRecord.purpose}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusConfig[currentRecord.status]?.color}>
                {statusConfig[currentRecord.status]?.text}
              </Tag>
            </Descriptions.Item>
            {currentRecord.approvedBy && (
              <Descriptions.Item label="审批人">{currentRecord.approvedBy}</Descriptions.Item>
            )}
            {currentRecord.approvedAt && (
              <Descriptions.Item label="审批时间" span={2}>
                {formatDateTime(currentRecord.approvedAt)}
              </Descriptions.Item>
            )}
            {currentRecord.rejectReason && (
              <Descriptions.Item label="拒绝/改期原因" span={2}>
                {currentRecord.rejectReason}
              </Descriptions.Item>
            )}
            {currentRecord.actualArrival && (
              <Descriptions.Item label="实际到达">{formatDateTime(currentRecord.actualArrival)}</Descriptions.Item>
            )}
            {currentRecord.actualDeparture && (
              <Descriptions.Item label="实际离开">{formatDateTime(currentRecord.actualDeparture)}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="拒绝探视申请"
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={() => {
          message.success('已拒绝探视申请');
          setRejectVisible(false);
        }}
        width={480}
      >
        {currentRecord && (
          <div className="space-y-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="申请人">{currentRecord.applicantName}</Descriptions.Item>
              <Descriptions.Item label="探视老人">{currentRecord.elderName}</Descriptions.Item>
              <Descriptions.Item label="预约时间">{formatDateTime(currentRecord.scheduledAt)}</Descriptions.Item>
              <Descriptions.Item label="人数">{currentRecord.visitorCount}人</Descriptions.Item>
            </Descriptions>
            <Form layout="vertical">
              <Form.Item label="拒绝原因" required>
                <Input.TextArea rows={3} placeholder="请填写拒绝原因" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="改期探视申请"
        open={rescheduleVisible}
        onCancel={() => setRescheduleVisible(false)}
        onOk={() => {
          message.success('已建议改期');
          setRescheduleVisible(false);
        }}
        width={480}
      >
        {currentRecord && (
          <div className="space-y-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="申请人">{currentRecord.applicantName}</Descriptions.Item>
              <Descriptions.Item label="原预约时间">{formatDateTime(currentRecord.scheduledAt)}</Descriptions.Item>
            </Descriptions>
            <Form layout="vertical">
              <Form.Item label="建议时间" required>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="改期原因">
                <Input.TextArea rows={3} placeholder="请填写改期原因" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
