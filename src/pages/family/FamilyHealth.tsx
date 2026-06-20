import { useState, useMemo } from 'react';
import { Card, Select, Segmented, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Elder, HealthData } from '@/types';
import { mockElders, mockHealthData } from '@/mock';

const relatedElders = mockElders.filter((e) => ['elder1', 'elder2'].includes(e.id));

export default function FamilyHealth() {
  const [selectedElderId, setSelectedElderId] = useState(relatedElders[0].id);
  const [period, setPeriod] = useState<'day' | 'week'>('day');

  const chartData = useMemo(() => {
    const data: HealthData[] = mockHealthData
      .filter((h) => h.elderId === selectedElderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (period === 'day') {
      return data.slice(-24).map((d) => ({
        time: new Date(d.timestamp).getHours() + ':00',
        heartRate: d.heartRate,
        systolic: d.bloodPressure.systolic,
        diastolic: d.bloodPressure.diastolic,
        bloodOxygen: d.bloodOxygen,
      }));
    }

    const byDay: Record<string, { heartRate: number[]; systolic: number[]; diastolic: number[]; bloodOxygen: number[] }> = {};
    data.forEach((d) => {
      const day = new Date(d.timestamp).toLocaleDateString();
      if (!byDay[day]) byDay[day] = { heartRate: [], systolic: [], diastolic: [], bloodOxygen: [] };
      byDay[day].heartRate.push(d.heartRate);
      byDay[day].systolic.push(d.bloodPressure.systolic);
      byDay[day].diastolic.push(d.bloodPressure.diastolic);
      byDay[day].bloodOxygen.push(d.bloodOxygen);
    });

    return Object.entries(byDay).slice(-7).map(([day, vals]) => ({
      time: day.slice(5),
      heartRate: Math.round(vals.heartRate.reduce((a, b) => a + b, 0) / vals.heartRate.length),
      systolic: Math.round(vals.systolic.reduce((a, b) => a + b, 0) / vals.systolic.length),
      diastolic: Math.round(vals.diastolic.reduce((a, b) => a + b, 0) / vals.diastolic.length),
      bloodOxygen: Math.round(vals.bloodOxygen.reduce((a, b) => a + b, 0) / vals.bloodOxygen.length),
    }));
  }, [selectedElderId, period]);

  const elder: Elder | undefined = mockElders.find((e) => e.id === selectedElderId);
  const latestHealth: HealthData | undefined = mockHealthData.find((h) => h.elderId === selectedElderId);

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      {relatedElders.length > 1 && (
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Select
            value={selectedElderId}
            onChange={setSelectedElderId}
            style={{ width: '100%' }}
            options={relatedElders.map((e) => ({ value: e.id, label: `${e.name}（${e.roomNumber || '居家'}）` }))}
          />
        </Card>
      )}

      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{elder?.name} 健康数据</span>
          <Segmented
            options={[{ value: 'day', label: '日报' }, { value: 'week', label: '周报' }]}
            value={period}
            onChange={(v) => setPeriod(v as 'day' | 'week')}
          />
        </div>
        <Row gutter={8}>
          {[
            { label: '心率', value: latestHealth ? `${latestHealth.heartRate}` : '-', unit: '次/分', color: '#ff4d4f' },
            { label: '血压', value: latestHealth ? `${latestHealth.bloodPressure.systolic}/${latestHealth.bloodPressure.diastolic}` : '-', unit: 'mmHg', color: '#1890ff' },
            { label: '血氧', value: latestHealth ? `${latestHealth.bloodOxygen}` : '-', unit: '%', color: '#52c41a' },
            { label: '体温', value: latestHealth ? `${latestHealth.temperature}` : '-', unit: '℃', color: '#faad14' },
          ].map((item) => (
            <Col span={6} key={item.label}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 12, color: '#888' }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{item.unit}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="心率趋势" size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip />
            <Line type="monotone" dataKey="heartRate" stroke="#ff4d4f" strokeWidth={2} dot={false} name="心率" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="血压趋势" size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#1890ff" strokeWidth={2} dot={false} name="收缩压" />
            <Line type="monotone" dataKey="diastolic" stroke="#52c41a" strokeWidth={2} dot={false} name="舒张压" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="血氧趋势" size="small" style={{ borderRadius: 12 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[90, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="bloodOxygen" stroke="#52c41a" strokeWidth={2} dot={false} name="血氧" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
