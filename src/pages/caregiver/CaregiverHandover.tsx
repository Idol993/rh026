import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Input, Select, Tabs, Tag, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useAlertStore, ALERT_TYPE_MAP, ALERT_STATUS_MAP,
  CARE_SERVICE_STATUS_MAP, MED_STATUS_MAP,
} from '@/stores/alertStore';
import { useCareServiceStore } from '@/stores/careServiceStore';
import { useMedicationStore } from '@/stores/medicationStore';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';
import type { HandoverItem } from '@/types';

const { TextArea } = Input;

const CARETAKER_OPTIONS = [
  { value: 'cg-zhao', label: '赵护工' },
  { value: 'cg-qian', label: '钱护工' },
  { value: 'cg-sun', label: '孙护工' },
  { value: 'ns-li', label: '李护士' },
];

export default function CaregiverHandover() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore(s => s.user);

  const initAlerts = useAlertStore(s => s.initIfNeeded);
  const getTodayAlerts = useAlertStore(s => s.getTodayAlerts);
  const markHandover = useAlertStore(s => s.markHandover);

  const initServices = useCareServiceStore(s => s.initIfNeeded);
  const getTodayServices = useCareServiceStore(s => s.getTodayServices);

  const initMeds = useMedicationStore(s => s.initIfNeeded);
  const getTodayRecords = useMedicationStore(s => s.getTodayRecords);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'service');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [shiftNote, setShiftNote] = useState('');
  const [toCaregiver, setToCaregiver] = useState('');

  useEffect(() => {
    initAlerts(); initServices(); initMeds();
  }, [initAlerts, initServices, initMeds]);

  const services = useMemo(() =>
    getTodayServices().filter(s => ['scheduled', 'in_progress', 'missed'].includes(s.status)),
    [getTodayServices]);

  const medications = useMemo(() =>
    getTodayRecords().filter(r => ['scheduled', 'missed', 'refused'].includes(r.status)),
    [getTodayRecords]);

  const alerts = useMemo(() =>
    getTodayAlerts().filter(a => ['pending', 'acknowledged', 'processing'].includes(a.status)),
    [getTodayAlerts]);

  const allServiceSelected = services.length > 0 && selectedServices.length === services.length;
  const allMedSelected = medications.length > 0 && selectedMeds.length === medications.length;
  const allAlertSelected = alerts.length > 0 && selectedAlerts.length === alerts.length;

  const toggleServiceAll = () =>
    setSelectedServices(allServiceSelected ? [] : services.map(s => s.id));
  const toggleMedAll = () =>
    setSelectedMeds(allMedSelected ? [] : medications.map(m => m.id));
  const toggleAlertAll = () =>
    setSelectedAlerts(allAlertSelected ? [] : alerts.map(a => a.id));

  const buildItems = (): HandoverItem[] => {
    const items: HandoverItem[] = [];
    services.filter(s => selectedServices.includes(s.id)).forEach(s => {
      items.push({
        type: 'service', refId: s.id,
        title: s.type, elderName: s.elderName,
        detail: `计划 ${dayjs(s.scheduledAt).format('HH:mm')}`,
        status: CARE_SERVICE_STATUS_MAP[s.status],
      });
    });
    medications.filter(m => selectedMeds.includes(m.id)).forEach(m => {
      items.push({
        type: 'medication', refId: m.id,
        title: m.medicationName, elderName: m.elderName || '',
        detail: `计划 ${dayjs(m.scheduledTime).format('HH:mm')}`,
        status: MED_STATUS_MAP[m.status],
      });
    });
    alerts.filter(a => selectedAlerts.includes(a.id)).forEach(a => {
      items.push({
        type: 'alert', refId: a.id,
        title: ALERT_TYPE_MAP[a.type], elderName: a.elderName || '',
        detail: `触发 ${dayjs(a.triggeredAt).format('HH:mm')}`,
        status: ALERT_STATUS_MAP[a.status],
      });
    });
    return items;
  };

  const totalCount = selectedServices.length + selectedMeds.length + selectedAlerts.length;

  const handleSubmit = () => {
    if (!user) return;
    if (totalCount === 0) {
      message.warning('请至少勾选一项待交班内容');
      return;
    }
    if (!shiftNote.trim()) {
      message.warning('请填写交班说明');
      return;
    }
    if (!toCaregiver) {
      message.warning('请选择接班人');
      return;
    }
    const toName = CARETAKER_OPTIONS.find(o => o.value === toCaregiver)?.label || '';
    const items = buildItems();
    markHandover({
      toCaregiverId: toCaregiver,
      toCaregiverName: toName,
      shiftNote: shiftNote.trim(),
      items,
    }, user.id, user.name);
    message.success('交班成功，已通知接班人');
    navigate('/caregiver/home');
  };

  const TabHeader = ({
    allSelected, onToggleAll, count, selected,
  }: { allSelected: boolean; onToggleAll: () => void; count: number; selected: number }) => (
    <div className="flex items-center justify-between py-2 mb-2">
      <Checkbox checked={allSelected} onChange={onToggleAll} disabled={count === 0}>
        <span className="text-sm text-gray-600">全选</span>
      </Checkbox>
      <span className="text-xs text-gray-400">已选 {selected}/{count}</span>
    </div>
  );

  const ServiceCard = ({ id, elderName, type, scheduledAt, status }: any) => (
    <Checkbox value={id} className="w-full mb-2">
      <Card size="small" className="rounded-lg ml-2 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{type}</div>
            <div className="text-xs text-gray-500 mt-1">{elderName} · {dayjs(scheduledAt).format('HH:mm')}</div>
          </div>
          <Tag color={status === 'missed' ? 'red' : status === 'in_progress' ? 'blue' : 'default'}>
            {CARE_SERVICE_STATUS_MAP[status]}
          </Tag>
        </div>
      </Card>
    </Checkbox>
  );

  const MedCard = ({ id, elderName, medicationName, scheduledTime, status }: any) => (
    <Checkbox value={id} className="w-full mb-2">
      <Card size="small" className="rounded-lg ml-2 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{medicationName}</div>
            <div className="text-xs text-gray-500 mt-1">{elderName} · {dayjs(scheduledTime).format('HH:mm')}</div>
          </div>
          <Tag color={status === 'missed' ? 'red' : status === 'refused' ? 'orange' : 'default'}>
            {MED_STATUS_MAP[status]}
          </Tag>
        </div>
      </Card>
    </Checkbox>
  );

  const AlertCard = ({ id, elderName, type, triggeredAt, status, level }: any) => (
    <Checkbox value={id} className="w-full mb-2">
      <Card size="small" className={`rounded-lg ml-2 border-l-4 ${level === 3 ? 'border-red-400' : level === 2 ? 'border-orange-400' : 'border-yellow-400'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{ALERT_TYPE_MAP[type]}</div>
            <div className="text-xs text-gray-500 mt-1">{elderName} · {dayjs(triggeredAt).format('HH:mm')}</div>
          </div>
          <Tag color={ALERT_STATUS_MAP[status] === '待处理' ? 'red' : ALERT_STATUS_MAP[status] === '处理中' ? 'blue' : 'orange'}>
            {ALERT_STATUS_MAP[status]}
          </Tag>
        </div>
      </Card>
    </Checkbox>
  );

  const tabItems = [
    {
      key: 'service',
      label: `服务 (${services.length})`,
      children: (
        <div>
          <TabHeader allSelected={allServiceSelected} onToggleAll={toggleServiceAll}
            count={services.length} selected={selectedServices.length} />
          <Checkbox.Group
            value={selectedServices}
            onChange={(v) => setSelectedServices(v as string[])}
            style={{ width: '100%' }}
          >
            {services.length === 0
              ? <div className="text-center text-gray-400 py-10">暂无待交班服务</div>
              : services.map(s => <ServiceCard key={s.id} {...s} />)}
          </Checkbox.Group>
        </div>
      ),
    },
    {
      key: 'medication',
      label: `服药 (${medications.length})`,
      children: (
        <div>
          <TabHeader allSelected={allMedSelected} onToggleAll={toggleMedAll}
            count={medications.length} selected={selectedMeds.length} />
          <Checkbox.Group
            value={selectedMeds}
            onChange={(v) => setSelectedMeds(v as string[])}
            style={{ width: '100%' }}
          >
            {medications.length === 0
              ? <div className="text-center text-gray-400 py-10">暂无待交班服药</div>
              : medications.map(m => <MedCard key={m.id} {...m} />)}
          </Checkbox.Group>
        </div>
      ),
    },
    {
      key: 'alert',
      label: `告警 (${alerts.length})`,
      children: (
        <div>
          <TabHeader allSelected={allAlertSelected} onToggleAll={toggleAlertAll}
            count={alerts.length} selected={selectedAlerts.length} />
          <Checkbox.Group
            value={selectedAlerts}
            onChange={(v) => setSelectedAlerts(v as string[])}
            style={{ width: '100%' }}
          >
            {alerts.length === 0
              ? <div className="text-center text-gray-400 py-10">暂无待交班告警</div>
              : alerts.map(a => <AlertCard key={a.id} {...a} />)}
          </Checkbox.Group>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <span className="font-semibold text-base">批量交班</span>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          className="bg-white rounded-xl p-3"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">交班说明 <span className="text-red-500">*</span></div>
            <TextArea
              value={shiftNote}
              onChange={(e) => setShiftNote(e.target.value)}
              rows={3}
              placeholder="请描述待交接事项的背景和注意事项..."
              maxLength={500}
              showCount
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">接班人 <span className="text-red-500">*</span></div>
            <Select
              value={toCaregiver}
              onChange={setToCaregiver}
              placeholder="请选择接班人"
              options={CARETAKER_OPTIONS}
              style={{ width: '100%' }}
              size="large"
            />
          </div>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleSubmit}
            disabled={totalCount === 0}
          >
            确认交班（共 {totalCount} 项）
          </Button>
        </div>
      </div>
    </div>
  );
}
