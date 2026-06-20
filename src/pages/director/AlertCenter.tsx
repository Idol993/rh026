import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Modal, Steps, Input, Upload, Select, Row, Col, DatePicker, Timeline, Statistic, message } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons';
import type { Alert, AlertNote } from '@/types';
import { mockAlerts } from '@/mock';
import { formatDateTime } from '@/utils/date';

const { RangePicker } = DatePicker;

const LEVEL_CONFIG: Record<number, { color: string; text: string }> = {
  1: { color: 'red', text: '1级-紧急' },
  2: { color: 'orange', text: '2级-重要' },
  3: { color: 'gold', text: '3级-一般' },
};

const TYPE_MAP: Record<string, string> = {
  fall: '跌倒', inactivity: '活动异常', out_of_bed: '离床超时',
  heart_rate: '心率异常', respiration: '呼吸异常', sos: 'SOS呼救',
  medication_miss: '漏药提醒', door: '门磁告警', smoke: '烟雾报警', gas: '燃气报警',
};

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  pending: { color: 'red', text: '待处理' },
  acknowledged: { color: 'orange', text: '已确认' },
  processing: { color: 'blue', text: '处理中' },
  resolved: { color: 'green', text: '已解决' },
  closed: { color: 'default', text: '已关闭' },
};

const HANDLE_STEPS = ['确认告警', '到场处理', '记录结果', '关闭工单'];

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filterLevel, setFilterLevel] = useState<number | undefined>();
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [handleStep, setHandleStep] = useState(0);
  const [handleNote, setHandleNote] = useState('');
  const [handlePhotos, setHandlePhotos] = useState<string[]>([]);

  const stats = useMemo(() => {
    const pending = alerts.filter(a => a.status === 'pending').length;
    const processing = alerts.filter(a => a.status === 'acknowledged' || a.status === 'processing').length;
    const todayResolved = alerts.filter(a => {
      if (a.status !== 'resolved' && a.status !== 'closed') return false;
      return a.resolvedAt ? new Date(a.resolvedAt).toDateString() === new Date().toDateString() : false;
    }).length;
    const totalHandled = alerts.filter(a => a.status === 'resolved' || a.status === 'closed').length;
    const totalAlerts = alerts.length;
    const rate = totalAlerts > 0 ? Math.round((totalHandled / totalAlerts) * 100) : 0;
    return { pending, processing, todayResolved, rate };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];
    if (filterLevel !== undefined) result = result.filter(a => a.level === filterLevel);
    if (filterType) result = result.filter(a => a.type === filterType);
    if (filterStatus) result = result.filter(a => a.status === filterStatus);
    result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
    });
    return result;
  }, [alerts, filterLevel, filterType, filterStatus]);

  const openHandleModal = (alert: Alert) => {
    setCurrentAlert(alert);
    const existingSteps = alert.handlingNotes.length;
    setHandleStep(Math.min(existingSteps, HANDLE_STEPS.length - 1));
    setHandleNote('');
    setHandlePhotos([]);
    setHandleModalOpen(true);
  };

  const submitHandleStep = () => {
    if (!currentAlert) return;
    const newNote: AlertNote = {
      id: `an-${Date.now()}`,
      userId: 'user1',
      userName: '张院长',
      timestamp: new Date().toISOString(),
      action: HANDLE_STEPS[handleStep],
      note: handleNote,
      photos: handlePhotos.length > 0 ? handlePhotos : undefined,
    };
    const nextStatusMap: Record<number, Alert['status']> = {
      0: 'acknowledged',
      1: 'processing',
      2: 'processing',
      3: 'resolved',
    };
    setAlerts(prev => prev.map(a => {
      if (a.id !== currentAlert.id) return a;
      return {
        ...a,
        status: nextStatusMap[handleStep] || a.status,
        handlingNotes: [...a.handlingNotes, newNote],
        resolvedAt: handleStep === 3 ? new Date().toISOString() : a.resolvedAt,
      };
    }));
    message.success(`${HANDLE_STEPS[handleStep]}完成`);
    if (handleStep < HANDLE_STEPS.length - 1) {
      setHandleStep(prev => prev + 1);
      setHandleNote('');
      setHandlePhotos([]);
    } else {
      setHandleModalOpen(false);
    }
  };

  const columns = [
    {
      title: '告警级别',
      dataIndex: 'level',
      width: 100,
      render: (level: number) => (
        <Tag color={LEVEL_CONFIG[level]?.color} style={{ fontWeight: 600 }}>
          {LEVEL_CONFIG[level]?.text}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => TYPE_MAP[type] || type,
    },
    {
      title: '老人姓名',
      dataIndex: 'elderName',
      width: 90,
    },
    {
      title: '房间号',
      key: 'location',
      width: 120,
      render: (_: unknown, record: Alert) => record.location || '-',
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={STATUS_MAP[status]?.color}>{STATUS_MAP[status]?.text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Alert) => (
        <Button
          type="link"
          size="small"
          disabled={record.status === 'resolved' || record.status === 'closed'}
          onClick={() => openHandleModal(record)}
        >
          处理
        </Button>
      ),
    },
  ];

  const timelineItems = currentAlert?.handlingNotes.map(note => ({
    color: note.action === '处理完成' ? 'green' : 'blue',
    children: (
      <div>
        <div className="font-medium text-sm">{note.action}</div>
        <div className="text-gray-500 text-xs">{note.userName} · {formatDateTime(note.timestamp)}</div>
        <div className="text-sm mt-1">{note.note}</div>
      </div>
    ),
  })) || [];

  const alertTypes = [...new Set(alerts.map(a => a.type))];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold m-0">预警中心</h2>
        <Button icon={<ExportOutlined />} onClick={() => message.success('导出功能开发中')}>导出</Button>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={stats.processing}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="今日已处理"
              value={stats.todayResolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="处置率" value={stats.rate} suffix="%" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small">
        <Row gutter={[8, 8]} className="mb-3">
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="告警级别"
              allowClear
              style={{ width: '100%' }}
              value={filterLevel}
              onChange={setFilterLevel}
              options={[
                { value: 1, label: '1级-紧急' },
                { value: 2, label: '2级-重要' },
                { value: 3, label: '3级-一般' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="告警类型"
              allowClear
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              options={alertTypes.map(t => ({ value: t, label: TYPE_MAP[t] || t }))}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.text }))}
            />
          </Col>
          <Col xs={12} sm={6} md={9}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
        </Row>

        <style>{`
          @keyframes pulse-row {
            0%, 100% { background-color: transparent; }
            50% { background-color: #fff1f0; }
          }
          .pending-row td { animation: pulse-row 2s ease-in-out infinite; }
        `}</style>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredAlerts}
          size="small"
          pagination={{ pageSize: 8, showTotal: t => `共 ${t} 条` }}
          rowClassName={(record) => record.status === 'pending' ? 'pending-row' : ''}
          scroll={{ x: 740 }}
        />
      </Card>

      <Modal
        title="告警处置"
        open={handleModalOpen}
        onCancel={() => setHandleModalOpen(false)}
        width={800}
        footer={null}
      >
        {currentAlert && (
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Card size="small" title="告警详情" className="mb-3">
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">告警级别：</span><Tag color={LEVEL_CONFIG[currentAlert.level]?.color}>{LEVEL_CONFIG[currentAlert.level]?.text}</Tag></div>
                  <div><span className="text-gray-500">告警类型：</span>{TYPE_MAP[currentAlert.type] || currentAlert.type}</div>
                  <div><span className="text-gray-500">老人姓名：</span>{currentAlert.elderName}</div>
                  <div><span className="text-gray-500">位置：</span>{currentAlert.location || '-'}</div>
                  <div><span className="text-gray-500">触发时间：</span>{formatDateTime(currentAlert.triggeredAt)}</div>
                  <div><span className="text-gray-500">描述：</span>{currentAlert.description}</div>
                  {currentAlert.assignedToName && <div><span className="text-gray-500">负责人：</span>{currentAlert.assignedToName}</div>}
                </div>
              </Card>

              <Card size="small" title="处置流程">
                <Steps current={handleStep} size="small" items={HANDLE_STEPS.map(s => ({ title: s }))} />
                <div className="mt-4 space-y-3">
                  <Input.TextArea
                    rows={3}
                    placeholder={`请输入${HANDLE_STEPS[handleStep]}记录...`}
                    value={handleNote}
                    onChange={e => setHandleNote(e.target.value)}
                  />
                  <Upload
                    beforeUpload={() => false}
                    showUploadList={false}
                    onChange={({ file }) => {
                      setHandlePhotos(prev => [...prev, file.name]);
                      message.success(`已选择: ${file.name}`);
                    }}
                  >
                    <Button icon={<UploadOutlined />} size="small">上传照片</Button>
                  </Upload>
                  {handlePhotos.length > 0 && (
                    <div className="text-xs text-gray-500">已选: {handlePhotos.join(', ')}</div>
                  )}
                  <Button type="primary" onClick={submitHandleStep} disabled={!handleNote.trim()}>
                    提交 - {HANDLE_STEPS[handleStep]}
                  </Button>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="处置时间轴">
                {timelineItems.length > 0 ? (
                  <Timeline items={timelineItems} />
                ) : (
                  <div className="text-gray-400 text-sm text-center py-4">暂无处置记录</div>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}
