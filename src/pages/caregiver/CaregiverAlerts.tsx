import { useEffect, useMemo, useState } from 'react';
import { Card, Tag, Button, Modal, Steps, Checkbox, Select, Input, Collapse, Timeline, message, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAlertStore, ALERT_TYPE_MAP, ALERT_STATUS_MAP } from '@/stores/alertStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Alert } from '@/types';

const { TextArea } = Input;

const levelConfig: Record<number, { color: string; label: string; border: string; bg: string }> = {
  3: { color: 'red', label: '紧急', border: 'border-red-400', bg: 'bg-red-50' },
  2: { color: 'orange', label: '重要', border: 'border-orange-400', bg: 'bg-orange-50' },
  1: { color: 'gold', label: '一般', border: 'border-yellow-400', bg: 'bg-yellow-50' },
};

const stepTitles = ['到场确认', '处置措施', '老人状态', '记录结果'];
const measureOptions = ['现场查看', '呼叫家属', '协助复位', '测量体征', '拨打120', '其他']
  .map(v => ({ label: v, value: v }));
const elderStatusOptions = ['良好', '一般', '需送医', '已送医'].map(v => ({ label: v, value: v }));

export default function CaregiverAlerts() {
  const initIfNeeded = useAlertStore(s => s.initIfNeeded);
  const processStep = useAlertStore(s => s.processStep);
  const alerts = useAlertStore(s => s.alerts);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [measures, setMeasures] = useState<string[]>([]);
  const [elderStatus, setElderStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { initIfNeeded(); }, [initIfNeeded]);

  const todayAlerts = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return alerts.filter(a => dayjs(a.triggeredAt).format('YYYY-MM-DD') === today);
  }, [alerts]);
  const pendingList = useMemo(() => todayAlerts
    .filter(a => ['pending', 'acknowledged', 'processing'].includes(a.status))
    .sort((a, b) => b.level - a.level), [todayAlerts]);
  const resolvedList = useMemo(() => todayAlerts
    .filter(a => ['resolved', 'closed'].includes(a.status)), [todayAlerts]);
  const stats = useMemo(() => ({
    lv3: pendingList.filter(a => a.level === 3).length,
    lv2: pendingList.filter(a => a.level === 2).length,
    lv1: pendingList.filter(a => a.level === 1).length,
  }), [pendingList]);

  const openModal = (alert: Alert) => {
    setCurrentAlert(alert); setCurrentStep(0); setMeasures([]);
    setElderStatus(''); setNote(''); setModalOpen(true);
  };

  const handleNextStep = () => {
    if (!currentAlert || !user) return;
    const { name: userName, id: userId } = user;
    if (currentStep === 0) {
      processStep(currentAlert.id, 0, '到场确认', '已确认到场，开始处置', userName, userId);
      setCurrentStep(1); return;
    }
    if (currentStep === 1) {
      if (measures.length === 0) { message.warning('请至少选择一项处置措施'); return; }
      processStep(currentAlert.id, 1, '处置措施', `已执行：${measures.join('、')}`, userName, userId);
      setCurrentStep(2); return;
    }
    if (currentStep === 2) {
      if (!elderStatus) { message.warning('请选择老人状态'); return; }
      processStep(currentAlert.id, 2, '老人状态评估', `当前状态：${elderStatus}`, userName, userId);
      setCurrentStep(3); return;
    }
    if (currentStep === 3) {
      if (!note.trim()) { message.warning('请填写处理备注'); return; }
      processStep(currentAlert.id, 3, '关闭告警', note, userName, userId);
      message.success('告警已处理完成');
      setModalOpen(false); setCurrentAlert(null);
    }
  };

  const renderStepContent = () => {
    if (!currentAlert) return null;
    if (currentStep === 0) return (
      <div className="text-center py-4">
        <div className="text-gray-600 mb-4">请确认已到达 <span className="font-semibold text-lg">{currentAlert.elderName}</span> 位置</div>
        <div className="text-sm text-gray-500">{ALERT_TYPE_MAP[currentAlert.type]} · {currentAlert.location || '未知位置'}</div>
      </div>
    );
    if (currentStep === 1) return (
      <div>
        <div className="text-gray-600 mb-3">请选择已执行的处置措施（可多选）</div>
        <Checkbox.Group value={measures} onChange={(v) => setMeasures(v as string[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {measureOptions.map(o => <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>)}
        </Checkbox.Group>
      </div>
    );
    if (currentStep === 2) return (
      <div>
        <div className="text-gray-600 mb-3">请评估老人当前状态</div>
        <Select value={elderStatus} onChange={setElderStatus} placeholder="请选择"
          options={elderStatusOptions} style={{ width: '100%' }} size="large" />
      </div>
    );
    return (
      <div>
        <div className="text-gray-600 mb-3">请填写处理结果备注</div>
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          placeholder="请详细描述处理过程和结果..." />
      </div>
    );
  };

  const collapseItems = resolvedList.map(a => ({
    key: a.id,
    label: (
      <div className="flex items-center justify-between w-full pr-2">
        <div className="flex items-center gap-2">
          <Tag color={levelConfig[a.level].color}>{levelConfig[a.level].label}</Tag>
          <span className="font-medium">{a.elderName}</span>
          <span className="text-gray-500 text-sm">{ALERT_TYPE_MAP[a.type]}</span>
        </div>
        <span className="text-xs text-gray-400">{dayjs(a.resolvedAt || a.triggeredAt).format('HH:mm')}</span>
      </div>
    ),
    children: (
      <Timeline items={a.handlingNotes.map(n => ({
        color: n.action.includes('交接') ? 'blue' : 'green',
        children: (
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{n.action}</span>
              <span className="text-xs text-gray-400">{dayjs(n.timestamp).format('HH:mm:ss')}</span>
            </div>
            <div className="text-gray-600 mt-1">{n.note}</div>
            <div className="text-xs text-gray-400 mt-1">处理人：{n.userName}</div>
          </div>
        ),
      }))} />
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <span className="font-semibold text-base">告警中心</span>
          </div>
          <Button type="primary" size="small" onClick={() => navigate('/caregiver/handover?tab=alert')}>批量交班</Button>
        </div>
        <Row gutter={8} className="px-4 pb-3">
          <Col span={8}><div className="rounded-lg p-3 text-center bg-red-50">
            <div className="text-2xl font-bold text-red-600">{stats.lv3}</div>
            <div className="text-xs text-red-500 mt-1">紧急</div>
          </div></Col>
          <Col span={8}><div className="rounded-lg p-3 text-center bg-orange-50">
            <div className="text-2xl font-bold text-orange-600">{stats.lv2}</div>
            <div className="text-xs text-orange-500 mt-1">重要</div>
          </div></Col>
          <Col span={8}><div className="rounded-lg p-3 text-center bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">{stats.lv1}</div>
            <div className="text-xs text-yellow-600 mt-1">一般</div>
          </div></Col>
        </Row>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <div className="mb-2 text-sm text-gray-500">待处理 ({pendingList.length})</div>
        <div className="space-y-3 mb-6">
          {pendingList.map(a => {
            const lc = levelConfig[a.level];
            return (
              <Card key={a.id} size="small" className={`rounded-xl border-l-4 ${lc.border} ${lc.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{ALERT_TYPE_MAP[a.type]}</div>
                    <div className="text-sm text-gray-600 mt-1">{a.elderName} · {a.location || '未定位'}</div>
                  </div>
                  <Tag color={lc.color}>{lc.label}</Tag>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {ALERT_STATUS_MAP[a.status]} · 触发 {dayjs(a.triggeredAt).format('MM-DD HH:mm')}
                </div>
                <Button type="primary" danger={a.level === 3} block size="large" onClick={() => openModal(a)}>立即处理</Button>
              </Card>
            );
          })}
          {pendingList.length === 0 && (
            <div className="text-center text-gray-400 py-10">✓ 今日暂无待处理告警</div>
          )}
        </div>

        {resolvedList.length > 0 && (
          <>
            <div className="mb-2 text-sm text-gray-500">已处理 ({resolvedList.length})</div>
            <Collapse items={collapseItems} accordion className="bg-white rounded-xl" size="small" />
          </>
        )}
      </div>

      <Modal
        title={currentAlert ? `${currentAlert.elderName} - ${ALERT_TYPE_MAP[currentAlert.type]}` : '处置告警'}
        open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>上一步</Button>,
          <Button key="next" type="primary" onClick={handleNextStep}>
            {currentStep === 3 ? '完成并关闭' : '下一步'}
          </Button>,
        ]}
        width={420} destroyOnClose
      >
        <Steps current={currentStep} size="small" items={stepTitles.map(t => ({ title: t }))} className="mb-6" />
        {renderStepContent()}
      </Modal>
    </div>
  );
}
