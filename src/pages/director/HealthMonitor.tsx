import { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Card, Row, Col, Tag } from 'antd';
import {
  HeartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
  HomeOutlined,
  AimOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import type { HealthData } from '@/types';
import { mockElders, mockHealthData } from '@/mock';
import { formatDateTime } from '@/utils/date';

const STATUS_COLORS: Record<string, string> = {
  normal: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d',
};

const getVitalStatus = (value: number, min: number, max: number) => {
  if (value < min * 0.9 || value > max * 1.1) return 'danger';
  if (value < min || value > max) return 'warning';
  return 'normal';
};

interface VitalCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: string;
  range?: string;
}

function VitalCard({ title, value, unit, icon, status, range }: VitalCardProps) {
  return (
    <Card
      size="small"
      className="text-center"
      style={{ borderLeft: `3px solid ${STATUS_COLORS[status]}` }}
    >
      <div className="text-gray-500 text-xs mb-1">{title}</div>
      <div className="flex items-center justify-center gap-1">
        <span style={{ color: STATUS_COLORS[status], fontSize: 28, fontWeight: 700 }}>
          {value}
        </span>
        <span className="text-gray-400 text-xs">{unit}</span>
      </div>
      <div className="flex items-center justify-center gap-2 mt-1">
        {icon}
        {range && <span className="text-gray-400 text-xs">{range}</span>}
        <Tag color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'} style={{ fontSize: 10 }}>
          {status === 'normal' ? '正常' : status === 'warning' ? '注意' : '异常'}
        </Tag>
      </div>
    </Card>
  );
}

export default function HealthMonitor() {
  const [selectedElderId, setSelectedElderId] = useState(mockElders[0].id);
  const [realtimeData, setRealtimeData] = useState<HealthData | null>(null);

  const selectedElder = useMemo(
    () => mockElders.find(e => e.id === selectedElderId),
    [selectedElderId]
  );

  const elderHealthHistory = useMemo(
    () => mockHealthData
      .filter(d => d.elderId === selectedElderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [selectedElderId]
  );

  const trendData = useMemo(() => elderHealthHistory.map(d => ({
    time: new Date(d.timestamp).getHours().toString().padStart(2, '0') + ':00',
    heartRate: d.heartRate,
    systolic: d.bloodPressure.systolic,
    diastolic: d.bloodPressure.diastolic,
    bloodOxygen: d.bloodOxygen,
    temperature: d.temperature,
    activityLevel: d.activityLevel,
    hrAbnormal: d.heartRate < 60 || d.heartRate > 100,
  })), [elderHealthHistory]);

  const latestData = useMemo(
    () => elderHealthHistory[elderHealthHistory.length - 1],
    [elderHealthHistory]
  );

  const sleepData = useMemo(() => {
    const records = elderHealthHistory.filter(d => d.inBed);
    let deep = 0, light = 0, awake = 0;
    records.forEach(d => {
      if (d.sleepStatus === 'deep') deep++;
      else if (d.sleepStatus === 'light') light++;
      else awake++;
    });
    return [
      { name: '深睡', value: deep, fill: '#1a365d' },
      { name: '浅睡', value: light, fill: '#4299e1' },
      { name: '清醒', value: awake, fill: '#fbd38d' },
    ];
  }, [elderHealthHistory]);

  const activityStats = useMemo(() => {
    const hours = elderHealthHistory.map(d => ({
      time: new Date(d.timestamp).getHours().toString().padStart(2, '0') + ':00',
      activity: d.activityLevel,
      level: d.activityLevel < 20 ? '低' : d.activityLevel < 50 ? '中' : '高',
    }));
    return hours;
  }, [elderHealthHistory]);

  const initRealtime = useCallback(() => {
    if (latestData) {
      setRealtimeData({ ...latestData });
    }
  }, [latestData]);

  useEffect(() => {
    initRealtime();
  }, [initRealtime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          heartRate: Math.max(40, Math.min(140, prev.heartRate + Math.floor(Math.random() * 5) - 2)),
          bloodPressure: {
            systolic: Math.max(70, Math.min(180, prev.bloodPressure.systolic + Math.floor(Math.random() * 5) - 2)),
            diastolic: Math.max(40, Math.min(110, prev.bloodPressure.diastolic + Math.floor(Math.random() * 3) - 1)),
          },
          bloodOxygen: Math.max(88, Math.min(100, prev.bloodOxygen + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.7 ? 1 : 0))),
          temperature: Math.round((prev.temperature + (Math.random() * 0.2 - 0.1)) * 10) / 10,
          activityLevel: Math.max(0, Math.min(100, prev.activityLevel + Math.floor(Math.random() * 10) - 5)),
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const heartRateStatus = realtimeData ? getVitalStatus(realtimeData.heartRate, 60, 100) : 'normal';
  const bpSysStatus = realtimeData ? getVitalStatus(realtimeData.bloodPressure.systolic, 90, 140) : 'normal';
  const bpDiaStatus = realtimeData ? getVitalStatus(realtimeData.bloodPressure.diastolic, 60, 90) : 'normal';
  const bpStatus = bpSysStatus === 'danger' || bpDiaStatus === 'danger' ? 'danger' : bpSysStatus === 'warning' || bpDiaStatus === 'warning' ? 'warning' : 'normal';
  const boStatus = realtimeData ? getVitalStatus(realtimeData.bloodOxygen, 95, 100) : 'normal';
  const tempStatus = realtimeData ? getVitalStatus(realtimeData.temperature, 36.0, 37.3) : 'normal';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold m-0">健康监测中心</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">
            {realtimeData ? formatDateTime(realtimeData.timestamp) : '-'}
          </span>
          <Select
            showSearch
            value={selectedElderId}
            onChange={setSelectedElderId}
            style={{ width: 200 }}
            placeholder="选择老人"
            optionFilterProp="label"
            options={mockElders.map(e => ({
              value: e.id,
              label: `${e.name} - ${e.roomNumber || '居家'}${e.bedNumber ? ' ' + e.bedNumber + '床' : ''}`,
            }))}
          />
        </div>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={8} md={4}>
          <VitalCard
            title="心率"
            value={realtimeData?.heartRate.toString() ?? '-'}
            unit="bpm"
            icon={<HeartOutlined style={{ color: '#f5222d' }} />}
            status={heartRateStatus}
            range="60-100"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <VitalCard
            title="血压"
            value={realtimeData ? `${realtimeData.bloodPressure.systolic}/${realtimeData.bloodPressure.diastolic}` : '-'}
            unit="mmHg"
            icon={<ThunderboltOutlined style={{ color: '#faad14' }} />}
            status={bpStatus}
            range="90-140/60-90"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <VitalCard
            title="血氧"
            value={realtimeData?.bloodOxygen.toString() ?? '-'}
            unit="%"
            icon={<ExperimentOutlined style={{ color: '#1890ff' }} />}
            status={boStatus}
            range="≥95"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <VitalCard
            title="体温"
            value={realtimeData?.temperature.toFixed(1) ?? '-'}
            unit="°C"
            icon={<FireOutlined style={{ color: '#fa8c16' }} />}
            status={tempStatus}
            range="36.0-37.3"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center">
            <div className="text-gray-500 text-xs mb-1">在床状态</div>
            <div className="flex items-center justify-center gap-1">
              <HomeOutlined style={{ fontSize: 20, color: realtimeData?.inBed ? '#52c41a' : '#999' }} />
              <Tag color={realtimeData?.inBed ? 'green' : 'default'} style={{ fontSize: 13 }}>
                {realtimeData?.inBed ? '在床' : '离床'}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center">
            <div className="text-gray-500 text-xs mb-1">活动量</div>
            <div className="flex items-center justify-center gap-1">
              <AimOutlined style={{ fontSize: 20, color: '#722ed1' }} />
              <Tag color={
                (realtimeData?.activityLevel ?? 0) < 20 ? 'default' :
                (realtimeData?.activityLevel ?? 0) < 50 ? 'blue' : 'green'
              } style={{ fontSize: 13 }}>
                {(realtimeData?.activityLevel ?? 0) < 20 ? '低' : (realtimeData?.activityLevel ?? 0) < 50 ? '中' : '高'}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Card title="心率趋势（24小时）" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 140]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceArea y1={60} y2={100} fill="#52c41a" fillOpacity={0.06} />
                <ReferenceLine y={60} stroke="#faad14" strokeDasharray="3 3" label={{ value: '60', position: 'left', fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#faad14" strokeDasharray="3 3" label={{ value: '100', position: 'left', fontSize: 10 }} />
                <Line type="monotone" dataKey="heartRate" stroke="#f5222d" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="血压趋势（24小时）" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 180]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine y={90} stroke="#faad14" strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine y={140} stroke="#faad14" strokeDasharray="3 3" strokeOpacity={0.5} />
                <Legend />
                <Line type="monotone" dataKey="systolic" name="收缩压" stroke="#fa8c16" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="diastolic" name="舒张压" stroke="#13c2c2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="血氧趋势" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[88, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine y={95} stroke="#f5222d" strokeDasharray="3 3" label={{ value: '95%', fontSize: 10, position: 'left' }} />
                <Line type="monotone" dataKey="bloodOxygen" stroke="#1890ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="体温趋势" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[35.5, 38.5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceArea y1={36.0} y2={37.3} fill="#52c41a" fillOpacity={0.06} />
                <ReferenceLine y={37.3} stroke="#f5222d" strokeDasharray="3 3" label={{ value: '37.3', fontSize: 10, position: 'left' }} />
                <Line type="monotone" dataKey="temperature" stroke="#13c2c2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Card title="睡眠分析" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="时长(小时)" radius={[4, 4, 0, 0]}>
                  {sleepData.map((entry, idx) => (
                    <rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="活动量统计" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="activity" name="活动量" fill="#722ed1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {selectedElder && (
        <Card size="small" className="text-gray-500 text-xs">
          当前监测：{selectedElder.name} | 房间：{selectedElder.roomNumber || '居家'} | 护理等级：{selectedElder.careLevel} | 慢性病：{selectedElder.chronicDiseases.join('、')}
        </Card>
      )}
    </div>
  );
}
